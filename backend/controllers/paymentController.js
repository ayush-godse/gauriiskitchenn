const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Order = require("../model/order");
const Product = require("../model/product");
const sendOrderReceipt = require("../utils/sendOrderReceipt");

const FREE_DELIVERY_THRESHOLD = 1000;
const DELIVERY_FEE = 50;

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const error = new Error("Razorpay is not configured on the server.");
    error.status = 503;
    throw error;
  }
  return {
    keyId,
    client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
  };
};

const getCartDetails = async (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.some((item) => !item || typeof item !== "object")) {
    const error = new Error("Add at least one item to your cart.");
    error.status = 400;
    throw error;
  }

  const normalizedItems = items.map(({ product, quantity, sizeGrams }) => ({
    product: String(product || ""),
    quantity: Number(quantity),
    sizeGrams: Number(sizeGrams),
  }));
  if (
    normalizedItems.some(({ product, quantity }) =>
      !mongoose.Types.ObjectId.isValid(product) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) ||
    normalizedItems.some(({ sizeGrams }) => ![500, 1000].includes(sizeGrams)) ||
    new Set(normalizedItems.map(({ product, sizeGrams }) => `${product}:${sizeGrams}`)).size !== normalizedItems.length
  ) {
    const error = new Error("Cart items are invalid.");
    error.status = 400;
    throw error;
  }

  const products = await Product.find({
    _id: { $in: normalizedItems.map(({ product }) => product) },
  });
  const productById = new Map(products.map((product) => [String(product._id), product]));
  const uniqueProductIds = new Set(normalizedItems.map(({ product }) => product));
  if (products.length !== uniqueProductIds.size) {
    const error = new Error("One or more products are no longer available.");
    error.status = 400;
    throw error;
  }

  const stockRequiredByProduct = new Map();
  normalizedItems.forEach(({ product, quantity, sizeGrams }) => {
    stockRequiredByProduct.set(
      product,
      (stockRequiredByProduct.get(product) || 0) + quantity * sizeGrams
    );
  });
  for (const [productId, requiredStockGrams] of stockRequiredByProduct) {
    const productData = productById.get(productId);
    if (requiredStockGrams > productData.stock) {
      const error = new Error(`${productData.name} does not have enough stock.`);
      error.status = 400;
      throw error;
    }
  }

  const orderProducts = normalizedItems.map(({ product, quantity, sizeGrams }) => {
    const productData = productById.get(product);
    return {
      product: productData._id,
      quantity,
      sizeGrams,
      price: productData.price * (sizeGrams / 500),
    };
  });
  const receiptItems = normalizedItems.map(({ product, quantity, sizeGrams }) => {
    const productData = productById.get(product);
    return {
      name: productData.name,
      quantity,
      sizeGrams,
      price: productData.price * (sizeGrams / 500),
    };
  });
  const totalAmount = orderProducts.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee = totalAmount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const amountInPaise = Math.round((totalAmount + deliveryFee) * 100);
  if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
    const error = new Error("The cart total must be at least ₹1.");
    error.status = 400;
    throw error;
  }

  const canonicalItems = normalizedItems
    .sort((a, b) => a.product.localeCompare(b.product) || a.sizeGrams - b.sizeGrams);
  const cartHash = crypto.createHash("sha256")
    .update(JSON.stringify(canonicalItems))
    .digest("hex");

  return { orderProducts, amountInPaise, cartHash, receiptItems, deliveryFee };
};

const sendReceiptIfNeeded = async (order, customer, receiptItems) => {
  if (order.receiptEmailSentAt || !customer?.email) {
    return Boolean(order.receiptEmailSentAt);
  }
  try {
    await sendOrderReceipt(order, customer, receiptItems);
    order.receiptEmailSentAt = new Date();
    await order.save();
    return true;
  } catch (error) {
    console.error("Order receipt email failed:", error.code || "EMAIL_ERROR");
    return false;
  }
};

const reserveStock = async (orderProducts) => {
  const reserved = [];
  try {
    for (const item of orderProducts) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity * item.sizeGrams } },
        { $inc: { stock: -(item.quantity * item.sizeGrams) } },
        { new: true }
      );
      if (!product) {
        const error = new Error("Some items just sold out. Refresh your cart and try again.");
        error.status = 409;
        throw error;
      }
      reserved.push({ productId: product._id, quantity: item.quantity * item.sizeGrams });
    }
    return reserved;
  } catch (error) {
    await restoreStock(reserved);
    throw error;
  }
};

const restoreStock = async (reserved) => {
  await Promise.all(reserved.map(({ productId, quantity }) =>
    Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
  ));
};

const createOrder = async (req, res) => {
  try {
    const { keyId, client } = getRazorpayClient();
    const { amountInPaise, cartHash } = await getCartDetails(req.body.items);
    const order = await client.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
      notes: {
        userId: String(req.user._id),
        cartHash,
      },
    });
    res.status(200).json({ ...order, keyId });
  } catch (error) {
    console.error("Razorpay order creation failed:", error.message);
    res.status(error.status || 502).json({ message: error.status ? error.message : "Could not create the Razorpay order." });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment verification details are incomplete." });
    }

    const { client } = getRazorpayClient();
    const { orderProducts, amountInPaise, cartHash, receiptItems, deliveryFee } = await getCartDetails(req.body.items);
    const order = await client.orders.fetch(razorpay_order_id);
    const payment = await client.payments.fetch(razorpay_payment_id);
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ message: "Payment signature is invalid." });
    }
    if (
      order.notes?.userId !== String(req.user._id) ||
      order.notes?.cartHash !== cartHash ||
      order.amount !== amountInPaise ||
      order.currency !== "INR" ||
      payment.order_id !== order.id ||
      payment.amount !== amountInPaise ||
      payment.currency !== "INR" ||
      !["captured", "authorized"].includes(payment.status)
    ) {
      return res.status(400).json({ message: "Payment does not match this account and cart." });
    }
    if (payment.status === "authorized") {
      const capturedPayment = await client.payments.capture(
        razorpay_payment_id,
        amountInPaise,
        "INR"
      );
      if (capturedPayment.status !== "captured") {
        return res.status(409).json({ message: "Payment has not been captured." });
      }
    }
    if (!req.body.address?.FullName || !req.body.address?.Street || !req.body.address?.Area || !req.body.address?.City || !/^[0-9]{10}$/.test(req.body.address?.phone || "")) {
      return res.status(400).json({ message: "Enter your full name, street address, area, city, and a valid 10-digit phone number." });
    }

    const existingOrder = await Order.findOne({ paymentId: razorpay_payment_id });
    if (existingOrder) {
      const receiptSent = await sendReceiptIfNeeded(existingOrder, req.user, receiptItems);
      return res.json({
        message: "Payment verified and order saved.",
        receiptEmailSent: receiptSent,
        order: existingOrder,
      });
    }

    const reservedStock = await reserveStock(orderProducts);
    let savedOrder;
    try {
      savedOrder = await Order.create({
        user: req.user._id,
        products: orderProducts,
        totalAmount: amountInPaise / 100,
        deliveryFee,
        address: req.body.address,
        paymentId: razorpay_payment_id,
        paymentStatus: "Paid",
      });
    } catch (error) {
      await restoreStock(reservedStock);
      const duplicateOrder = await Order.findOne({ paymentId: razorpay_payment_id });
      if (duplicateOrder) {
        const receiptSent = await sendReceiptIfNeeded(duplicateOrder, req.user, receiptItems);
        return res.json({
          message: "Payment verified and order saved.",
          receiptEmailSent: receiptSent,
          order: duplicateOrder,
        });
      }
      throw error;
    }
    const receiptEmailSent = await sendReceiptIfNeeded(savedOrder, req.user, receiptItems);
    res.json({ message: "Payment verified and order saved.", receiptEmailSent, order: savedOrder });
  } catch (error) {
    console.error("Razorpay payment verification failed:", error.message);
    res.status(error.status || 502).json({ message: error.status ? error.message : "Could not verify payment with Razorpay." });
  }
};

module.exports = { createOrder, verifyPayment };

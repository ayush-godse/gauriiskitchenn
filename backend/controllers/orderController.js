const Order = require("../model/order.js");
const sendEmail = require("../utils/sendEmail.js");
const sendOrderReceipt = require("../utils/sendOrderReceipt.js");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { user, products, totalAmount, address, paymentId } = req.body;
    const order = new Order({
      user: req.user._id,
      products,
      totalAmount,
      address: req.body.address,
      paymentId: req.body.paymentId
    });
    await order.save();
    await order.populate("products.product");
    try {
      await sendOrderReceipt(order, req.user, order.products.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })));
      order.receiptEmailSentAt = new Date();
      await order.save();
    } catch (emailError) {
      console.error("Order receipt email failed:", emailError.code || "EMAIL_ERROR");
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "-password -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt")
      .populate("products.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders for the signed-in user
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({user: req.user._id})
      .populate("user", "-password -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt")
      .populate("products.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "-password -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt")
      .populate("products.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "email");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = req.body.status;
    await order.save();
    await sendEmail(order.user.email, "Order Status Updated", `Your order status has been updated to ${order.status}.`);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "email");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.deleteOne();
    await sendEmail(order.user.email, "Order Deleted", "Your order has been deleted.");
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createOrder,
  getAllOrders,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
const Order = require("../model/order.js");
const sendEmail = require("../utils/sendEmail.js");

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
    const orderQuery = req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };
    const order = await Order.findOne(orderQuery)
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
    if (order.user?.email) {
      await sendEmail(order.user.email, "Order Status Updated", `Your order status has been updated to ${order.status}.`);
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDeliveryDate = async (req, res) => {
  try {
    const { estimatedDeliveryAt } = req.body;
    const parsedDeliveryDate = new Date(`${estimatedDeliveryAt}T12:00:00.000Z`);
    if (
      typeof estimatedDeliveryAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(estimatedDeliveryAt) ||
      Number.isNaN(parsedDeliveryDate.getTime()) ||
      parsedDeliveryDate.toISOString().slice(0, 10) !== estimatedDeliveryAt
    ) {
      return res.status(400).json({ message: "Enter a valid delivery date." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.estimatedDeliveryAt = parsedDeliveryDate;
    await order.save();
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
    if (order.user?.email) {
      await sendEmail(order.user.email, "Order Deleted", "Your order has been deleted.");
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getAllOrders,
  getOrders,
  getOrderById,
  updateOrder,
  updateDeliveryDate,
  deleteOrder,
};
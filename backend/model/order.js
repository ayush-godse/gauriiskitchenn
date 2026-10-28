const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId,ref : "User",required: true},
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true,min:1 },
            sizeGrams: { type: Number, enum: [500, 1000], required: true, default: 500 },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    address: { 
        FullName: { type: String, required: true },
        Street: { type: String, required: true },
        Area: { type: String, required: true },
        City: { type: String, required: true },
        phone: { type: String, required: true, match: /^[0-9]{10}$/ }
    },
    paymentId: { type: String},
    paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    receiptEmailSentAt: { type: Date },
    status: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Completed", "shipped", "Cancelled"], default: "Pending" },
    estimatedDeliveryAt: {
        type: Date,
        default: () => new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    }
}, { timestamps: true })
module.exports = mongoose.model("Order", orderSchema);
   

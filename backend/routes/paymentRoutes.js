const express= require("express");
const router= express.Router();
const {optionalProtect}= require("../middilewers/authMiddleware");
const {createOrder,verifyPayment}= require("../controllers/paymentController");

router.post("/create-order",optionalProtect,createOrder);
router.post("/verify-payment",optionalProtect,verifyPayment);
module.exports=router;
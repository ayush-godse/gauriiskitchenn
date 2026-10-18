const express= require("express"); 
const router= express.Router();
const {protect}= require("../middilewers/authMiddleware");
const {admin}=require("../middilewers/adminMiddleware");
const {createOrder,getAllOrders,getOrders,updateOrder,getOrderById,deleteOrder}= require("../controllers/orderController");

router.route("/").get(protect,admin,getAllOrders).post(protect,createOrder);
router.route("/myorders").get(protect,getOrders);
router.route("/:id").get(protect,getOrderById);
router.route("/:id/status").put(protect,admin,updateOrder).delete(protect,admin,deleteOrder); 
module.exports=router;

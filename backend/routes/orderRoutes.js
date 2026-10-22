const express= require("express"); 
const router= express.Router();
const {protect}= require("../middilewers/authMiddleware");
const {admin}=require("../middilewers/adminMiddleware");
const {getAllOrders,getOrders,updateOrder,updateDeliveryDate,getOrderById,deleteOrder}= require("../controllers/orderController");

router.route("/").get(protect,admin,getAllOrders);
router.route("/myorders").get(protect,getOrders);
router.route("/:id").get(protect,getOrderById);
router.route("/:id/delivery-date").put(protect,admin,updateDeliveryDate);
router.route("/:id/status").put(protect,admin,updateOrder).delete(protect,admin,deleteOrder); 
module.exports=router;

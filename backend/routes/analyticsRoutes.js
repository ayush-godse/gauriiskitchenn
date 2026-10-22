const express= require("express");
const {protect}= require("../middilewers/authMiddleware");
const {admin}=require("../middilewers/adminMiddleware");
const {getadminStats,recordVisitor}=require("../controllers/analyticsController");
const router= express.Router();    
router.post("/visit",recordVisitor);
router.get("/",protect,admin,getadminStats);
module.exports=router

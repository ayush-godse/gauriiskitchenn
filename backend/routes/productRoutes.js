const express= require("express");
const router= express.Router();
const {protect}= require("../middilewers/authMiddleware");
const {admin}=require("../middilewers/adminMiddleware");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the destination folder for uploaded files
const {getProducts,getProductById,createProduct,updateProducts,deleteProduct}= require("../controllers/productController");
// alll product routes
router.route("/").get(getProducts).post(protect,admin,upload.single('image'),createProduct);
// product by id 
router.route("/:id").get(getProductById).put(protect,admin,upload.single('image'),updateProducts).delete(protect,admin,deleteProduct);
module.exports=router;
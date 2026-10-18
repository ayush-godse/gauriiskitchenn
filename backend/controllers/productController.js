const Product= require("../model/product");
const cloudinary= require("../config/cloudinary");
const getProducts= async(req,res)=>{
    try{
        const products= await Product.find({});
        res.json(products);
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
}
const getProductById=async(req,res)=>{
    try{
        const product= await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        res.json(product);
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
}
const createProduct= async(req,res)=>{
    try{
        const {name,description,price,category,stock}=req.body;
        let imagesURL='';
        if(req.file){
            const result= await cloudinary.uploader.upload(req.file.path);
            imagesURL=result.secure_url;
        }
        const product= new Product({
            name,
            description,
            price,
            category,
            stock,
            imagesURL
        });
        await product.save();
        res.status(201).json(product);
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
}
const updateProducts= async(req,res)=>{
    try{
        const{name,description,price,category,stock}=req.body;
        const product= await Product.findById(req.params.id);
        if(product){
            if(name !== undefined) product.name = name;
            if(description !== undefined) product.description = description;
            if(price !== undefined) product.price = price;
            if(category !== undefined) product.category = category;
            if(stock !== undefined) product.stock = stock;
            if(req.file){
                const result= await cloudinary.uploader.upload(req.file.path);
                product.imagesURL=result.secure_url;
            }
            const updatedProduct= await product.save();
            res.json(updatedProduct);
        }
        else{
            res.status(404).json({message:"Product not found"});
        }
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
}
const deleteProduct= async(req,res)=>{
    try{
        const product= await Product.findByIdAndDelete(req.params.id);
        if(product){
            res.json({message:"Product removed"});
        }
        else{
            res.status(404).json({message:"Product not found"});
        }
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
}
module.exports={createProduct,getProducts,getProductById,updateProducts,deleteProduct}

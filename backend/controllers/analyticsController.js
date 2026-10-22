const Order=require("../model/order");
const user=require("../model/user");
const product=require("../model/product");
const Visitor=require("../model/visitor");

const recordVisitor=async(req,res)=>{
    const {visitorId}=req.body;
    if(typeof visitorId!=="string" || !/^[a-f0-9-]{36}$/i.test(visitorId)){
        return res.status(400).json({message:"A valid visitor ID is required."});
    }
    try{
        await Visitor.updateOne({visitorId},{$setOnInsert:{visitorId}},{upsert:true});
        res.status(200).json({message:"Visitor counted."});
    }catch(error){
        if(error.code===11000){
            return res.status(200).json({message:"Visitor already counted."});
        }
        res.status(500).json({message:error.message});
    }
};

const getadminStats=async(req,res)=>{
    try{
        const totalUsers=await user.countDocuments({role:'user'});
        const totalOrders=await Order.countDocuments({});
        const totalproduct=await product.countDocuments({});
        const totalVisitors=await Visitor.countDocuments({});
        const [revenue] = await Order.aggregate([
            {$match:{paymentStatus:'Paid'}},
            {$group:{_id:null,totalRevenue:{$sum:'$totalAmount'}}}
        ]);
        res.json({
            totalUsers,
            totalOrders,
            totalproduct,
            totalVisitors,
            totalRevenue:revenue?.totalRevenue || 0
        });
    }catch(error){
        res.status(500).json({message:error.message});
    }
}
module.exports={getadminStats,recordVisitor};
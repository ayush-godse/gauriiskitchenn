const Order=require("../model/order");
const user=require("../model/user");
const product=require("../model/product");
const getadminStats=async(req,res)=>{
    try{
        const totalUsers=await user.countDocuments({role:'user'});
        const totalOrders=await Order.countDocuments({});
        const totalproduct=await product.countDocuments({});
        const orders=await Order.find();
        const totalRevenueData=orders.reduce((acc,order)=>acc+order.totalAmount,0);
        res.json({
            totalUsers,
            totalOrders,
            totalproduct,
            totalRevenue:totalRevenueData
        });
    }catch(error){
        res.status(500).json({message:error.message});
    }
}
module.exports={getadminStats};
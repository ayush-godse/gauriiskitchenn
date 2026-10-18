const mongoose = require('mongoose');
const mongoDbconnect= async() =>{
    try{
        const mongoUri = process.env.MONGODB_URI;
        const conn =await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully');
    }
    catch(error){
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}
module.exports= mongoDbconnect;
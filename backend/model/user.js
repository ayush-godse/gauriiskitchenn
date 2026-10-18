const mongoose=require('mongoose');
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please add a name"]
    },
    email:{
        type:String,
        required:[true,"Please add an email"],
        unique:true
    },
    phone:{
        type:String,
        required:[true,"Please add a phone number"],
        match:[/^[0-9]{10}$/,"Please add a valid 10-digit phone number"]
    },
    password:{
        type:String,
        required:false
    },
    otpHash:{
        type:String
    },
    otpExpiresAt:{
        type:Date
    },
    otpAttempts:{
        type:Number,
        default:0
    },
    otpLastSentAt:{
        type:Date
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    verified:{
        type:Boolean,
        default:false
    }
});
module.exports=mongoose.model('User',userSchema);
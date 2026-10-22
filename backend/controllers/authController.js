const User=require('../model/user');
const crypto=require('crypto');
const jwt=require('jsonwebtoken');
const sendEmail=require('../utils/sendEmail');
const OTP_EXPIRY_MS=10*60*1000;
const OTP_RESEND_DELAY_MS=60*1000;
const handleOtpRequestError=(res,error,context)=>{
    if(error.status){
        return res.status(error.status).json({message:error.message});
    }
    if(error.code==='EMAIL_CONFIG_MISSING' || error.emailDeliveryFailure){
        console.error(`${context}: email delivery failed (${error.code || 'SMTP_ERROR'}).`);
        return res.status(503).json({
            message:"Could not send the verification email. Check EMAIL_USER and EMAIL_PASS in the backend environment, and confirm the email provider's SMTP or app-password settings."
        });
    }
    console.error(`${context}:`,error);
    return res.status(500).json({message:"Server error"});
};
const generateToken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'30d'
    });
}
const hashOtp=(otp)=>crypto.createHash('sha256').update(otp).digest('hex');
const sendOtp=async(user)=>{
    const now=Date.now();
    if(user.otpLastSentAt && now-user.otpLastSentAt.getTime()<OTP_RESEND_DELAY_MS){
        const retryAfter=Math.ceil((OTP_RESEND_DELAY_MS-(now-user.otpLastSentAt.getTime()))/1000);
        const error=new Error(`Please wait ${retryAfter} seconds before requesting another code.`);
        error.status=429;
        throw error;
    }

    const otp=crypto.randomInt(0,1000000).toString().padStart(6,'0');
    const otpHashValue=hashOtp(otp);
    await User.findByIdAndUpdate(user._id,{
        $set:{
            otpHash:otpHashValue,
            otpExpiresAt:new Date(now+OTP_EXPIRY_MS),
            otpAttempts:0,
            otpLastSentAt:new Date(now)
        }
    });

    try{
        await sendEmail(user.email,'Your sign-in verification code',`Your verification code for Homemade Diwali Faral is ${otp}. It expires in 10 minutes.`);
    }catch(error){
        await User.findByIdAndUpdate(user._id,{$unset:{otpHash:1,otpExpiresAt:1,otpAttempts:1,otpLastSentAt:1}});
        throw error;
    }
};
const registerUser= async(req,res)=>{
    const {name,email,phone}=req.body;
    try{
        if(!name || !email || !/^[0-9]{10}$/.test(phone || '')){
            return res.status(400).json({message:"Name, email, and a valid 10-digit phone number are required."});
        }
        const existingUser= await User.findOne({email});
        if(existingUser){
            if(!existingUser.verified && existingUser.name===name && existingUser.phone===phone){
                await sendOtp(existingUser);
                return res.json({message:"Verification code sent to your email."});
            }
            return res.status(400).json({message:"User already exists"});
        }
        const user = await User.create({ name, email, phone });
        await sendOtp(user);
        res.status(201).json({message:"Verification code sent to your email."});
    }catch(error){
        return handleOtpRequestError(res,error,'Registration OTP request failed');
    }
};
// Send a sign-in code to an existing account.
const loginUser= async(req,res)=>{
    const {email}=req.body;
    try{
        const user= await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"No account found for this email."});
        }
        await sendOtp(user);
        res.json({message:"Verification code sent to your email."});
    }catch(error){
        return handleOtpRequestError(res,error,'Login OTP request failed');
    }
}

const verifyOtp=async(req,res)=>{
    const {email,otp}=req.body;
    try{
        const user=await User.findOne({email});
        if(!user || !user.otpHash || !user.otpExpiresAt || user.otpExpiresAt.getTime()<=Date.now() || user.otpAttempts>=5){
            return res.status(401).json({message:"The code is invalid or expired. Request a new code."});
        }

        const submittedHash=Buffer.from(hashOtp(String(otp || '')),'hex');
        const storedHash=Buffer.from(user.otpHash,'hex');
        if(submittedHash.length!==storedHash.length || !crypto.timingSafeEqual(submittedHash,storedHash)){
            await User.findOneAndUpdate({
                _id:user._id,
                otpHash:user.otpHash,
                otpExpiresAt:{$gt:new Date()},
                otpAttempts:{$lt:5}
            },{$inc:{otpAttempts:1}});
            return res.status(401).json({message:"The verification code is incorrect."});
        }

        const verifiedUser=await User.findOneAndUpdate({
            _id:user._id,
            otpHash:user.otpHash,
            otpExpiresAt:{$gt:new Date()}
        },{
            $set:{verified:true},
            $unset:{otpHash:1,otpExpiresAt:1,otpAttempts:1,otpLastSentAt:1}
        },{new:true});
        if(!verifiedUser){
            return res.status(401).json({message:"The code is invalid, expired, or already used."});
        }
        res.json({
            _id:verifiedUser._id,
            name:verifiedUser.name,
            email:verifiedUser.email,
            phone:verifiedUser.phone,
            role:verifiedUser.role,
            token:generateToken(verifiedUser._id)
        });
    }catch(error){
        console.error('OTP verification failed:',error);
        res.status(500).json({message:"Server error"});
    }
};

// get user details
const getUsers= async(req,res)=>{
    try{
        const users= await User.find({}).select('-password -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt');
        res.json(users);


    }catch(error){
        res.status(500).json({message:"Server error"});
    }
}
module.exports={registerUser,loginUser,verifyOtp,getUsers};
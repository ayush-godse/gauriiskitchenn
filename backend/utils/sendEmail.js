const  nodemailer= require('nodemailer');
const sendEmail= async(to,subject,text,html)=>{
    if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS){
        const error=new Error('Email delivery is not configured.');
        error.code='EMAIL_CONFIG_MISSING';
        throw error;
    }

    const transporter= nodemailer.createTransport({
        service:'Gmail',
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        }
    });
    const mailOptions={
        from:process.env.EMAIL_USER,
        to,
        subject,
        text,
        ...(html ? { html } : {})
    };
    try{
        await transporter.sendMail(mailOptions);
    }catch(error){
        error.emailDeliveryFailure=true;
        throw error;
    }
};
module.exports=sendEmail;
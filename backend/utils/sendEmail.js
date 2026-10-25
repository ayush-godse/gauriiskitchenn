const  nodemailer= require('nodemailer');
const sendEmail= async(to,subject,text,html)=>{
    if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS){
        const error=new Error('Email delivery is not configured.');
        error.code='EMAIL_CONFIG_MISSING';
        throw error;
    }

    const auth={
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    };
    const smtpHost=process.env.SMTP_HOST;
    const smtpPort=Number(process.env.SMTP_PORT || (smtpHost ? 2525 : 465));
    if(!Number.isInteger(smtpPort) || smtpPort<1 || smtpPort>65535){
        const error=new Error('SMTP_PORT must be a valid port number.');
        error.code='SMTP_CONFIG_INVALID';
        throw error;
    }

    const transporter= smtpHost
        ? nodemailer.createTransport({
            host:smtpHost,
            port:smtpPort,
            secure:smtpPort===465,
            auth
        })
        : nodemailer.createTransport({
            service:'Gmail',
            auth
        });
    const mailOptions={
        from:process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()

async function mailSender(email, subject, body){
    
    try{
        let transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })
        
        const mailOptions = {
            from: `chatX <${process.env.MAIL_USER}>`,
            to: email,
            subject: subject,
            html: body
        }
    
        const info = await transporter.sendMail(mailOptions)

        // console.log("Email sent: ", info.response);
        return info;

    }
    catch(err){
        console.log(err);
        throw err;
    }

}

export default mailSender;
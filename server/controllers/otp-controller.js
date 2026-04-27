import otpGenerator from 'otp-generator';
import OTP from '../models/otp-model.js';
import User from '../models/user-model.js';
import mailSender from '../utils/mailSender.js';

async function sendOtpMail(email, otp){
    const mailResponse = await mailSender(email, "chatX OTP", `Your OTP is ${otp}<br>OTP is valid for 5 minutes`);
    return mailResponse;
}

export async function sendOTP(req, res){
    try{
        const otp = otpGenerator.generate(4, {digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});

        const {email} = req.body;

        const isUserExist = await User.exists({email: email});
        if(isUserExist){
            return res.status(401).json({
                success: false,
                message: "User already registered"
            })
        }

        const otpPayload = {email, otp};

        const existingOtp = await OTP.findOne({email});
        if(existingOtp){
            existingOtp.otp = otp;
            await existingOtp.save();
        }
        else{
            await OTP.create(otpPayload);
        }

        await sendOtpMail(email, otp);

        return res.status(200).json({
            success: true,
            message: 'Otp sent successfully',
            otp,
            otpExpiry: '300s'
        })
    }
    catch(e){
        // console.log(e);
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

export async function verifyOTP(req, res){
    const {email, otp} = req.body;

    // console.log(otp)

    const fetchedOtpDoc = await OTP.findOne({email});
    if(fetchedOtpDoc){
        const fetchedOtp = fetchedOtpDoc.otp;

        if(otp===fetchedOtp){
            return res.status(200).json({
                success: true,
                message: "OTP verified"
            })
        }
    }

    return res.status(400).json({
        success: false,
        message: "Invalid OTP"
    })
}
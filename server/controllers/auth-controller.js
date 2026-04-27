import User from "../models/user-model.js";

import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

import dotenv from 'dotenv';

dotenv.config();

async function isUsernameExist(username){
    const exists = await User.exists({username: username});
    if(exists){
        return true;
    }
    return false
}

async function isEmailExist(email){
    const exists = await User.exists({email: email});
    if(exists){
        return true;
    }
    return false
}

export async function checkUsername(req, res){
    try{
        const {username} = req.body;

        if(await isUsernameExist(username)){
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Username available"
        });

    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            error: e.message
        });
    }
}

export async function signup(req, res){
    try{
        let {name, email, username, password} = req.body;

        name = name ? name.trim() : '';
        username = username ? username.toLowerCase().trim() : '';

        if(!name || !email || !username || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required (name, email, username, password)"
            });
        }

        if(await isUsernameExist(username) || await isEmailExist(email)){
            return res.status(409).json({
                success: false,
                message: "User already exists, please login"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // await User.deleteMany()
        const user = await User.create({name, email, username, password: hashedPassword});
        // await user.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully!"
        })
    }
    catch(e){
        console.log(e);
        if(e.code === 11000){
            return res.status(409).json({
                success: false,
                message: "User already exists, please login"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
}

export async function login(req, res){
    try{
        let {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        username = username.toLowerCase().trim();

        const user = await User.findOne({username});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "Username not found"
            });
        }

        
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched){
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }

        if (!process.env.SECRET_KEY) {
            console.error("CRITICAL: SECRET_KEY is missing from environment variables!");
            return res.status(500).json({
                success: false,
                message: "Server configuration error (missing secret key)"
            });
        }

        const userId = user._id.toHexString();
        const token = jwt.sign({userId}, process.env.SECRET_KEY, {
            'expiresIn': '7d'
        })
        return res.status(200).json({
            success: true,
            message: "User authenticated",
            token
        })



    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            error: "Login failed!"+e
        })
    }
}
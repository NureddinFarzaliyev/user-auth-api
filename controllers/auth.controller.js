import User from "../models/userSchema.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export const testController = (req, res) => {
    res.send({message: 'Hello Auth', success: true})
}

const maxAge = 3 * 24 * 60 * 60;

const createToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: maxAge,
    })
}

const sendEmail = async (email, content) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    const sent = await transporter.sendMail({
        from: process.env.SMTP_SENDER,
        to: email,
        ...content,
    })

    console.log(sent.messageId)
}

export const signupController = async (req, res) => {
    try {
        // create user
        const user = await User.create({username: req.body.username, password: req.body.password, email: req.body.email})
        const token = createToken({id: user._id})
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000, sameSite: 'None', secure: true})
        res.json({user: user._id, verified: user.verified, success: true})
        // send verification email
        const emailToken = createToken({email: user.email})
        sendEmail(user.email, {
            subject: "Verify your email",
            text: `Click this link to verify your email: ${process.env.CLIENT_ORIGIN}/verify/${emailToken}`
        })
    } catch (err) {
        res.status(400).json({error: err.message})
    }
}

export const loginController = async (req, res) => {
    try {
        const existingUser = await User.findOne({email: req.body.email})
    
        if(existingUser) {
            const pass = await bcrypt.compare(req.body.password, existingUser.password)
    
            if(pass) {
                const token = createToken({id: existingUser._id})
                res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000, sameSite: 'None', secure: true})
                res.json({user: existingUser._id, verified: existingUser.verified, success: true})
            }else {
                throw new Error("Invalid email or password");
            }
        }else {
            throw new Error("Invalid email or password");
        }
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

export const logoutController = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1, sameSite: 'None', secure: true})
    res.send({message: "User logged out", loggedOut: true, success: true})
}

export const verificationController = async (req, res) => {
    try {
        const token = req.body.token;

        if(!token){return res.status(401).json({verified: false, error: "No token provided"})}

        jwt.verify(token, process.env.JWT_SECRET, async (err, verified) => {
            if(err) {return res.status(401).json({verified: false, error: "Invalid token"})}

            const user = await User.findOne({email: verified.email})

            if(!user) {return res.status(401).json({verified: false, error: "User not found"})}

            if(user.verified){return res.status(401).json({verified: false, error: "User already verified"})}

            await user.updateOne({verified: true})
            res.status(200).json({verified: true, message: "User verified", success: true})
        })
    } catch (error) {
        res.status(500).json({verified: false, error: "Server Error"})
    }
}

export const checkController = async (req, res) => {
    const token = req.cookies.jwt;
    let userId;

    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err){
                return res.status(401).json({unathorized: "Unauthorized", error: "Unauthorized"})
            }
            userId = decodedToken.id;
        })

        if(!userId){
            return res.status(401).json({unathorized: "Unauthorized", error: "Unauthorized"})
        }

        const user = await User.findById(userId)
        res.status(200).json({authorized: true, userId: userId, verified: user?.verified, success: true})
    }else{
        res.status(401).json({unathorized: "Unauthorized", error: "Unauthorized"})
    }
}

export const resetRequestController = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})

        if(!user){
            return res.status(404).json({error: "User not found"})
        }

        const token = createToken({email: user.email, purpose: "reset"})
        
        sendEmail(user.email, {
            subject: "Reset Password",
            text: `Click this link to reset your password: ${process.env.CLIENT_ORIGIN}/reset/${token}
            This link will expire in 5 minutes.`
        })

        await user.updateOne({resetExpire: Date.now() + 5 * 60 * 1000})

        res.status(200).json({message: "Reset email sent", success: true})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export const resetController = async (req, res) => {
    try {
        jwt.verify(req.params.token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if(err){
                return res.status(401).json({error: "Invalid token"})
            }

            if (decodedToken.purpose !== "reset") {
                return res.status(401).json({error: "Invalid token"});
            }

            const user = await User.findOne({email: decodedToken.email})

            if(!user){
                return res.status(404).json({error: "User not found"})
            }

            if(user.resetExpire < Date.now()){
                return res.status(401).json({error: "Token expired"})
            }

            user.password = req.body.password;

            try {
                await user.save();
            } catch (error) {
                res.status(400).json({error: error.message})
            }

            res.status(200).json({message: "Password reset successful", success: true})
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}
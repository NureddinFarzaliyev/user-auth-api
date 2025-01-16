import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail.js";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    verified: {
        type: Boolean,
        default: false,
    },
    resetExpire: {
        type: Date,
        default: Date.now(),
    },
    menus: {
        type: Array,
        default: [],
    }
})

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(this.password, salt);
    this.password = hashedPass;

    next();
})


const User = mongoose.model('User', userSchema);
export default User;
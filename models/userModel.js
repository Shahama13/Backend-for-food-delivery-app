import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter your name"],
        maxLength: [30, "Name cannot exceed 30 characters"]
    },
    email: {
        type: String,
        required: [true, "Enter your email"],
        unique: true,
    },
    password: {
        type: String,
        minLength: [6, "Password should be atleast 6 characters"],
        required: [true, "Enter your password"],
        select: false,
    },
    phone: {
        type: String,
        unique:true,
        required: true,
        minLength: [10, "Phone Number should be of 10 characters"],
        maxLength: [10, "Phone Number should be of 10 characters"],
    },
    wishlist:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Meal"
        }
    ],
    address: {
        name: String,
        type: String,
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordOtp: Number,
    resetPasswordOtpExpiry: Date,
    resetPassword:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.getToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

userSchema.methods.verifyPassword =async function(password){
    return await bcrypt.compare(password,this.password)
}

const User = mongoose.model("User", userSchema)

export default User;
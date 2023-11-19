import mongoose from "mongoose";
import validator from "validator"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"]
    },
    image: {
        public_id: String,
        url: String,
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Please enter email"]
    },

    password: {
        type: String,
        minLength: [6, "Password should be atleast 6 characters"],
        required: [true, "Enter your password"],
        select: false,
    },

    phone: {
        type: String,
        unique: true,
        required: true,
        minLength: [10, "Phone Number should be of 10 characters"],
        maxLength: [10, "Phone Number should be of 10 characters"],
    },

    completedOrders: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["Available", "Not available", "Busy"],
        default: "Not available"
    },

    currentOrder: {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
    },
})

driverSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

driverSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

driverSchema.methods.getToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

const Driver = mongoose.model("Driver", driverSchema)


export default Driver
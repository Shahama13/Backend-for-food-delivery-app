import Driver from "../models/driverModel.js"
import User from "../models/userModel.js"
import ErrorHandler from "../utils/errorHandler.js"
import jwt from "jsonwebtoken"

export const userAuth = async (req, res, next) => {
    const { token } = req.cookies
    if (!token) return next(new ErrorHandler("Please login", 500))

    const decodedUser = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decodedUser._id)
    next()
}

export const adminAuth = async (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(new ErrorHandler("This route is unaccessible for users", 403))
    }
    next()
}

export const driverAuth = async (req, res, next) => {
    const { token } = req.cookies
    if (!token) return next(new ErrorHandler("Please login", 500))
    const decodeDriver = jwt.verify(token, process.env.JWT_SECRET)
    req.driver = await Driver.findById(decodeDriver._id)
    next()
}
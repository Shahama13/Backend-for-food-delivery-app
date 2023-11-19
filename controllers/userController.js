import { catchError } from "../middlewares/catchError.js"
import User from "../models/userModel.js"
import ErrorHandler from "../utils/errorHandler.js"
import { sendEmail } from "../utils/sendEmail.js"
import sendToken from "../utils/sendToken.js"
import Meal from "../models/mealModel.js"
import Category from "../models/categoryModel.js"
import Order from "../models/orderModel.js"

// REGISTER A NEW USER
export const register = catchError(async (req, res, next) => {

    const { name, email, password, phone } = req.body
    let user = await User.findOne({ email })
    let user2 = await User.findOne({ phone })
    if (user || user2) return next(new ErrorHandler("User already exists", 500))
    user = await User.create({
        name, email, password, phone
    })
    sendToken(res, user, 201)

})

// LOGIN AN EXISTING USER
export const login = catchError(async (req, res, next) => {

    const { email, password } = req.body
    if (!email || !password) return next(new ErrorHandler("Enter email and password", 400))

    let user = await User.findOne({ email }).select("+password")
    if (!user) return next(new ErrorHandler("User not found", 404))

    const isVerified = await user.verifyPassword(password)
    if (!isVerified) return next(new ErrorHandler("Incorrect Password", 401))

    sendToken(res, user, 200)

})

// GET USER IF AUTHENTICATED
export const getMe = catchError(async (req, res) => {
    const user = await User.findById(req.user._id)
    sendToken(res, user, 200)
})

// LOGOUT USER
export const logOut = catchError(async (req, res) => {
    res.status(200).cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "User logged out"
    })
})

// FORGOT PASSWORD
export const forgotPassword = catchError(async (req, res, next) => {
    const { email } = req.body
    if (!email) return next(new ErrorHandler("Please enter Email", 400))

    const user = await User.findOne({ email })
    if (!user) return next(new ErrorHandler("User not found", 404))

    const otp = Math.floor(1000 + (8999) * Math.random())

    user.resetPasswordOtp = otp
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await user.save()

    await sendEmail(email, "Reset Password OTP", `Your OTP to reset password is ${otp}`)

    res.status(200).json({
        success: true,
        message: `Otp sent to ${email}`
    })

})

// VERIFY OTP
export const verifyOtp = catchError(async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) return next(new ErrorHandler("Enter OTP", 400))

    const user = await User.findOne({ resetPasswordOtp: otp, resetPasswordOtpExpiry: { $gt: Date.now() } })

    if (!user) return next(new ErrorHandler("Invalid or expired OTP", 400))

    user.resetPassword = true
    await user.save()

    res.status(200).json({
        success: true,
        message: "OTP verified!"
    })
})

// RESET PASSWORD
export const resetPassword = catchError(async (req, res, next) => {
    const { otp, newPassword } = req.body;

    const user = await User.findOne({ resetPasswordOtp: otp, resetPasswordOtpExpiry: { $gt: Date.now() } }).select("+password")

    if (user.resetPassword === true) {
        user.password = newPassword
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpiry = null;
        user.resetPassword = false;
        await user.save()

        res.status(200).json({
            success: true,
            message: "Password Changed"
        })
    }
})

// CHANGE PASSWORD
export const changePassword = catchError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password")
    const verifyPassword = await user.verifyPassword(oldPassword)
    if (!verifyPassword) return next(new ErrorHandler("Invalid email or password", 500))
    user.password = newPassword;
    await user.save()
    res.status(200).json({
        success: true,
        message: "Password changed"
    })
})

// ADD/REMOVE A MEAL TO WISHLIST
export const wishlist = catchError(async (req, res, next) => {
    const { mealId } = req.body
    const user = await User.findById(req.user._id)
    if (user.wishlist.includes(mealId)) {
        const index = user.wishlist.indexOf(mealId)
        user.wishlist.splice(index, 1)
        await user.save()
        res.status(200).json({
            success: true,
            message: "Item removed from wishlist"
        })
    }
    else {
        user.wishlist.push(mealId)
        await user.save()
        res.status(200).json({
            success: true,
            message: "Item added to wishlist"
        })
    }
})

// GET MY WISHLIST
export const getMyWishlist = catchError(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate("wishlist")
    res.status(200).json({
        success: true,
        wishlist: user.wishlist,
    })
})

// GET ALL MEALS
export const allMeals = catchError(async (req, res, next) => {
    const query = {}

    if (req.query.search) {
        query.name = {
            $regex: req.query.search,
            $options: "i"
        }
    }
    const meals = await Meal.find(query).populate("category", "name")
    res.status(200).json({
        success: true,
        meals
    })

})

// GET ALL CATEGORIES WITH MEALS
export const allCategories = catchError(async (req, res, next) => {
    const categories = await Category.find().populate("items")
    res.status(200).json({
        success: true,
        categories
    })
})

// GET MEAL BY ID
export const getMealById = catchError(async (req, res, next) => {
    const meal = await Meal.findById(req.params.id)
    if (!meal) return next(new ErrorHandler("Meal not found", 404))
    res.status(200).json({
        success: true,
        meal
    })
})

// ORDERING 
export const orderMeal = catchError(async (req, res, next) => {

    const { orderItems, payment, address, subTotal, deliveryCharge, tax } = req.body

    let order = {
        deliverTo: req.user._id,
        address,
        orderItems,
        payment, totalAmt: subTotal + deliveryCharge + tax, subTotal, deliveryCharge, tax,
    }
    order = await Order.create(order)

    res.status(200).json({
        success: true,
        order
    })
})

// GET ORDER BY ID
export const getOrderById = catchError(async (req, res, next) => {
    const orders = await Order.findById(req.params.id).populate("deliveredBy")
    res.status(200).json({
        success: true,
        orders
    })
})

// GET MY ORDERS
export const myOrders = catchError(async (req, res, next) => {
    const orders = await Order.find({
        deliverTo: req.user._id
    }).populate("deliveredBy")
    res.status(200).json({
        success: true,
        orders
    })
})


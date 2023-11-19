import { catchError } from "../middlewares/catchError.js";
import Driver from "../models/driverModel.js";
import Order from "../models/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Login for the driver
export const login = catchError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorHandler("Enter email and password", 401))

    const driver = await Driver.findOne({ email }).select("+password")
    if (!driver) return next(new ErrorHandler("Driver not found", 401))

    const isVerified = await driver.verifyPassword(password)
    if (!isVerified) return next(new ErrorHandler("Incorrect email or password", 500))

    const token = driver.getToken();
    driver.status = "Available";
    await driver.save()

    res.status(200).cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
    }).json({
        success: true,
        driver,
        token
    })
})

// Get authenticated driver
export const getDriver = catchError(async (req, res, next) => {
    const driver = await Driver.findById(req.driver._id)
    const token = driver.getToken()
    res.status(200).cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
    }).json({
        success: true,
        driver,
        token
    })
})

// Logout
export const logout = catchError(async (req, res, next) => {
    const driver = await Driver.findById(req.driver._id)
    if (driver.status === "Busy") return next(new ErrorHandler("Finish current order to log out", 500))
    driver.status = "Not available"
    await driver.save()
    res.status(200).cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "Logged out"
    })
})

// Change password 
export const changePassword = catchError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    const driver = await Driver.findById(req.driver._id).select("+password")

    const isVerified = await driver.verifyPassword(oldPassword)
    if (!isVerified) return next(new ErrorHandler("Incorrect password", 500))

    driver.password = newPassword
    await driver.save()

    res.status(200).json({
        success: true,
        message: "Password changed"
    })
})

// get ready to pickup orders
export const readyOrders = catchError(async (req, res, next) => {
    const orders = await Order.find({status: "Ready" })
    res.status(200).json({
        success: true,
        orders
    })
})

// pick up order from restaurant
export const pickOrder = catchError(async (req, res, next) => {

    const driver = await Driver.findById(req.driver._id)
    if (driver.currentOrder) return next(new ErrorHandler("You already have an order to finish", 404))
    const order = await Order.findById(req.params.id).populate("deliverTo deliveredBy")
    if (!order) return next(new ErrorHandler("Order not found", 404))
    if (order.status != "Ready") return next(new ErrorHandler("Order not ready", 404))

    driver.status = "Busy"
    driver.currentOrder = req.params.id;
    await driver.save()
    order.deliveredBy = req.driver._id;
    order.status = "Out for delivery";
    await order.save()

    res.status(200).json({
        success: true,
        order
    })

})

// get my current orderDetails
export const currentOrder = catchError(async (req, res, next) => {
    const driver = await Driver.findById(req.driver._id)
    if (driver.currentOrder === null) {
        return res.status(200).json({
            success: true,
            message: "You dont have any orders"
        })
    }
    const order = await Order.findById(driver.currentOrder).populate("deliverTo deliveredBy")
    res.status(200).json({
        success: true,
        order
    })

})

// order delivery finished
export const deliveryCompleted = catchError(async (req, res, next) => {

    const driver = await Driver.findById(req.driver._id)
    const order = await Order.findById(driver.currentOrder).populate("deliverTo deliveredBy")
    if (!order) return next(new ErrorHandler("You dont have any orders", 404))
    if (order.status != "Out for delivery") return next(new ErrorHandler("Order not picked up", 500))

    driver.status = "Available"
    driver.currentOrder = null;
    ++driver.completedOrders
    await driver.save()
    order.deliveredBy = req.driver._id;
    order.status = "Delivered";
    order.deliveredAt = new Date(Date.now());
    await order.save()

    res.status(200).json({
        success: true,
        message: "Order Delivery Finished"
    })

})

// get orders completed by me
export const ordersCompletedByMe = catchError(async (req, res, next) => {
    const orders = await Order.find({ deliveredBy: req.driver._id, status: "Delivered" }).populate("deliverTo")
    res.status(200).json({
        success: true,
        orders
    })
})

import { catchError } from "../middlewares/catchError.js";
import fs from "fs"
import cloudinary from "cloudinary"
import Category from "../models/categoryModel.js";
import Meal from "../models/mealModel.js"
import Driver from "../models/driverModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orderModel.js";

// Create categrory
export const createCategory = catchError(async (req, res, next) => {
    const { name } = req.body
    const { image: { tempFilePath } } = req.files

    const myCloud = await cloudinary.v2.uploader.upload(tempFilePath, {
        folder: "SwiftServe"
    })

    fs.rmSync("./tmp", { recursive: true })

    const category = await Category.create({
        name,
        image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })

    res.status(200).json({
        success: true,
        category,
    })
})

// Update category
export const updateCategory = catchError(async (req, res, next) => {
    const { name } = req.body
    const { id } = req.params
    const category = await Category.findById(id)

    if (req.files !== null) {
        const { image: { tempFilePath } } = req.files
        await cloudinary.v2.uploader.destroy(category.image.public_id)
        const myCloud = await cloudinary.v2.uploader.upload(tempFilePath, {
            folder: "SwiftServe"
        })

        fs.rmSync("./tmp", { recursive: true })

        category.image = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }
    if (name) {
        category.name = name
    }
    await category.save()
    res.status(200).json({
        success: true,
        meassge: "Category updated",
        category
    })
})

// Delete category
export const deleteCategory = catchError(async (req, res, next) => {
    const category = await Category.findByIdAndDelete(req.params.id)
    await cloudinary.v2.uploader.destroy(category.image.public_id)
    category.items.forEach(async (item) => {
        const meal = await Meal.findByIdAndDelete(item)
        await cloudinary.v2.uploader.destroy(meal.image.public_id)
    })
    res.status(200).json({
        success: true,
        message: "Category deleted"
    })
})

// Get category by id
export const getCategoryById = catchError(async (req, res, next) => {
    const category = await Category.findById(req.params.id).populate("items")
    if (!category) return next(new ErrorHandler("Category not found", 404))
    res.status(200).json({
        success: true,
        category
    })
})

// Create meal
export const createMeal = catchError(async (req, res, next) => {
    const { name, price, category, description, type } = req.body
    const { image: { tempFilePath } } = req.files

    const myCloud = await cloudinary.v2.uploader.upload(tempFilePath, {
        folder: "SwiftServe"
    })

    fs.rmSync("./tmp", { recursive: true })

    const meal = await Meal.create({
        name, price, category, description, type,
        image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })

    const cat = await Category.findById(category)
    cat.items.push(meal._id)
    await cat.save()

    res.status(200).json({
        success: true,
        message: "Meal created",
        meal,
    })
})

// Update meal
export const updateMeal = catchError(async (req, res, next) => {

    if (req.files !== null) {
        const { image: { tempFilePath } } = req.files

        const meal = await Meal.findById(req.params.id)
        await cloudinary.v2.uploader.destroy(meal.image.public_id)

        const myCloud = await cloudinary.v2.uploader.upload(tempFilePath, {
            folder: "SwiftServe"
        })
        fs.rmSync("./tmp", { recursive: true })

        req.body.image = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }

    if (req.body.category) {
        const meal = await Meal.findById(req.params.id)
        const category = await Category.findById(meal.category)

        const index = category.items.indexOf(req.params.id)
        category.items.splice(index, 1)

        const newCategory = await Category.findById(req.body.category)
        newCategory.items.push(req.params.id)

        await newCategory.save();
        await category.save()
    }

    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        meal
    })
})

// Delete meal
export const deleteMeal = catchError(async (req, res, next) => {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    await cloudinary.v2.uploader.destroy(meal.image.public_id)

    const category = await Category.findById(meal.category)
    const index = category.items.indexOf(req.params.id)
    category.items.splice(index, 1)
    await category.save()

    res.status(200).json({
        success: true,
        message: "Meal Deleted"
    })
})

// Create an account for a driver
export const createDriverAccount = catchError(async (req, res, next) => {
    const { name, email, password, phone } = req.body

    let driver = await Driver.findOne({ email })
    let driver2 = await Driver.findOne({ phone })
    if (driver || driver2) return next(new ErrorHandler("Driver already exists with the credentials", 500))

    const { image: { tempFilePath } } = req.files

    const myCloud = await cloudinary.v2.uploader.upload(tempFilePath, {
        folder: "Drivers"
    })

    fs.rmSync("./tmp", { recursive: true })

    driver = await Driver.create({
        name, email, image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }, password, phone
    })

    res.status(200).json({
        success: true,
        message: "Driver created"
    })
})

// Delete the driver
export const deleteDriver = catchError(async (req, res, next) => {
    const driver = await Driver.findByIdAndDelete(req.params.id)
    if (!driver) return next(new ErrorHandler("Driver not found", 500))
    await cloudinary.v2.uploader.destroy(driver.image.public_id)
    res.status(200).json({
        success: true,
        message: "Driver deleted"
    })
})

// Update the driver
export const updateDriver = catchError(async (req, res, next) => {
    let driver = await Driver.findById(req.params.id)
    if (!driver) return next(new ErrorHandler("Driver not found", 500))
    if (req.files !== null) {
        const { image: { tempFilePath } } = req.files
        await cloudinary.v2.uploader.destroy(driver.image.public_id)
        const myCloud = await cloudinary.v2.uploader.upload(tempFilePath, {
            folder: "Drivers"
        })
        fs.rmSync("./tmp", { recursive: true })
        req.body.image = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }
    driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
        message: "Driver Updated",
        driver
    })
})

// Get all drivers
export const allDrivers = catchError(async (req, res, next) => {
    const query = {}
    if (req.query.status) {
        query.status = req.query.status
    }
    const drivers = await Driver.find(query).populate("currentOrder currentOrder.deliverTo")
    res.status(200).json({
        success: true,
        drivers,
    })
})

// Get driver by id
export const driverById = catchError(async (req, res, next) => {
    const driver = await Driver.findById(req.params.id).populate("currentOrder currentOrder.deliverTo")
    if (!driver) return next(new ErrorHandler("Driver not found", 404))
    res.status(200).json({
        success: true,
        driver
    })
})

// Get all orders with status
export const allOrders = catchError(async(req,res,next)=>{
    const query = {}
    if (req.query.status) {
        query.status = req.query.status
    }
    const orders = await Order.find(query).populate("deliverTo deliveredBy")
    res.status(200).json({
        success: true,
        orders:orders.reverse(),
    })
})

// Accept the order by setting it to "Preparing"
export const acceptOrder = catchError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) return next(new ErrorHandler("Order not found", 404))
    if (order.status != "Processing") return next(new ErrorHandler("This order is already accepted", 500))
    order.status = "Preparing"
    await order.save();
    res.status(200).json({
        success: true,
        message: "Order accepted"
    })
})

// Set order status to ready for driver to pick up
export const orderReady = catchError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) return next(new ErrorHandler("Order not found", 404))
    if (order.status != "Preparing") return next(new ErrorHandler("Order already set to ready", 500))
    order.status = "Ready"
    await order.save();
    res.status(200).json({
        success: true,
        message: "Waiting for driver to pick up"
    })
})

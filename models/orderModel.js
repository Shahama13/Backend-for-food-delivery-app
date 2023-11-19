import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({

    deliverTo: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    orderItems: [
        {
            mealId: { type: mongoose.Schema.ObjectId, ref: "Meal", },
            name: { type: String, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            type: { type: String, required: true },
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    status: {
        type: String,
        enum: ["Processing", "Preparing", "Ready", "Out for delivery", "Delivered"],
        default: "Processing"
    },
    payment: {
        mode: {
            type: String,
            enum: ["Prepaid", "Cod"]
        },
        prepaidInfo: {
            payment_id: String,
            payment_signature: String,
        }
    }, deliveredBy: {
        type: mongoose.Schema.ObjectId,
        ref: "Driver"
    },
    totalAmt: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    tax: { type: Number, required: true },
    deliveredAt: Date,

}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema)

export default Order
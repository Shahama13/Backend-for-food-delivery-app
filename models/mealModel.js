import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter the name of the meal"],
        trim: true,
    },
    image: {
        public_id: String,
        url: String,
    },
    price: {
        type: Number,
        required: [true, "Please enter price"],
        maxLength: [5, "Price cannot exceed 5 characters"]
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: [true, "Enter the category of the meal"],
    },
    description: {
        type: String,
        required: [true, "Enter the description of the meal"],
    },
    available:{
        type:Boolean,
        default:true,
    },
    type: {
        type: String,
        enum: ['Veg', 'Non-veg'],
    }
}, { timestamps: true })

const Meal = mongoose.model("Meal",mealSchema)

export default Meal
import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter the name of category"],
        trim: true
    },
    image: {
        public_id: String,
        url: String,
    },
    items: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Meal"
        }
    ]
},{timestamps:true})

const Category = mongoose.model("Category", categorySchema)

export default Category;
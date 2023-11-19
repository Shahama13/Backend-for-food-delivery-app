import app from "./app.js";
import { config } from "dotenv";
import { connectDatabse } from "./config/connectDatabse.js";
import cloudinary from "cloudinary"

config({
    path: "./config/config.env"
})
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

connectDatabse();

app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})
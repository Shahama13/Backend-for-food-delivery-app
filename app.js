import express from "express"
import userR from "./routes/userRoutes.js"
import adminR from "./routes/adminRoutes.js"
import errorMiddleware from "./middlewares/error.js"
import cookieParser from "cookie-parser";
 import fileUpload from "express-fileupload";
import driverR from "./routes/driverRoutes.js"
import cors from "cors"

const app = express();

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
})
)


app.get("/",(req,res)=>{
    res.send("Working fine")
})
app.use("/api/v1", userR)
app.use("/api/v1/admin", adminR)
app.use("/api/v1/driver", driverR)

app.use(errorMiddleware)

export default app;
import mongoose from "mongoose"

export const connectDatabse = () => {
    mongoose.connect(process.env.URI).then((e) => {
        console.log(`Database connected at ${e.connection.host}`)
    }).catch((error) => {
        console.log(error)
    })
}
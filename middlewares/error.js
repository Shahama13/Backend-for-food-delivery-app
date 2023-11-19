const errorMiddleware = (err, req, res, next) => {
    console.log(err.name)
    console.log(err.code)

    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;

    if (err.name === "CastError") {
        err.message = `Invalid ${err.path}`,
            err.statusCode = 400
    }

    if (err.name === "JsonWebTokenError") {
        err.message = `Invalid Token, Try again`,
            err.statusCode = 400
    }

    if (err.name === "TokenExpiredError") {
        err.message = `Token Expired, Try again`,
            err.statusCode = 400
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
}

export default errorMiddleware
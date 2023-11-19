import express from "express"
import { register, login, getMe, logOut, orderMeal, forgotPassword, verifyOtp, allMeals, resetPassword, changePassword, wishlist, allCategories, getMyWishlist, getMealById, myOrders, getOrderById } from "../controllers/userController.js"
import { userAuth } from "../middlewares/auth.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/logout", logOut)
router.get("/me",userAuth,getMe)

router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtp)
router.post("/reset-password", resetPassword)
router.route("/change-password").put(userAuth,changePassword)

router.route("/wishlist").post(userAuth,wishlist)
router.route("/get-wishlist").get(userAuth,getMyWishlist)

router.route("/all-meals").get(allMeals)
router.route("/all-categories").get(allCategories)
router.route("/meal/:id").get(getMealById)

router.route("/order").post(userAuth,orderMeal)
router.route("/order/:id").get(userAuth,getOrderById)
router.route("/myorders").get(userAuth, myOrders)

export default router
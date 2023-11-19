import express from "express"
const router = express.Router()
import { adminAuth,userAuth } from "../middlewares/auth.js"
import { createCategory, createMeal, deleteMeal, updateCategory, updateMeal, deleteCategory, createDriverAccount, deleteDriver, updateDriver, allDrivers, driverById, getCategoryById, acceptOrder, orderReady, allOrders } from "../controllers/adminController.js"

router.route("/create-category").post(userAuth,adminAuth,createCategory)
router.route("/update-category/:id").put(userAuth,adminAuth,updateCategory)
router.route("/delete-category/:id").delete(userAuth,adminAuth,deleteCategory)
router.route("/category/:id").get(userAuth, adminAuth, getCategoryById)

router.route("/create-meal").post(userAuth,adminAuth,createMeal)
router.route("/update-meal/:id").put(userAuth,adminAuth,updateMeal)
router.route("/delete-meal/:id").delete(userAuth,adminAuth,deleteMeal)

router.route("/create-driver").post(userAuth,adminAuth,createDriverAccount)
router.route("/delete-driver/:id").delete(userAuth,adminAuth,deleteDriver)
router.route("/update-driver/:id").put(userAuth, adminAuth, updateDriver)
router.route("/drivers").get(userAuth, adminAuth, allDrivers)
router.route("/driver/:id").get(userAuth, adminAuth, driverById)

router.route("/allorders").get(userAuth, adminAuth, allOrders)
router.route("/acceptorder/:id").put(userAuth, adminAuth, acceptOrder)
router.route("/ordeready/:id").put(userAuth, adminAuth, orderReady)

export default router
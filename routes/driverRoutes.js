import express from "express"
import { driverAuth } from "../middlewares/auth.js"
import { login, getDriver, logout, changePassword, pickOrder, currentOrder, deliveryCompleted, ordersCompletedByMe, readyOrders } from "../controllers/driverControllers.js"

const router= express.Router()

router.route("/login").post(login)
router.route("/logout").get(driverAuth,logout)
router.route("/me").get(driverAuth,getDriver)
router.route("/change-password").put(driverAuth,changePassword)

router.route("/pickup/:id").put(driverAuth,pickOrder)
router.route("/finish").put(driverAuth, deliveryCompleted)

router.route("/ready-orders").get(driverAuth, readyOrders)
router.route("/current-order").get(driverAuth, currentOrder)
router.route("/finished-orders").get(driverAuth, ordersCompletedByMe)

export default router
const express = require("express");
const router = express.Router();

const {
    myOrders, checkout, adminOrders, updateOrderStatus } = require("../controllers/OrderController");

const {
    verifyToken,
    verifyCustomer, verifyAdmin} = require("../middleware/Auth");

router.get("/admin", verifyToken, verifyAdmin, adminOrders);
router.patch("/:id/status", verifyToken, verifyAdmin, updateOrderStatus);
router.get("/", verifyToken, verifyCustomer, myOrders);
router.post("/", verifyToken, verifyCustomer, checkout);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
    createOrder,
    getMyOrders
} = require("../controllers/OrderController");

const { verifyToken } = require("../middleware/Auth");

// POST /api/orders - Create a new order (checkout)
router.post("/", verifyToken, createOrder);

// GET /api/orders - Get logged-in user's orders
router.get("/", verifyToken, getMyOrders);

module.exports = router;
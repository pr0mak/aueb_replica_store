const express = require("express");
const router = express.Router();

const { checkout } = require("../controllers/BuyController");
const { verifyToken } = require("../middleware/Auth");

// POST /api/buy/checkout
router.post("/checkout", verifyToken, checkout);

module.exports = router;

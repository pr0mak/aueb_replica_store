const express = require("express");
const router = express.Router();

const {
    myOrders,
    checkout } = require("../controllers/OrderController");

const {
    verifyToken,
    verifyCustomer} = require("../middleware/Auth");

router.get("/", verifyToken, verifyCustomer, myOrders);
router.post("/", verifyToken, verifyCustomer, checkout);

module.exports = router;

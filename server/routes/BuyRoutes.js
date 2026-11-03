const express = require("express");
const router = express.Router();

const { 
    checkout 
} = require("../controllers/BuyController");

const auth = require("../middleware/Auth");

// Checkout endpoint with auth
router.post("/checkout", auth, checkout);

module.exports = router;

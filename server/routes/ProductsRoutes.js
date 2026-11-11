const express = require("express");
const router = express.Router();

const c = require("../controllers/ProductsController");
const { verifyToken, verifyAdmin } = require("../middleware/Auth");

router.get("/products", c.getAllProducts);
router.get("/products/:id", c.getProductById);
router.post("/products", verifyToken, verifyAdmin, c.createProduct);
router.put("/products/:id", verifyToken, verifyAdmin, c.updateProduct);
router.delete("/products/:id", verifyToken, verifyAdmin, c.deleteProduct);

const {getReviews,saveReview} = require("../controllers/ReviewController");

router.get("/:id/reviews", getReviews);
router.post("/:id/reviews",verifyToken,saveReview);

module.exports = router;
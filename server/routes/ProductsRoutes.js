const express = require("express");
const router = express.Router();

const {
    getAllProducts,
    getProductsByCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/ProductsController");

// Public endpoints
router.get("/store", getAllProducts);
router.get("/store/:category", getProductsByCategory);
router.get("/store/:category/:id", getProductById);

// Admin endpoints
router.post("/admin/products", createProduct);
router.put("/admin/products/:id", updateProduct);
router.delete("/admin/products/:id", deleteProduct);

module.exports = router;
const mongoose = require("mongoose");
const Product = require("../models/Product");

// GET /api/store
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: "Error fetching products"
        });
    }
};


// GET /api/store/:category
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        if (category != "clothes" && category != "office_supplies" && category != "accessories"){
            return res.status(404).json({
                success: false ,
                message: "Error category not found"
            });
        }

        const products = await Product.find({ category });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: "Error fetching category products"
        });
    }
};


// GET /api/store/:category/:id
const getProductById = async (req, res) => {
    try {
        const { category, id } = req.params;

        const product = await Product.findOne({
            _id: id,
            category
        });

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false ,
                message: "Invalid product ID"
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false ,
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: "Error fetching product"
        });
    }
};


// POST /api/admin/products
const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            availability,
            image,
            description,
            notes
        } = req.body;

        const product = await Product.create({
            name,
            category,
            price,
            availability,
            image,
            description,
            notes
        });

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false ,
                message: error.message
            });
        }

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: "Error creating product"
        });
    }
};


// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false ,
                message: "Invalid product ID"
            });
        }

        const allowedFields = [
            "name",
            "category",
            "price",
            "availability",
            "image",
            "description",
            "notes"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (Object.hasOwn(req.body, field)) {
                updates[field] = req.body[field];
            }
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false ,
                message: error.message
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false ,
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: "Error updating product"
        });
    }
};


// DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false ,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false ,
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: "Error deleting product"
        });
    }
};


module.exports = {
    getAllProducts,
    getProductsByCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
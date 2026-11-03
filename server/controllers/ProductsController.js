const mongoose = require("mongoose");
const Product = require("../models/Product");
const { validateProductInput, CATEGORIES } = require("../utils/validators");

async function getAllProducts(req, res, next) {
    try {
        const { category } = req.query;
        if (category !== undefined && !CATEGORIES.includes(category)) {
            return res.status(400).json({ success: false, message: "Μη έγκυρη κατηγορία." });
        }
        const products = await Product.find(category ? { category } : {}).sort({ createdAt: 1, _id: 1 }).lean();
        return res.json(products);
    } catch (error) { next(error); }
}

async function getProductsByCategory(req, res, next) {
    if (!CATEGORIES.includes(req.params.category)) {
        return res.status(404).json({ success: false, message: "Η κατηγορία δεν βρέθηκε." });
    }
    try {
        const products = await Product.find({ category: req.params.category }).sort({ createdAt: 1, _id: 1 }).lean();
        return res.json(products);
    } catch (error) { next(error); }
}

async function getProductById(req, res, next) {
    try {
        const { id, category } = req.params;
        if (!mongoose.isValidObjectId(id)){
            return res.status(400).json({ success: false, message: "Μη έγκυρο product ID." });
        }

        if (category && !CATEGORIES.includes(category)){
            return res.status(404).json({ success: false, message: "Η κατηγορία δεν βρέθηκε." });
        }

        const product = await Product.findOne({ _id: id, ...(category ? { category } : {}) }).lean();
        
        if (!product){
            return res.status(404).json({ success: false, message: "Το προϊόν δεν βρέθηκε." });
        }

        return res.json(product);
    } catch (error) {
        next(error);
    }
}

async function createProduct(req, res, next) {
    try {
        const error = validateProductInput(req.body);
        if (error){
             return res.status(400).json({ success: false, message: error });
        }
        const product = await Product.create({ ...req.body, name: req.body.name.trim() });
        return res.status(201).json(product);

    }
    catch (error) {
        next(error);
    }
}

async function updateProduct(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({ success: false, message: "Μη έγκυρο product ID." });
        }
        const error = validateProductInput(req.body, true);

        if (error){
            return res.status(400).json({ success: false, message: error });
        }
        const updates = { ...req.body };

        if ("name" in updates){
             updates.name = updates.name.trim();
        }
        const product = await Product.findByIdAndUpdate(req.params.id, { $set: updates }, {
            new: true, runValidators: true
        });

        if (!product){
            return res.status(404).json({ success: false, message: "Το προϊόν δεν βρέθηκε." });
        }
        return res.json(product);
    } catch (error) {
        next(error);
    }
}

async function deleteProduct(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({ success: false, message: "Μη έγκυρο product ID." });
        }
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product){
            return res.status(404).json({ success: false, message: "Το προϊόν δεν βρέθηκε." });
        }
        return res.json({ success: true, message: "Το προϊόν διαγράφηκε." });
    } catch (error) {
        next(error);
    }
}
module.exports = {
    getAllProducts,
    getProductsByCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { validateProductInput, CATEGORIES } = require("../utils/validators");


async function getAllProducts(req, res, next) {
    try {
        const { category } = req.query;

        if (
            category !== undefined &&
            !CATEGORIES.includes(category)
        ) {
            return res.status(400).json({
                success: false,
                message: "Μη έγκυρη κατηγορία."
            });
        }

        const products = await Product.find(
            category ? { category } : {}
        )
            .sort({ createdAt: 1, _id: 1 })
            .lean();

        const ratings = await Review.aggregate([
            {
                $group: {
                    _id: "$product",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);

        const ratingsMap = new Map(
            ratings.map(r => [
                String(r._id),
                r
            ])
        );

        const result = products.map(product => {
            const stats = ratingsMap.get(
                String(product._id)
            );

            return {
                ...product,
                averageRating: stats?.averageRating ?? 0,
                reviewCount: stats?.reviewCount ?? 0
            };
        });

        return res.json(result);

    } catch (error) {
        next(error);
    }
}

//epistrefei proionta ana selida
async function paginatedProducts(req, res, next) {

    //an den exei dothei page, sunexizei sto palio endpoint
    if (req.query.page === undefined) {
        return next();
    }

    try {
        const page = Number(req.query.page);
        const limit = 6;

        //elegxos egkurotitas selidas
        if (
            !Number.isSafeInteger(page) ||
            page < 1 ||
            typeof req.query.page !== "string"
        ) {
            return res.status(400).json({
                message: "Μη έγκυρος αριθμός σελίδας."
            });
        }

        const skip = (page - 1) * limit;

        const filter = {};

        //filtro kathgorias
        if (
            typeof req.query.category === "string" &&
            req.query.category !== "all"
        ) {
            filter.category = req.query.category;
        }

        //anazhthsh proiontos
        if (
            typeof req.query.search === "string" &&
            req.query.search.trim()
        ) {
            const search = req.query.search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        //taxinomhsh
        let sorting = { _id: 1 };

        if (req.query.sort === "price-asc") {
            sorting = { price: 1, _id: 1 };
        }

        if (req.query.sort === "price-desc") {
            sorting = { price: -1, _id: 1 };
        }

        //sunolikos arithmos proiontwn
        const totalProducts = await Product.countDocuments(filter);

        //proionta ths sugkekrimenhs selidas
        const products = await Product.find(filter)
            .sort(sorting)
            .skip(skip)
            .limit(limit)
            .lean();

        //upologismos ratings gia ta proionta ths selidas
        const ratings = await Review.aggregate([
            {
                $match: {
                    product: {
                        $in: products.map(p => p._id)
                    }
                }
            },
            {
                $group: {
                    _id: "$product",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);

        //dhmiourgia map me ta ratings
        const ratingsMap = new Map(
            ratings.map(r => [
                String(r._id),
                r
            ])
        );

            //prosthikh ratings sta proionta
            const productsWithRatings = products.map(product => {

                const stats = ratingsMap.get(
                    String(product._id)
                );

                return {
                    ...product,
                    averageRating: stats?.averageRating ?? 0,
                    reviewCount: stats?.reviewCount ?? 0
                };
            });

            //sunolikes selides
            const totalPages = Math.max(
                1,
                Math.ceil(totalProducts / limit)
            );

            //epistrofh proiontwn me ratings kai pagination
            return res.json({
                products: productsWithRatings,
                currentPage: page,
                totalPages,
                totalProducts,
                limit
            });

    } catch (error) {
        next(error);
    }
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
    deleteProduct,
    paginatedProducts
};

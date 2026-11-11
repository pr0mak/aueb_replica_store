
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");

// GET /api/products/:id/reviews
exports.getReviews = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Μη έγκυρο ID προϊόντος."
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Το προϊόν δεν βρέθηκε."
            });
        }

        const reviews = await Review.find({ product: id })
            .populate("user", "firstname lastname")
            .sort({ createdAt: -1 })
            .lean();

        const count = reviews.length;

        const averageRating = count
            ? reviews.reduce(
                (sum, review) => sum + review.rating, 0
            ) / count
            : 0;

        return res.json({
            reviews,
            averageRating,
            reviewCount: count
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Σφάλμα φόρτωσης αξιολογήσεων."
        });
    }
};

// POST /api/products/:id/reviews
exports.saveReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user?._id || req.user?.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Μη έγκυρο ID προϊόντος."
            });
        }

        if (
            typeof rating !== "number" ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                message: "Η βαθμολογία πρέπει να είναι από 1 έως 5."
            });
        }

        if (
            typeof comment !== "string" ||
            !comment.trim() ||
            comment.trim().length > 1000
        ) {
            return res.status(400).json({
                message: "Το σχόλιο πρέπει να έχει 1 έως 1000 χαρακτήρες."
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Το προϊόν δεν βρέθηκε."
            });
        }

        const review = await Review.findOneAndUpdate(
            { product: id, user: userId },
            {
                $set: {
                    rating,
                    comment: comment.trim()
                }
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Η αξιολόγηση αποθηκεύτηκε.",
            review
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Υπάρχει ήδη αξιολόγηση για αυτό το προϊόν. Δοκίμασε ξανά."
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Σφάλμα αποθήκευσης αξιολόγησης."
        });
    }
};

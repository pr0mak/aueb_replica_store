
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

// POST /api/buy/checkout
const checkout = async (req, res) => {
    const { items } = req.body || {};

    //check cart
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Cart is empty or invalid"
        });
    }

    //check user
    const userId = req.user?.id || req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user"
        });
    }

    //check products/quant
    const quantities = new Map();
    for (const item of items) {
        if (
            !item ||
            !mongoose.isValidObjectId(item.productId) ||
            !Number.isSafeInteger(item.quantity) ||
            item.quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or quantity"
            });
        }

        const productId = item.productId.toString();

        const quantity =
            (quantities.get(productId) || 0) + item.quantity;

        if (!Number.isSafeInteger(quantity)) {
            return res.status(400).json({
                success: false,
                message: "Invalid total quantity"
            });
        }

        quantities.set(productId, quantity);
    }

    try {
        const order = await mongoose.connection.transaction(
            async (session) => {
                const orderProducts = [];
                let totalAmount = 0;

                for (const [productId, quantity] of quantities) {

                    //check stock and refresh quantinty
                    const product = await Product.findOneAndUpdate(
                        {
                            _id: productId,
                            availability: { $gte: quantity }
                        },
                        {
                            $inc: { availability: -quantity }
                        },
                        {
                            new: false,
                            session
                        }
                    );

                    if (!product) {
                        const error = new Error(
                            "Product not found or insufficient stock"
                        );
                        error.status = 409;
                        throw error;
                    }

                    //add product in order
                    orderProducts.push({
                        product: product._id,
                        quantity: quantity,
                        price: product.price
                    });

                    totalAmount += product.price * quantity;
                }

                totalAmount =
                    Math.round((totalAmount + Number.EPSILON) * 100) / 100;

                //create new order
                const [newOrder] = await Order.create(
                    [{
                        user: userId,
                        products: orderProducts,
                        totalAmount: totalAmount,
                        status: "Σε επεξεργασία"
                    }],
                    { session }
                );

                return newOrder;
            }
        );

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: order
        });

    } catch (error) {
        console.error("Checkout error:", error);

        if (error.status === 409) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error completing checkout"
        });
    }
};

module.exports = {
    checkout
};
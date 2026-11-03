
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

const authenticatedUserId = (req) =>
    req.user?._id || req.user?.id;


// POST /api/orders
const createOrder = async (req, res) => {
    const userId = authenticatedUserId(req);

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user"
        });
    }

    const { items } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Cart is empty or invalid"
        });
    }

    const quantities = new Map();

    for (const item of items) {
        if (
            !item ||
            typeof item.productId !== "string" ||
            !mongoose.isValidObjectId(item.productId) ||
            !Number.isSafeInteger(item.quantity) ||
            item.quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or quantity"
            });
        }

        const id = item.productId.toLowerCase();

        const quantity =
            (quantities.get(id) || 0) + item.quantity;

        if (!Number.isSafeInteger(quantity)) {
            return res.status(400).json({
                success: false,
                message: "Invalid total quantity"
            });
        }

        quantities.set(id, quantity);
    }

    try {
        const order = await mongoose.connection.transaction(
            async (session) => {
                const products = [];
                let totalCents = 0;

                for (const [productId, quantity] of quantities) {

                    // Check stock and decrease availability
                    const product = await Product.findOneAndUpdate(
                        {
                            _id: productId,
                            availability: { $gte: quantity }
                        },
                        {
                            $inc: { availability: -quantity }
                        },
                        {
                            returnDocument: "before",
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

                    // Calculate price using integer cents
                    const priceCents = Math.round(
                        product.price * 100
                    );

                    if (
                        !Number.isSafeInteger(priceCents) ||
                        priceCents < 0 ||
                        !Number.isSafeInteger(
                            totalCents + priceCents * quantity
                        )
                    ) {
                        throw new Error(
                            "Invalid product price or order total"
                        );
                    }

                    // Save product snapshot
                    products.push({
                        product: product._id,
                        name: product.name,
                        quantity,
                        price: priceCents / 100
                    });

                    totalCents += priceCents * quantity;
                }

                // Create order
                const [created] = await Order.create(
                    [{
                        user: userId,
                        products,
                        totalAmount: totalCents / 100,
                        status: "Σε επεξεργασία"
                    }],
                    { session }
                );

                return created;
            }
        );

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
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


// GET /api/orders
const getMyOrders = async (req, res) => {
    const userId = authenticatedUserId(req);

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user"
        });
    }

    try {
        const orders = await Order.find({
            user: userId
        })
        .sort({ createdAt: -1 })
        .lean();

        return res.status(200).json(orders);

    } catch (error) {
        console.error("Get orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching orders"
        });
    }
};


module.exports = {
    createOrder,
    getMyOrders
};

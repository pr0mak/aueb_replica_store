const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { validateOrderItems } = require("../utils/validators");

async function myOrders(req, res, next) {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();

        return res.json(orders);

    } catch (error) {
        next(error);
    }
}

async function checkout(req, res, next) {
    const quantities = validateOrderItems(req.body?.items, mongoose.isValidObjectId);
    if (typeof quantities === "string"){
        return res.status(400).json({ success: false, message: quantities });
    }
    try {
        const order = await mongoose.connection.transaction(async (session) => {
            const orderProducts = [];
            let totalCents = 0;
            for (const [productId, quantity] of quantities) {
                const product = await Product.findOneAndUpdate(
                    { _id: productId, availability: { $gte: quantity } },
                    { $inc: { availability: -quantity } },
                    { new: false, session }
                );
                if (!product) {
                    const error = new Error("Το προϊόν δεν υπάρχει ή δεν υπάρχει αρκετό απόθεμα.");
                    error.status = 409;
                    throw error;
                }
                totalCents += Math.round(product.price * 100) * quantity;
                orderProducts.push({
                    product: product._id, name: product.name, price: product.price, quantity
                });
            }
            const [saved] = await Order.create([{
                user: req.user.id, products: orderProducts,
                totalAmount: totalCents / 100, status: "Σε επεξεργασία"
            }], { session });
            return saved;
        });
        return res.status(201).json({ success: true, message: "Η παραγγελία καταχωρίστηκε.", order });
    } catch (error) {
        if (error.status === 409){
            return res.status(409).json({ success: false, message: error.message });
        }
        next(error);
    }
}
module.exports = {
    myOrders,
    checkout
};
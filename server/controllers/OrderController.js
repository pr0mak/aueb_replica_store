const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { validateOrderItems } = require("../utils/validators");

//epistrefei paragelies sundedemenou user
async function myOrders(req, res, next) {
    try {
        const orders = await Order.find({
            user: req.user.id
        })
            .sort({ createdAt: -1 })
            .lean();

        return res.json(orders);

    } catch (error) {
        next(error);
    }
}

//dhmiourgia paraggelias
async function checkout(req, res, next) {

    //elegxos twn proiontwn kai twn posothtwn
    const quantities = validateOrderItems(
        req.body?.items,
        mongoose.isValidObjectId
    );

    if (typeof quantities === "string") {
        return res.status(400).json({
            success: false,
            message: quantities
        });
    }

    //kratame osa proionta exoun hdh meiwthei wste na epenaferoume to apothema se periptwsh apotuxias
    const reservedProducts = [];

    let order;

    try {
        const orderProducts = [];
        let totalCents = 0;

        for (const [productId, quantity] of quantities) {

            //vriskoume to proion kai meiwnoume to apothema mono efoson uparxei eparkhs posothta
            const product = await Product.findOneAndUpdate(
                {
                    _id: productId,
                    availability: { $gte: quantity }
                },
                {
                    $inc: { availability: -quantity }
                },
                {
                    returnDocument: "before"
                }
            );

            //to proion den uparxei h den uparxei arketo apothema
            if (!product) {
                const error = new Error(
                    "Το προϊόν δεν υπάρχει ή δεν υπάρχει αρκετό απόθεμα."
                );

                error.status = 409;
                throw error;
            }

            //apothikevoume thn allagh gia pithanh epanafora
            reservedProducts.push({
                productId: product._id,
                quantity
            });

            //upologismos timhs apo db
            totalCents += Math.round(product.price * 100) * quantity;

            //stoixeia proiontos gia thn paraggelia
            orderProducts.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity
            });
        }

        //dhmiourgia paraggelias
        const saved = await Order.create({
            user: req.user.id,
            products: orderProducts,
            totalAmount: totalCents / 100,
            status: "Καταχωρημένη"
        });

        order = saved;

    } catch (error) {

        //an kati apotuxei prospathoume na epanaferoume tis posoties pou meiwthikan
        let rollbackFailed = false;

        for (const item of reservedProducts.reverse()) {
            try {
                const result = await Product.updateOne(
                    { _id: item.productId },
                    { $inc: { availability: item.quantity } }
                );

                if (result.matchedCount !== 1) {
                    rollbackFailed = true;
                    console.error(
                        "Δεν βρέθηκε προϊόν για επαναφορά:",
                        item.productId
                    );
                }

            } catch (rollbackError) {
                rollbackFailed = true;
                console.error(
                    "Αποτυχία επαναφοράς αποθέματος:",
                    rollbackError
                );
            }
        }

        //an apetuxe h epanafora apaiteiatai elegxos ths paraggelias kai tou apothematos
        if (rollbackFailed) {
            console.error("Αποτυχία checkout:", error);

            return res.status(500).json({
                success: false,
                message: "Αποτυχία παραγγελίας και επαναφοράς αποθέματος. Απαιτείται έλεγχος."
            });
        }

        //anuparkes apothema h anuparkto proion
        if (error.status === 409) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return next(error);
    }

    //h paragelia apothikeutike epitixws
    return res.status(201).json({
        success: true,
        message: "Η παραγγελία καταχωρίστηκε.",
        order
    });
}

module.exports = {
    myOrders,
    checkout
};

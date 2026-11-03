
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ["clothes", "accessories", "office_supplies"]
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    availability: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Availability must be an integer"
        }
    },
    image: {
        type: String
    },
    description: {
        type: String
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);

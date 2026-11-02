const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: Number, required: true, default: 0 },
    image: { type: String },
    description: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
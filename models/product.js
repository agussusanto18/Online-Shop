const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    productPhotos: [String],
    condition: {
        type: String,
        enum: ['new', 'used'],
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'out of stock', 'discontinued'],
        default: 'available'
    },
    productStock: {
        type: Number,
        default: 0
    },
    productWeight: {
        type: Number, // Weight in grams or kilograms
        required: true
    },
    productSize: {
        type: String, // Size format e.g., "10x5x2 cm"
        required: true
    },
    rated: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

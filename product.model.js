const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
    name: String,
    categoryId: String,
    description: String,
    price: {
        value: Number,
        currency: String
    },
    photos: [String],
    promo: {
        discount: Number,
        until: Number
    },
    amount: Number
});

mongoose.model('Product', Product);

module.exports = mongoose.model('Product');
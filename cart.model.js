const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart = new Schema({
    uid: String,
    totalCount: Number,
    totalValue: {
        value: Number,
        currency: String
    },
    items: [{
        amount: Number,
        product: {
            _id: String,
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
        }
    }],
});

mongoose.model('Cart', Cart);
module.exports = mongoose.model('Cart');

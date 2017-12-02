const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart = new Schema({
    uid: String,
    totalValue: {
        value: Number,
        currency: String
    },
    items: [{
        name: String,
        price: {
            value: Number,
            currency: String
        },
        amount: Number
    }],
    status: String
});

mongoose.model('Cart', Cart);
module.exports = mongoose.model('Cart');

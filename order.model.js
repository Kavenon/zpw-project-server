const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = new Schema({
    name: String,
    street: String,
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
    }]
});

mongoose.model('Order', Order);
module.exports = mongoose.model('Order');
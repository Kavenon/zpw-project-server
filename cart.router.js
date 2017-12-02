const admin = require("firebase-admin");
const express = require('express');

const router = express.Router();

const CartModel = require('./cart.model');
const getUid = require('./auth-tool');

router.post('/user/cart', function (req, res) {

    getUid(req.query.auth)
        .then(function (uid) {
            const items = req.body.items.map(item => {
                return {
                    _id: item._id,
                    name: item.name,
                    price: {
                        value: item.price.value,
                        currency: item.price.currency
                    },
                    amount: item.amount,
                }
            });
            new CartModel({
                uid: uid,
                totalValue: {
                    value: req.body.totalValue.value,
                    currency: req.body.totalValue.currency
                },
                items: items,
            }).save(function (err, order) {
                res.json(order);
            });
        })

});

router.get('/user/cart', function (req, res) {

    getUid(req.query.auth)
        .then(function (uid) {
            CartModel.find({uid: uid}, function (e, cart) {
                res.json(cart);
            });
        });

});


module.exports = router;

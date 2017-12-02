const admin = require("firebase-admin");
const express = require('express');

const router = express.Router();

const CartModel = require('./cart.model');
const getUid = require('./auth-tool');

router.post('/user/cart', function (req, res) {

    getUid(req.query.auth)
        .then(function (uid) {
            req.body.uid = uid;
            CartModel.remove({uid: uid}, function (e, c) {
                new CartModel(req.body).save(function (err, order) {
                    res.json(order);
                });
            });

        })

});

router.get('/user/cart', function (req, res) {

    getUid(req.query.auth)
        .then(function (uid) {
            CartModel.findOne({uid: uid}, function (e, cart) {
                res.json(cart);
            });
        });

});


module.exports = router;

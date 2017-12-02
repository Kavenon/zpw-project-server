const admin = require("firebase-admin");
const express = require('express');
const guard = require('./auth-guard');

const router = express.Router();

const OrderModel = require('./order.model');
const socket = require('./socket');
const ProductModel = require('./product.model');
const CartModel = require('./cart.model');

const getUid = require('./auth-tool');

let checkIfStorageHasProducts = function (req) {
    return req.body.items.map(item => {
        return new Promise(function (resolve, reject) {
            ProductModel.findById(item._id, function (err, product) {
                if (!product) {
                    console.error('There is no such product', item);
                    reject();
                }
                else {
                    if (product.amount >= item.amount) {
                        resolve();
                    }
                    else {
                        console.error('No product in storage', item);
                        reject();
                    }
                }
            });
        });
    });
};
let decreateAndNotifyAmountChange = function (items) {
    items.map(item => {
        ProductModel.findByIdAndUpdate(item._id, {
            $inc: {
                amount: -item.amount
            }
        }, {new: true}, function (err, product) {
            socket.broadcast({
                type: 'order.created',
                product: product
            });
        })

    });
};

router.get('/admin/order', function (req, res) {

    OrderModel.find({}, function (dbRq, dbRs) {
        res.json(dbRs);
    })

});

router.get('/user/order', function (req, res) {

    guard(req)
        .then(user => {
            OrderModel.find({uid: user.uid}, function (dbRq, dbRs) {
                res.json(dbRs);
            })
        })

});

router.post('/admin/order/:id/done', function (req, res) {

    OrderModel.findByIdAndUpdate(req.params.id, {
        $set: {
            status: 'DONE',
        }
    }, {new: true}, function (err, order) {
        res.json(order);
    });

});


router.post('/order', function (req, res) {

    const promises = checkIfStorageHasProducts(req);

    Promise.all(promises)
        .then(_ => getUid(req.query.auth))
        .then(function (uid) {

            if (uid) {
                CartModel.remove({uid: uid}, function (e, c) {
                });
            }

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
            new OrderModel({
                uid: uid,
                name: req.body.name,
                street: req.body.street,
                totalValue: {
                    value: req.body.totalValue.value,
                    currency: req.body.totalValue.currency
                },
                items: items,
                status: req.body.status
            }).save(function (err, order) {
                decreateAndNotifyAmountChange(items);
                res.json(order);
            });

        })
        .catch(function () {
            res.status(400);
        });

});

module.exports = router;

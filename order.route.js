const admin = require("firebase-admin");
const express = require('express');
const guard = require('./auth-guard');

const router = express.Router();

const OrderModel = require('./order.model');
const socket = require('./socket');
const ProductModel = require('./product.model');

router.get('/order', function (req, res) {

    guard(req).then(_ => {
        OrderModel.find({}, function (dbRq, dbRs) {
            res.json(dbRs);
        })
    })
        .catch(_ => {
            res.send(401);
        });

});

router.get('/order/me', function (req, res) {

    guard(req)
        .then(getUid)
        .then(uid => {
            OrderModel.find({uid: uid}, function (dbRq, dbRs) {
                res.json(dbRs);
            })
        })
        .catch(_ => {
            res.send(401);
        });

});

router.post('/order/:id/done', function (req, res) {

    guard(req)
        .then(_ => {
            OrderModel.findByIdAndUpdate(req.params.id, {
                $set: {
                    status: 'DONE',
                }
            }, {new: true}, function (err, order) {
                res.json(order);
            });
        })
        .catch(_ => {
            res.send(401);
        });

});

let checkIfStorageHasProducts = function (req) {
    return req.body.items.map(item => {
        return new Promise(function (resolve, reject) {
            ProductModel.findById(item._id, function (err, product) {
                if (!product) {
                    console.error('There is no such product', item);
                    reject();
                }
                if (product.amount >= item.amount) {
                    resolve();
                }
                else {
                    console.error('No product in storage', item);
                    reject();
                }
            });
        });
    });
};
let decreateAndNotifyAmountChange = function (items) {
    items.map(item => {
        console.log('testxx', item);

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
router.post('/order', function (req, res) {

    const promises = checkIfStorageHasProducts(req);

    Promise.all(promises)
        .then(getUid)
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

function getUid() {
    return new Promise((resolve, reject) => {
        let userp = admin.auth().createUser();
        userp.then(user => {
            if (user) {
                resolve(user.uid);
            }
            else {
                resolve(null);
            }
        })
            .catch(_ => resolve(null));
    })
}

module.exports = router;

const express = require('express');
const guard = require('./auth-guard');

const router = express.Router();

const OrderModel = require('./order.model');

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

router.post('/order/:id/done', function (req, res) {

    guard(req).then(_ => {
        OrderModel.findByIdAndUpdate(req.params.id, {
            $set: {
                status: 'DONE',
            }
        }, function (err, order) {
            res.json(order);
        });
    })
        .catch(_ => {
            res.send(401);
        });

});

router.post('/order', function (req, res) {

    const items = req.body.items.map(item => {
        return {
            name: item.name,
            price: {
                value: item.price.value,
                currency: item.price.currency
            },
            amount: item.amount,
        }
    });
    new OrderModel({
        name: req.body.name,
        street: req.body.street,
        totalValue: {
            value: req.body.totalValue.value,
            currency: req.body.totalValue.currency
        },
        items: items,
        status: req.body.status
    }).save(function (err, product) {
        res.json(product);
    });

});

module.exports = router;

const express = require('express');
const guard = require('./auth-guard');
const _ = require('lodash');

const router = express.Router();

const ProductModel = require('./product.model');

router.get('/product/all', function (req, res) {

    ProductModel.find({}, function (dbRq, dbRs) {
        res.json(dbRs);
    });

});

router.get('/product/:id', function (req, res) {

    const id = req.params.id;

    ProductModel.findById(id, function (dbRq, dbRs) {
        res.json(dbRs);
    });

});

router.delete('/product/:id', function (req, res) {

    guard(req).
    then(_ => {
        const id = req.params.id;

        ProductModel.findByIdAndRemove(id, function (dbRq, dbRs) {
            res.json({success: true});
        });
    })
    .catch(_ => {
        res.send(401);
    });



});

router.post('/product', function (req, res) {

    guard(req).
    then(_ => {
        new ProductModel({
            name: req.body.name,
            description: req.body.description,
            categoryId: req.body.categoryId,
            price: {
                value: req.body.price.value,
                currency: req.body.price.currency
            }
        }).save(function (err, product) {
            res.json(product);
        });
    })
    .catch(_ => {
        res.send(401);
    });

});

router.put('/product/:id', function (req, res) {

    guard(req).
    then(_ => {
        ProductModel.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                categoryId: req.body.categoryId,
                description: req.body.description,
                price: {
                    value: req.body.price.value,
                    currency: req.body.price.currency
                }
            }
        }, function (err, product) {
            res.json(product);
        })
    })
    .catch(_ => {
        res.send(401);
    });

});

router.get('/product', function (req, res) {

    const defaultFilter = {
        term: null,
        categories: [],
        price: []
    };

    let userFilter = {};
    if (req.query.filter) {
        try {
            userFilter = JSON.parse(req.query.filter);
        }
        catch (e) {
            console.log('Filter parse failed', e);
        }
    }
    let pagination = {
        perPage: 1,
        page: 1,
    };

    if (req.query.pagination) {
        try {
            pagination = JSON.parse(req.query.pagination);
        }
        catch (e) {
            console.log('pagination parse failed', e);
        }
    }


    const filter = _.merge({}, defaultFilter, userFilter);

    let query = {
        '$and': []
    };

    if (filter.term) {
        query['$and'].push({
            '$or': [
                {
                    'name': {
                        $regex: '.*' + filter.term + '.*',
                        $options: 'i'
                    }
                },
                {
                    'description': {
                        $regex: '.*' + filter.term + '.*',
                        $options: 'i'
                    }
                },
            ]
        });
    }

    if (filter.categories && filter.categories.length > 0) {
        query['$and'].push({
            'categoryId': {
                "$in": filter.categories
            }
        });
    }

    if (filter.price && filter.price.length === 2) {
        query['$and'].push({
            'price.value': {
                $gt: filter.price[0],
                $lt: filter.price[1]
            }
        });
    }

    console.log(JSON.stringify(query));

    ProductModel.count(query, function (dbRq, allProductCount) {
        const start = (pagination.page - 1) * pagination.perPage;

        ProductModel.find(query, function (dbRq, dbRs) {
            res.json({
                total: allProductCount,
                items: dbRs,
            });
        }).skip(start).limit(pagination.perPage);
    });


});

module.exports = router;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); // parse application/json
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");

    next();
});
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin@ds113906.mlab.com:13906/zpw-2017');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'błąd połączenia...'));
db.once('open', function () {
    console.log('database connected');
// połączenie udane!
});

var Schema = mongoose.Schema;
var Product = new Schema({
    name: String,
    categoryId: String,
    description: String,
    price: {
        value: Number,
        currency: String
    }
});

var Category = new Schema({
    name: String,
});

var Order = new Schema({
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


mongoose.model('Category', Category);
mongoose.model('Product', Product);
mongoose.model('Order', Order);


var CategoryModel = mongoose.model('Category');
var ProductModel = mongoose.model('Product');
var OrderModel = mongoose.model('Order');


var _ = require('lodash');

app.get('/category', function (req, res) {

    CategoryModel.find({}, function (dbRq, dbRs) {
        res.json(dbRs);
    });

});

app.get('/order', function (req, res) {

    OrderModel.find({}, function (dbRq, dbRs) {
        res.json(dbRs);
    });

});

app.post('/order', function (req, res) {

    const items = req.body.items.map(item => {
       return {
           name: item.name,
           price: {
               value: item.price.value,
               currency: item.price.currency
           },
           amount: item.amount
       }
    });
    new OrderModel({
        name: req.body.name,
        street: req.body.street,
        totalValue: {
            value: req.body.totalValue.value,
            currency: req.body.totalValue.currency
        },
        items: items
    }).save(function (err, product) {
        res.json(product);
    });

});

app.get('/product/all', function (req, res) {

    ProductModel.find({}, function (dbRq, dbRs) {
        res.json(dbRs);
    });

});

app.get('/product/:id', function (req, res) {

    const id = req.params.id;

    ProductModel.findById(id, function (dbRq, dbRs) {
        res.json(dbRs);
    });

});

app.delete('/product/:id', function (req, res) {

    const id = req.params.id;

    ProductModel.findByIdAndRemove(id, function (dbRq, dbRs) {
        res.json({success: true});
    });

});

app.post('/product', function (req, res) {

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

});

app.put('/product/:id', function (req, res) {

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

});

app.get('/product', function (req, res) {

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
    console.log(filter);

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

app.listen(5000);
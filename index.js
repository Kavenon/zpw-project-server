var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json

var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin@ds113906.mlab.com:13906/zpw-2017');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'błąd połączenia...'));
db.once('open', function() {
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


mongoose.model('Category', Category);
mongoose.model('Product', Product);


var CategoryModel = mongoose.model('Category');
var ProductModel = mongoose.model('Product');


var _ = require('lodash');

app.get('/product/all', function(req, res){

    ProductModel.find({}, function(dbRq, dbRs){
        res.json(dbRs);
    });

});
app.get('/product', function (req, res) {

    const defaultFilter = {
        term: null,
        categories: [],
        price: []
    };

    let userFilter = {};
    if(req.query.filter){
        try {
            userFilter = JSON.parse(req.query.filter);
        }
        catch(e){
            console.log('Filter parse failed', e);
        }
    }
    let pagination = {
        perPage: 1,
        page: 1,
    };

    if(req.query.pagination){
        try {
            pagination = JSON.parse(req.query.pagination);
        }
        catch(e){
            console.log('pagination parse failed', e);
        }
    }


    const filter = _.merge({}, defaultFilter, userFilter);
    console.log(filter);

    let query = {
    };

    if(filter.term){
        query['name'] = new RegExp('^'+filter.term+'$', "i");
    }

    if(filter.categories && filter.categories.length > 0){
        query['categoryId'] = {
            "$in" : filter.categories
        };
    }

    if(filter.price && filter.price.length === 2){
        query['price.value'] = {
            $gt: filter.price[0],
            $lt: filter.price[1]
        }
    }

    console.log(pagination);

    ProductModel.count({}, function(dbRq, allProductCount){
        const start = (pagination.page - 1) * pagination.perPage;

        ProductModel.find(query, function(dbRq, dbRs){
            res.json({
               total: allProductCount,
               items: dbRs,
            });
        }).skip(start).limit(pagination.perPage);
    });


});

app.listen(5000);
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
    id: Number,
    name: String,
    description: String,
    price: {
        value: Number,
        currency: String
    },
    categoryId: String
});

var Category = new Schema({
    name: String,
});

mongoose.model('Product', Product);

var ProductModel = mongoose.model('Product');



app.get('/product/all', function(req, res){

    ProductModel.find({}, function(dbRq, dbRs){
        res.json(dbRs);
    });

});
app.get('/product', function (req, res) {

    console.log(JSON.parse(req.query.filter)); // to bedzie json
    fs.readFile( __dirname + '/' + 'product.json', 'utf8', function (err, data) {
        // console.log( data );
        res.end( data );
    });
});

app.listen(5000);
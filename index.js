const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); // parse application/json
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    next();
});

const mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin@ds113906.mlab.com:13906/zpw-2017', {
    useMongoClient: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection failed....'));
db.once('open', function () {
    console.log('database connected');
});

require('./auth');

app.use(require('./order.route'));
app.use(require('./product.route'));
app.use(require('./category.route'));


app.listen(5000);
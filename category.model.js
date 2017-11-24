const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = new Schema({
    name: String,
});

mongoose.model('Category', Category);

module.exports = mongoose.model('Category');

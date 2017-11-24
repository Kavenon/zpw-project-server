const express = require('express');
const router = express.Router();

const CategoryModel = require('./category.model');

router.get('/category', function (req, res) {

    CategoryModel.find({}, function (dbRq, dbRs) {
        res.json(dbRs);
    });

});

module.exports = router;
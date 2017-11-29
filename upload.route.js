const express = require('express');
const router = express.Router();
const fs = require('fs');

router.post('/upload', function (req, res) {

    const file = req.files.file;
    const split = file.name.split('.');
    const extension = split[split.length - 1];
    const path = "uploads/" + new Date().getTime() + 100000*Math.random() + '.' + extension;
    const newPath = __dirname + "/" + path;
    const fileStream = fs.createWriteStream(newPath);
    fileStream.write(file.data);
    fileStream.end();

    res.json({
        url: path
    });

});

module.exports = router;
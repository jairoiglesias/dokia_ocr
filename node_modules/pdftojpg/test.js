var pdftojpg = require('.');
var fs = require('fs');
var path = require('path');
var temp = require('temp').track();
var assert = require('assert');

var testFile = path.join(__dirname, 'test.pdf');

temp.open({suffix: '.jpg'}, function(err, tempFile) {
    pdftojpg.convert(testFile, tempFile.path, function (err) {
        if (err) {
            throw err;
        } else {
            var buffer = fs.readFileSync(tempFile.path);
            assert(buffer[0] === 0xff && buffer[1] === 0xd8); // JPEG files starts with 0xff, 0xd8
        }
    });
});

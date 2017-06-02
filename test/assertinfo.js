var assert = require('assert'),
    colors = require('colors/safe'),
    pad = require('pad');

function equal(actual, expected, message) {
    assert.equal(actual, expected, message);
    console.log(colors.green(
        pad('actual: ' + actual, 20) + 
        pad('expected: ' + expected, 20) + 
        pad('message: ' + message, 0)
    ));
}

exports.equal = equal;
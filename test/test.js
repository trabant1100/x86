var assert = require('assert'),
	fs = require('fs');

var bios = null;

describe('x86', function() {
	var socket = null;

	beforeEach(function(done) {
		fs.readFile('./test/xtbios.bin', function(err, buf) {
			if(err) 
				throw err;
			// console.info('loaded bios', buf);
			bios = buf;
			done();
		});
	});

	describe('x86 test', function() {
		it('should get bios data', function() {
			assert.equal(true, bios != null);
		});
	});
});
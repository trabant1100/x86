var assert = require('assert'),
	fs = require('fs'),
	x86 = require('../src/x86');

var bios = null;

describe('x86', function() {
	var socket = null;

	before(function(done) {
		fs.readFile('./test/xtbios.bin', function(err, buf) {
			if(err) 
				throw err;
			// console.info('loaded bios', buf);
			bios = buf;
			done();
		});
	});

	describe('x86 test', function() {
		it('get bios data', function() {
			assert.equal(true, bios != null);
		});
		it('write bios into memory', function() {
			x86.mem.write(0xFE000, bios);
			assert.equal(true, x86.mem.ram[0] !== undefined);
		});
	});
});
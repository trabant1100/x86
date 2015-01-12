var _ = require('lodash'),
	assert = require('assert'),
	fs = require('fs'),
	csv = require('csv'),
	Promise = require('promise'),
	x86 = require('../src/x86');

var bios = null,
	ass = null;

describe('x86', function() {
	before(function(done) {
		function readBios(filename) {
			return new Promise(function(resolve, reject) {
				fs.readFile(filename, function(err, buf) {
					if(err)
						reject(err);
					else
						resolve(buf);
				});
			});
		}

		function readAsserts(filename) {
			return new Promise(function(resolve, reject) {
				var readStream = fs.createReadStream(filename, {flags: 'r', encoding: 'utf8'});
				var parser = csv.parse(), ass = [];

				try {
					readStream.pipe(csv.parse({delimiter: '\t', columns: true, auto_parse: true}))
						.pipe(csv.transform(function(record) {
							ass.push(_.mapValues(record, function(value) {
								return value === '' ? null : value;
							}));
						})).on('finish', function() {
							resolve(ass);
						});
				} catch(e) {
					reject(e);
				}
			});
		}

		readBios('./test/xtbios.bin').then(function(buf) {
			bios = buf;
			return readAsserts('./test/asserts.csv');
		}).then(function(ass) {
			// console.info(ass);
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
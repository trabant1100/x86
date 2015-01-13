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
					readStream.pipe(csv.parse({delimiter: ';', columns: true, auto_parse: true}))
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
		}).then(function(assertions) {
			ass = assertions;
			done();
		});
	});

	describe('x86 test', function() {
		it('get bios data', function() {
			assert.equal(true, bios != null);
		});
		it('get csv test data assertions', function() {
			assert.equal(true, ass != null);
		});
		it('write bios into memory', function() {
			x86.mem.write(0xFE000, bios);
			assert.equal(true, x86.mem.ram[0] !== undefined);
		});

		it('test opcodes', function() {
			x86.cpu.reset();
			x86.mem.write(0xFE000, bios);
			var assIdx = 0,
				cpuCount = 0;
			while(assIdx < 1) {
				x86.cpu.stepIn();
				if(cpuCount === ass[assIdx].cpu) {
					var curAss = ass[assIdx];
					
					for(var key in curAss) {
						if(curAss[key] != null && x86.cpu.regs[key] != null) {
							assert.equal(x86.cpu.regs[key], curAss[key], 
								key + ', ' + x86.cpu.regs[key] + ', ' + curAss[key]);
						}
					}
					
					assIdx ++;
				}
				cpuCount ++;
			}
		})
	});
});
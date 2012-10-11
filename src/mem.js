var mem = (function() {
	var ram = new Array(0xFFFFF);
	
	// fill with zeros
	(function() {
		var len = ram.length;
		do {
			ram[len] = null;
		} while(len --);
	})();
	
	// real (linear) address with memory wrap around
	var read = function(addr) {
		// TODO - is this needed?
		addr &= 0xFFFFF;
		
		if(addr == 0x410) throw 'Equipment word 0040:0010 - report CGA card';
		else if(addr == 0x475) throw 'Hard drive count';
		else if(addr >= 0xA0000 && addr <= 0xBFFFF) throw 'VGA memory read';
		
		
		/*console.info('read addr', addr.hex(), '=', (ram[addr] != null ? ram[addr] : -1).hex(), 
			'bios', (addr-0xFE000).hex());*/
		return ram[addr];
	}
	
	// real (linear) address - single byte write
	var write = function(addr, byt) {
		// TODO - is this needed?
		addr &= 0xFFFFF;
		/*console.warn('write addr', addr.hex(), (ram[addr] != null ? ram[addr] : -1).hex(), 
			'->', byt);*/
		
		ram[addr] = byt;
	}
	
	return {
		ram: ram,
		write: function(addr, data) {
			var i, len;
			for(i = 0, len = data.length; i < len; i ++) {
				if(addr + i > ram.length)
					throw 'End of memory';
				ram[addr + i] = data[i].charCodeAt(0);
			}
		},
		
		write8ea: function(addr, byt) {
			write(addr, byt);
		},
		
		write16ea: function(addr, word) {
			write(addr, word & 0xFF);
			write(addr+1, word >> 8);
		},
		
		read8: function(seg, offs) {
			return read((seg << 4) + offs);
		},
		
		read16: function(seg, offs) {
			return (read((seg << 4) + offs + 1) << 8) | (read((seg << 4) + offs));
		},
		
		read16ea: function(addr) {
			addr &= 0xFFFFF;
			return (read(addr) & 0xFF) + (read(addr+1) << 8);
		}
	}
})();
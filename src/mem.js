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
		
		console.info('read addr', addr.hex(), '=', (ram[addr] != null ? ram[addr] : -1).hex(), 'bios', (addr-0xFE000).hex());
		return ram[addr];
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
		
		read8: function(seg, offs) {
			//return ram[seg << 4 + offs];
			return read((seg << 4) + offs);
		},
		
		read16: function(seg, offs) {
			return (read((seg << 4) + offs + 1) << 8) | (read((seg << 4) + offs));
		}
	}
})();
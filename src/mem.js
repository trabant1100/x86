var mem = (function() {
	var ram = new Array(0xFFFFF);
	
	(function() {
		var len = ram.length;
		do {
			ram[len] = 0;
		} while(len --);
	})();
	
	return {
		ram: ram,
		write: function(addr, data) {
			var i, len;
			for(i = 0, len = data.length; i < len; i ++) {
				if(addr + i > ram.length)
					throw 'Out of memory';
				ram[addr + i] = data[i];
			}
		}
	}
})();
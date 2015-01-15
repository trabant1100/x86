var hercules = (function() {
	var base = null;

	return {
		getBase: function() {
			return base;
		},
		outport: function(port, val) {
			switch(port) {
				case 0x3B8:
					if(val & 0x80) {
						throw '[HERCULES] Unsupported port ' + port.hex() + ' with value ' + val;
					} else {
						base = 0xB0000;
						console.warn('[HERCULES]', 'Initialized on port [', port.hex(), 
							'] with value', val);
					}
				break;
				default:
					throw '[HERCULES] Unsupported port ' + port.hex() + ' with value ' + val;
			}
		}
	}
})();

for(var key in hercules) {
	exports[key] = hercules[key];
}
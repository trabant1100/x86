var pic = (function() {
	return {
		outport: function(port, val) {
			switch(port) {
				case 0xA0:
					console.warn('[PIC]', 'Controller #2 [' + port.hex() + ']', 'output value', val);
				break;
				default:
					throw '[PIC] Unsupported port ' + port.hex() + ' with value ' + val;
			}
		}
	}
})();

for(var key in pic) {
	exports[key] = pic[key];
}
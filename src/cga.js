var cga = (function() {
	return {
		outport: function(port, val) {
			switch(port) {
				case 0x3D8:
					console.warn('[CGA]', 'Initilized on port [', port.hex(), '] with value', val);
				break;
				default:
					throw '[CGA] Unsupported port ' + port.hex() + ' with value ' + val;
			}
		}
	}
})();
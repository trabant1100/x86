var dma = (function() {
	return {
		outport: function(port, val) {
			switch(port) {
				case 0x01:
					console.warn('[DMA]', 'Start Address Register ignored on port [' + 
						port.hex() + '] output value', val);
				break;
				case 0x08:
					console.warn('[DMA]', 'Status Register ignored on port [' + 
						port.hex() + '] output value', val);
				break;
				case 0x81:
					console.warn('[DMA]', 'Channel 2 Page Address Register ignored on port [' + 
						port.hex() + '] output value', val);
				break;
				case 0x82:
					console.warn('[DMA]', 'Channel 3 Page Address Register ignored on port [' + 
						port.hex() + '] output value', val);
				break;
				case 0x83:
					console.warn('[DMA]', 'Channel 1 Page Address Register ignored on port [' + 
						port.hex() + '] output value', val);
				break;
				case 0x0A:
					console.warn('[DMA]', 'Single Channel Mask Register ignored on port [' + 
						port.hex() + '] output value', val);
				break;
				case 0x0B:
					console.warn('[DMA]', 'Mode Register ignored on port [' + 
						port.hex() + '] output value', val);
				break;
				case 0x0D:
					console.warn('[DMA]', 'Intermeddate Register ignored on port [' + 
						port.hex() + '] output value', val);
				break;
				default:
					throw '[DMA] Unsupported port ' + port.hex() + ' with value ' + val;
			}
		}
	}
})();

for(var key in dma) {
	exports[key] = dma[key];
}
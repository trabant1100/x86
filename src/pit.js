var pit = (function() {
	// parse command
	var getCommand = function(val) {
		var cmd = {
			channel: val >> 6,
			accessMode: (val >> 4) & 0x3,
			operatingMode: (val >> 1) & 0x7,
			binaryMode: val & 0x1,
			value: val
		};
		
		return cmd;
	}
	
	var execCommand = function(cmd) {
		console.warn('[PIT]', pit.CHANNEL[cmd.channel], pit.ACCESS_MODE[cmd.accessMode],
			pit.OPERATING_MODE[cmd.operatingMode], pit.BINARY_MODE[cmd.binaryMode]);
		//throw '[PIT] Unknown command';
	}

	return {
		outport: function(port, val) {
			var cmd = null;
			switch(port) {
				case 0x40:
					console.warn('[PIT]', 'Channel 0 ignored on port [' + port.hex() + ']',
						'output value', val);
				break;
				case 0x41:
					console.warn('[PIT]', 'Channel 1 ignored on port [' + port.hex() + ']',
						'output value', val);
				break;
				case 0x43:
					console.warn('[PIT]', 'Mode/Command register [' + port.hex() + ']', 
						'output value', val);
					cmd = getCommand(val);
					execCommand(cmd);
				break;
				default:
					throw '[PIT] Unsupported port ' + port.hex() + ' with value ' + val;
			}
		}
	}
})();

pit.CHANNEL = ['Channel 0', 'Channel 1', 'Channel 2', 'Read-back command'];
pit.ACCESS_MODE = ['Latch count value command', 'Access mode: lobyte only', 
	'Access mode: hibyte only', 'Access mode: lobyte/hibyte'];
pit.OPERATING_MODE = ['Mode 0 (interrupt on terminal count)', 
	'Mode 1 (hardware re-triggerable one-short)', 'Mode 2 (rate generator)',
	'Mode 3 (square wave generator)', 'Mode 4 (software triggered strobe)',
	'Mode 5 (hardware triggered strobe)', 'Mode 2 (rate generator) BIS',
	'Mode 3 (square wave generator) BIS'];
pit.BINARY_MODE = ['16-bit binary', 'four-digit BCD'];

for(var key in pit) {
	exports[key] = pit[key];
}

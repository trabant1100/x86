var cpu = (function() {
	var regs = {
		ax: null,
		bx: null,
		cx: null,
		dx: null,
		sp: null, 
		bp: null,
		si: null,
		di: null,
		es: null,
		ds: null,
		cs: null,
		ss: null,
		
		ip: null,
		sp: null
	};

	return {
		regs: regs,
		
		reset: function() {
			regs.cs = 0xFFFF;
			regs.ip = 0;
			regs.sp = 0xFFFE;
		},
				
		stepIn: function() {
			// temp vars
			var oper1, oper2;
		
			// wrap around to 16bit
			regs.cs = regs.cs & 0xFFFF; regs.ip = regs.ip & 0xFFFF;
			
			var opcode = mem.read8(regs.cs, regs.ip);
			regs.ip ++;
			if(opcodes[opcode] == null) {
				throw 'Unsupported opcode 0x' + opcode.toString(16);
			}
			console.warn('opcode: ', opcodes[opcode], regs.cs.hex(), regs.ip.hex());
			
			// main opcode resolver
			switch(opcode) {
			case 0xEA: // JMP ptr16:16
				oper1 = mem.read16(regs.cs, regs.ip); regs.ip += 2;
				console.info(oper1);
				oper2 = mem.read16(regs.cs, regs.ip);
				console.info(oper2);
				regs.ip = oper1; regs.cs = oper2;
			break;
			}
		}
	}

})();
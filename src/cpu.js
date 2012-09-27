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
	var regs_ = ['ax', 'cx', 'dx', 'bx', 'sp', 'bp', 'si', 'di'],
		sregs_ = ['es', 'cs', 'ss', 'ds'];
	
	function modrm() {
		var byt = mem.read8(regs.cs, regs.ip); regs.ip ++;
		var mod = byt >> 6, 
			reg = (byt >> 3) & 7, // 7 = 00 111b 
			rm = byt & 7; // 7 = 00 000 111b 
			
		switch(mod) {
		// rm is memory address
		case 0:
			throw 'Unsupported modrm mode ' + mod;			
		break;
		
		// byte-sized
		case 1:
			throw 'Unsupported modrm mode ' + mod;
		break;
		
		// word-sized
		case 2:
			throw 'Unsupported modrm mode ' + mod;
		break;
		
		// rm is the operand
		case 11:
			
		break;
		}
		
		return {
			reg: reg,
			rm: rm
		}
	}

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
				throw 'Unsupported opcode ' + opcode.hex();
			}
			console.warn('opcode: ', opcodes[opcode], regs.cs.hex(), regs.ip.hex());
			
			// main opcode resolver
			switch(opcode) {
			case 0x8E: // MOV $reg,r,m16
				oper1 = modrm();
				regs[sregs_[oper1.reg]] = regs[regs_[oper1.rm]];
			break;
			case 0xB8: // MOV AX,imm16
				regs.ax = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			break;
			case 0xB9: // MOV CX,imm16
				regs.cx = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			break;
			case 0xBA: // MOV DX,imm16
				regs.dx = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			break;
			case 0xBB: // MOV BX,imm16
				regs.bx = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			break;
			case 0xBC: // MOV SP,imm16
				regs.sp = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			break;
			case 0xBD: // MOV BP,imm16
				regs.bp = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			break;
			case 0xBE: // MOV SI,imm16
				regs.si = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			break;
			case 0xBF: // MOV DI,imm16
				regs.di = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			break;
			case 0xEA: // JMP ptr16:16
				oper1 = mem.read16(regs.cs, regs.ip); regs.ip += 2;
				oper2 = mem.read16(regs.cs, regs.ip);
				regs.ip = oper1; regs.cs = oper2;
			break;
			}
		}
	}

})();
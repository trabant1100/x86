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
	
	var flags = {
		cf: 0,
		pf: 0,
		af: 0,
		zf: 0,
		sf: 0,
		tf: 0,
		if_: 0,
		df: 0,
		of: 0,
		iopl: 0,
		nt: 0,
		ZERO: 0
	}
		
	var ireg = ['ax', 'cx', 'dx', 'bx', 'sp', 'bp', 'si', 'di'],
		isreg = ['es', 'cs', 'ss', 'ds'];
		
	function calcea(modrm_) {
		var segm = null, offs = null;
	
		switch(modrm_.mod) {
		case 0:
			switch(modrm_.rm) {
			case 6: // 6 = 110b
				segm = regs.ds;
				offs = modrm_.disp16;
			break;
			default: 
				throw 'Unsupported modrm rm value ' + modrm_.rm + ' at calcea()';
			}
		break;
		default: 
			throw 'Unsupported modrm mode ' + modrm_.mod + ' at calcea()';
		}
		
		return (segm << 4) + (offs & 0xFFFF);
	}
		
	function writerm16(modrm_, val) {
		var addr = null;
		if(modrm_.mod < 3) {
			addr = calcea(modrm_);
			mem.write16ea(addr, val);
			//throw 'Unsupported modrm mode ' + modrm_.mod;
		} else {
			regs[ireg[modrm_.rm]] = val;
			console.info('#28 warning - not sure!!!');
		}
	}
	
	function readrm16(modrm_, val) {
		var addr = null;
		if(modrm_.mod < 3) {
			addr = calcea(modrm_);
			return mem.read16ea(addr);
		} else {
			return regs[ireg[val]];
		}
	}
	
	function modrm() {
		var byt = mem.read8(regs.cs, regs.ip); regs.ip ++;
		var mod = byt >> 6, 
			reg = (byt >> 3) & 7, // 7 = 00 111b 
			rm = byt & 7; // 7 = 00 000 111b 
		var disp16 = 0;
		
		switch(mod) {
		// rm is memory address
		case 0:
			//throw 'Unsupported modrm mode ' + mod;			
			if(rm == 6) { // 6 = 110b
				// word displacement
				disp16 = mem.read16(regs.cs, regs.ip); regs.ip += 2;
			} else if(rm == 2 || rm == 3) {
				throw 'Unsupported modrm mode ' + mod + ', rm ' + rm;
			}
		break;
		
		// byte-sized
		case 1:
			throw 'Unsupported modrm mode ' + mod;
		break;
		
		// word-sized
		case 2: // 10 binary
			throw 'Unsupported modrm mode ' + mod;
		break;
		
		// rm is the operand
		case 3: // 11 binary
			// nothing to do
		break;
		}
		
		return {
			mod: mod,
			reg: reg,
			rm: rm,
			disp16: disp16
		}
	}
	
	function parity(val) {
		return (val.toString(2).replace(/0/g, '').length % 2) == 0;
	}
	
	function flags16log(val) {
		val &= 0xFF;
		flags.sf = (val & 0x8000) ? 1 : 0;
		flags.zf = val === 0 ? 1 : 0;
		flags.cf = flags.of = 0;
		flags.pf = parity(val & 0xFF) ? 1 : 0;
	}
	
	function flags16add(val1, val2, omitFlags) {
		omitFlags = omitFlags || {};
		val1 &= 0xFFFF; val2 &= 0xFFFF;
		var res = val1 + val2;
		if(!omitFlags.cf) {
			flags.cf = (res & 0xFFFF0000) ? 1 : 0;
		}
		flags.of = ((res ^ val1) & (res ^ val2) & 0x8000) == 0x8000 ? 1 : 0;
		flags.af = ((val1 ^ val2 ^ res) & 0x10) == 0x10 ? 1 : 0;
		flags.zf = res == 0 ? 1 : 0;
		flags.sf = res & 0x8000 ? 1 : 0;
		flags.pf = parity(res) ? 1 : 0;
	}
	
	function flags16sub(val1, val2) {
		val1 &= 0xFFFF; val2 &= 0xFFFF;
		var res = val1 - val2;
		flags.cf = val1 < val2 ? 1 : 0;
		flags.of = ((res ^ val1) & (res ^ val2) & 0x8000) == 0x8000 ? 1 : 0;
		flags.af = ((val1 ^ val2 ^ res) & 0x10) == 0x10 ? 1 : 0;
		flags.zf = res == 0 ? 1 : 0;
		flags.sf = res & 0x8000 ? 1 : 0;
		flags.pf = parity(res) ? 1 : 0;
	}
	
	function sign8ofs(val) {
		return ((val & 0x80) * 0x1FE) | val;
	}
	
	function shift(val, modrm_, cnt) {
		var i = null, cf = null;
		
		switch(modrm_.reg) {
		case 0: // ROL
			for(i = 0; i < cnt; i ++) {
				flags.cf = val & 0x8000 ? 1 : 0;
				val = ((val << 1) | flags.cf) & 0xFFFF;
			}
			if(cnt == 1) flags.of = flags.cf ^ ((val >> 15) & 1);
		break;
		case 1: // ROR
			for(i = 0; i < cnt; i ++) {
				flags.cf = val & 1;
				val = (val >>> 1) | (flags.cf << 15);
			}
			if(cnt == 1) flags.of = (val >> 15) ^ ((val >> 14) & 1);
		break;
		case 2: // RCL
			for(i = 0; i < cnt; i ++) {
				cf = flags.cf;
				flags.cf = val & 0x8000 ? 1 : 0;
				val = ((val << 1) | cf) & 0xFFFF;
			}
			if(cnt == 1) flags.of = flags.cf ^ ((val >> 15) & 1);
		break;
		case 3: // RCR
			for(i = 0; i < cnt; i ++) {
				cf = flags.cf;
				flags.cf = val & 1;
				val = (val >>> 1) | (cf << 15);
			}
			if(cnt == 1) flags.of = (val >> 15) ^ ((val >> 14) & 1);
		break;
		case 4: // SHL
			for(i = 0; i < cnt; i ++) {
				flags.cf = val & 0x8000 ? 1 : 0;
				val = (val << 1) & 0xFFFF;
			}
			if(cnt == 1) flags.of = (val >> 15) == flags.cf ? 0 : 1;
			flags.sf = val & 0x8000 ? 1 : 0;
			flags.zf = val == 0 ? 1 : 0;
			flags.pf = parity(val) ? 1 : 0;
		break;
		case 5: // SHR
			if(cnt == 1) flags.of = val & 0x8000 ? 1 : 0;
			for(i = 0; i < cnt; i ++) {
				flags.cf = val & 1;
				val = (val >>> 1);
			}
			flags.sf = val & 0x8000 ? 1 : 0;
			flags.zf = val == 0 ? 1 : 0;
			flags.pf = parity(val) ? 1 : 0;
		break;
		case 7: // SAR
			for(i = 0; i < cnt; i ++) {
				flags.cf = val & 1;
				val = (val >> 1);
			}
			if(cnt == 1) flags.of = 0;
			flags.sf = val & 0x8000 ? 1 : 0;
			flags.zf = val == 0 ? 1 : 0;
			flags.pf = parity(val) ? 1 : 0;
		break;
		default:
			throw 'Unsupported shift for modrm reg=' + modrm_.reg;
		}
		
		return val & 0xFFFF;
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
			var oper1, oper2, modrm_, res;
		
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
			case 0x05: // ADD AX,imm16
				oper2 = mem.read16(regs.cs, regs.ip); regs.ip += 2;
				flags16add(regs.ax, oper2);
				regs.ax += oper2;
				regs.ax &= 0xFFFF;
			break;
			case 0x2D: // SUB AX,imm16
				oper2 = mem.read16(regs.cs, regs.ip); regs.ip += 2;
				flags16sub(regs.ax, oper2);
				regs.ax -= oper2;
				regs.ax &= 0xFFFF;
			break;
			case 0x33: // XOR r16,r/m16
				modrm_ = modrm();
				oper1 = regs[ireg[modrm_.reg]];
				oper2 = readrm16(modrm_, modrm_.rm);
				res = oper1 ^ oper2;
				flags16log(res);
				regs[ireg[modrm_.reg]] = res;
			break;
			case 0x3D: // CMP AX,imm16
				oper1 = regs.ax;
				oper2 = mem.read16(regs.cs, regs.ip); regs.ip += 2;
				flags16sub(oper1, oper2);
			break;
			case 0x40: // INC AX
				flags16add(regs.ax, 1, {cf: true});
				regs.ax ++;
			break;
			case 0x41: // INC CX
				flags16add(regs.cx, 1, {cf: true});
				regs.cx ++;
			break;
			case 0x42: // INC DX
				flags16add(regs.dx, 1, {cf: true});
				regs.dx ++;
			break;
			case 0x43: // INC BX
				flags16add(regs.bx, 1, {cf: true});
				regs.bx ++;
			break;
			case 0x44: // INC SP
				flags16add(regs.sp, 1, {cf: true});
				regs.sp ++;
			break;
			case 0x45: // INC BP
				flags16add(regs.bp, 1, {cf: true});
				regs.bp ++;
			break;
			case 0x46: // INC SI
				flags16add(regs.si, 1, {cf: true});
				regs.si ++;
			break;
			case 0x47: // INC DI
				flags16add(regs.di, 1, {cf: true});
				regs.di ++;
			break;
			case 0x70: // JO rel8
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(flags.of) regs.ip += res;
			break;
			case 0x71: // JNO rel8
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(!flags.of) regs.ip += res;
			break;
			case 0x72: // JC rel8
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(flags.cf) regs.ip += res;
			break;
			case 0x73: // JNC rel8
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(!flags.cf) regs.ip += rs;
			break;
			case 0x74: // JZ rel8
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(flags.zf) regs.ip += res;
			break;
			case 0x75: // JNZ rel8
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(!flags.zf) regs.ip += res;
			break;
			case 0x78: // JS rel8
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(flags.sf) regs.ip += res;
			break;
			case 0x7A: // JP rel8
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(flags.pf) regs.ip += res;
			break;
			case 0x7B: // JNP
				res = sign8ofs(mem.read8(regs.cs, regs.ip)); regs.ip ++;
				if(!flags.pf) regs.ip += res;
			break;
			case 0x8B: // MOV r16,r/m16
				modrm_ = modrm();
				regs[ireg[modrm_.reg]] = readrm16(modrm_, modrm_.rm);
			break;
			case 0x8C: // MOV r/m16,$reg
				modrm_ = modrm();
				writerm16(modrm_, regs[isreg[modrm_.reg]]);
			break;
			case 0x8E: // MOV $reg,r,m16
				oper1 = modrm();
				regs[isreg[oper1.reg]] = regs[ireg[oper1.rm]];
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
			case 0xC7: // MOV r/m16,imm16
				oper1 = modrm();
				writerm16(oper1, mem.read16(regs.cs, regs.ip)); regs.ip += 2;
			break;
			case 0xD1: // RCL/SAL r/m16,1
				modrm_ = modrm();
				oper1 = readrm16(modrm_, modrm_.rm);
				writerm16(modrm_, shift(oper1, modrm_, 1));
			break
			case 0xEA: // JMP ptr16:16
				oper1 = mem.read16(regs.cs, regs.ip); regs.ip += 2;
				oper2 = mem.read16(regs.cs, regs.ip);
				regs.ip = oper1; regs.cs = oper2;
			break;
			case 0xFA: // CLI
				flags.if_ = 0;
			break;
			}
		}
	}

})();
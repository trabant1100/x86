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
		
		start: function() {
		
		},
		
		exec86: function() {
			
		}
	}

})();
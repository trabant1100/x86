function init() {
	var domBiosInput = document.getElementById('bios'),
		domControlBtn = document.getElementById('control'),
		db = new DataBase(),
		running = domControlBtn.getAttribute('data-running') == 'true',
		stepperId = null,
		loopcount = 0;
		
	function stepIn() {
		try {
			cpu.stepIn();
			loopcount ++;
		} catch(e) {
			pause();
			domControlBtn.setAttribute('data-running', running = false);
			domControlBtn.value = 'resume [ERROR]';
			console.info('loopcount', loopcount);
			throw e;
		}
	}
		
	function start() {
		//stepperId = setInterval(stepIn, 100);
		console.info('PC started');
		stepperId = 1;
		while(stepperId && loopcount < 100) {
			stepIn();
			console.info(loopcount);
		}
	}
	
	function pause() {
		if(stepperId != null) {
			clearInterval(stepperId);
			stepperId = null;
			console.info('PC stopped');
		}
	}
		
	function loadBios() {
		console.info('loading bios');
		db.get('bios', function(data) {
			console.info('bios loaded');
			mem.write(0xFE000, data);
			cpu.reset();
			start();
		});
	}
	
	domBiosInput.addEventListener('change', function() {
		var fileReader = new FileReader();
			file = this.files[0];
		
		fileReader.onload = function(event) {
			db.put('bios', event.target.result);
			loadBios();
		};
		fileReader.readAsBinaryString(file);
				
	}, false);
	
	domControlBtn.addEventListener('click', function() {
		this.setAttribute('data-running', running = !running);
		if(running) {
			start();
		} else {
			pause();
		}
		this.value = running ? 'pause' : 'play';	
	});
	loadBios();
}

init();
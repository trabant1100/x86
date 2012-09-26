function init() {
	var domBiosInput = document.getElementById('bios'),
		domControlBtn = document.getElementById('control'),
		db = new DataBase(loadBios),
		running = domControlBtn.getAttribute('data-running') == 'true',
		stepperId = null;
		
	function stepIn() {
		try {
			cpu.stepIn();
		} catch(e) {
			pause();
			domControlBtn.setAttribute('data-running', running = false);
			domControlBtn.value = 'resume [ERROR]';
			throw e;
		}
	}
		
	function start() {
		stepperId = setInterval(stepIn, 1000);
		console.info('PC started');
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
		db.get('bios', function(event) {
			var data = event.target.result;
			//console.info(event.target.result);
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
}

init();
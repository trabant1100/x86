function init() {
	var domBiosInput = document.getElementById('bios'),
		db = new DataBase(loadBios);
		
	function loadBios() {
		db.get('bios', function(event) {
			var data = event.target.result;
			//console.info(event.target.result);
			mem.write(0xFE000, data);
			cpu.reset();
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
}

init();
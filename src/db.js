var DataBase = function() {
	var lf = localforage;
	
	return {
		put: function(key, data) {
			lf.setItem(key, data, function(err, value) {
				console.info('put', key);
			});
		},
		
		get: function(key, callback) {
			lf.getItem(key, function(err, value) {
				console.info('get', key);
				callback(value);
			});
		}
	}

};
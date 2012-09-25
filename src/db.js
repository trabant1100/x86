var DataBase = function(onReady) {
	var indexedDB = window.mozIndexedDB,
		dbVersion = 1.0;
	
	var request = indexedDB.open('x86Files'),
		db;

	request.onupgradeneeded = function(event) {
		//console.info('Creating objectStore');
		event.target.result.createObjectStore('x86');
	}
		
	request.onerror = function(event) {
		console.error('ERROR', event);
	}
	
	request.onsuccess = function(event) {
		//console.info('success', event);
		db = request.result;
		onReady();
	}
		
	return {
		put: function(data, key) {
			var tx = db.transaction('x86', IDBTransaction.READ_WRITE),
				store = tx.objectStore('x86').put(key, data);
		},
		
		get: function(key, callback) {
			var tx = db.transaction('x86'),
				store = tx.objectStore('x86')
				req = store.get(key);
				
			req.onsuccess = callback;
		}
	}

};
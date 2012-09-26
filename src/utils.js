Number.prototype.hex = function() {
	return '0x' + this.toString(16).toUpperCase();
}

var utils = {
	toHex: function(str) {
		return '0x' + Number(str.charCodeAt(0)).toString(16).toUpperCase();
	}
}
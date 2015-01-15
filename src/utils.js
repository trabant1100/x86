Number.prototype.hex = function(len) {
	var str = this.toString(16).toUpperCase();
	
	if(len != null)
		str = (Array(len).join('0') + str).slice(-len);
	
	return '0x' + str;
}

String.prototype.bin = function() {
	return parseInt(this.replace('b', ''), 2);
}

var utils = {
	toHex: function(str) {
		return '0x' + Number(str.charCodeAt(0)).toString(16).toUpperCase();
	}
}

exports.Number = {
	prototype: {
		hex: Number.prototype.hex,
		bin: Number.prototype.bin
	}
}
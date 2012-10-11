Number.prototype.hex = function(len) {
	var str = this.toString(16).toUpperCase();
	
	if(len != null)
		str = (Array(len).join('0') + str).slice(-len);
	
	return '0x' + str;
}

var utils = {
	toHex: function(str) {
		return '0x' + Number(str.charCodeAt(0)).toString(16).toUpperCase();
	}
}
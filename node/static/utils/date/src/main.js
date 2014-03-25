(function(){
	function bl(number){
		return number < 10 ? '0' + number : number;
	}

	date = {
		printTime: function(timestamp) {
			if (isNaN(timestamp)) {
				return timestamp;
			}
			var data = new Date(parseInt(timestamp));
			var m = bl(parseInt(data.getMonth()) + 1);
			var day = bl(data.getDate());
			var h = bl(data.getHours());
			var min = bl(data.getMinutes());
			var sec = bl(data.getSeconds());

			return data.getFullYear() + '-' + m + '-' + day + ' ' + h + ':' + min + ':' + sec;
		}
	};
}());
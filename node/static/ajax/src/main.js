var ajax = function(option) {
	var d = new Date();
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(ev) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				option.success.call(xhr, eval("(" + xhr.responseText + ")"));
			} else {
				option.error && option.error.call(xhr, xhr.status, xhr.responseText);
			}
		}
	}

	xhr.ontimeout = function() {
		option.timeout && option.timeout();
	}

	var params = '';
	if (option.data) {
		params = '?';
		var i = 0;
		for (var k in option.data) {
			params += k;
			params += '=';
			params += option.data[k];
			params += '&';
			i++;
		}
		if (i === 0) {
			params = '';
		} else {
			params = params.substring(0, params.length - 1);
		}
	}

	if(option.method == 'POST'){
		xhr.open('POST', option.url, true);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		xhr.send(option.data);
	}else{
		xhr.open('GET', option.url + params, true);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		xhr.send();
	}
}
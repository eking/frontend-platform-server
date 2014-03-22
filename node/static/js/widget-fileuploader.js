(function() {
	
	// Array.prototype.contains = function(obj) {
	//     var i = this.length;
	//     while (i--) {
	//         if (this[i] === obj) {
	//             return true;
	//         }
	//     }
	//     return false;
	// }

	var language = {
		imageNotSupport : '抱歉，图片格式不被支持',
		imageSizeLimited: '抱歉，图片大小不得超过2MB',
		noFile : '还没选择任何文件'
	}

	var defaults = {
		url: '', // 上传的后端服务器地址
		sizeLimit: 2, // 单位 MB，0为不限制大小
		fileTypes : 'jpg|jpeg|png',
		onFileSelected: function(key, file, dataUrl) {
			// console.info('onFileSelected', key);
		},
		onFileRemove: function(key) {
			// console.info('onFileRemove', key);
		},
		onProgress: function() {
			// console.info('onProgress!');
		},
		onCompleted: function(response) {
			// console.info('completed!', text);
		},
		onFileNotSupported: function(file) {
			alert('文件格式不支持');
		},
		onFileSizeLimited : function(file, size){
			alert('文件大小不可以超过 ' + size + ' MB');
		},
		onError: function(serverStatus, text) {
			alert(serverStatus + ' : ' +text);
		}
	};
	/**
	 * 对象属性覆盖
	 * @param  {[type]} defaults [description]
	 * @param  {[type]} target   [description]
	 * @return {[type]}          [description]
	 */
	function extend(defaults, target) {
		if (!target) {
			return defaults || {};
		}

		for (var k in target) {
			defaults[k] = target[k];
		}

		return defaults;
	}
	/**
	 * 读取图像数据转化为dataurl并调用callback
	 * @return {[type]} [description]
	 */
	function readFile(file, callback) {
		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			var fileType = getFileType(file);
			var dataUrl = e.target.result;
			callback(dataUrl.replace('data:base64', 'data:' + fileType +';base64'));
		}
		fileReader.readAsDataURL(file);
	}

	function getFileType(file) {
		var fileType = "";
		if (/\.png/ig.test(file.name)) {
			fileType = "image/png";
		} else if (/\.jpg/ig.test(file.name) || /\.jpeg/ig.test(file.name)) {
			fileType = "image/jpeg";
		} else if (/\.gif/ig.test(file.name)) {
			fileType = "image/gif";
		}

		return fileType;
	}

	var Upload = function(option) {
		var _ = this;
		this.option = extend(defaults, option);
		this.data = {};

		this.xhr = new XMLHttpRequest();
		if (this.xhr.onProgress) {
			this.xhr.onProgress.call(this);
		}
		this.xhr.onreadystatechange = function(ev) {
			if (_.xhr.readyState == 4) {
				if (_.xhr.status == 200) {
					_.option.onCompleted(eval('('+_.xhr.responseText+')'));
				} else {
					_.option.onError(_.xhr.status, _.xhr.responseText);
				}
			}
		}
		
		this.fileTypeRegExps = [];
		var enabledFileTypes = _.option.fileTypes.split('|');
		for(var i = 0, l = enabledFileTypes.length; i<l ; i++){
			this.fileTypeRegExps.push(new RegExp('\.'+enabledFileTypes[i], 'ig'));
		}
	};
	Upload.prototype = {
		addFile: function(key, file) {
			var _ = this;

			var supported = true;
			for(var i = 0, l = _.fileTypeRegExps.length ; i<l ; i++){
				supported = _.fileTypeRegExps[i].test(file.name);
				_.fileTypeRegExps[i].lastIndex = 0; // # bugfix: could not use an regexp test twice.
				if(supported){
					break;
				}
			}
			if(!supported){
				_.option.onFileNotSupported(file);
				return false;
			}

			if (_.option.sizeLimit) {
				var sizeMB = file.size / (1024 * 1024);
				if (sizeMB > _.option.sizeLimit) {
					alert(language.imageSizeLimited);
					_.option.onFileSizeLimited(file, _.option.sizeLimit);
					return false;
				}
			}

			readFile(file, function(dataUrl) {
				_.option.onFileSelected(key, file, dataUrl);
				_.data[key] = file;
			});
		},
		removeFile: function(key) {
			if(this.data[key]){
				delete this.data[key];
				this.option.onFileRemove(key);
			}
		},
		upload: function() {
			var formData = new FormData()
				, i = 0;
			for (var k in this.data) {
				i++;
				formData.append(k, this.data[k], this.data[k].name);
			}

			if(!i){
				alert(language.noFile);
				return false;
			}

			this.xhr.open('POST', this.option.url, true);
			this.xhr.send(formData);
		}
	};

	window.FileUpload = Upload;

	if (typeof FileReader != 'undefined') { return; } // for browser not support file API

	/**
	 * Ajax File Uploader For IE9
	 * @required jQuery
	 */
	var TOOLS = {
		createUploadIframe: function(id, uri) {
			//create frame
			var frameId = 'jUploadFrame' + id;
			var iframeHtml = '<iframe id="' + frameId + '" name="' + frameId + '" style="position:absolute; top:-9999px; left:-9999px"';
			if (window.ActiveXObject) {
				if (typeof uri == 'boolean') {
					iframeHtml += ' src="' + 'javascript:false' + '"';

				} else if (typeof uri == 'string') {
					iframeHtml += ' src="' + uri + '"';

				}
			}
			iframeHtml += ' />';
			jQuery(iframeHtml).appendTo(document.body);

			return jQuery('#' + frameId).get(0);
		},
		createUploadForm: function(id, fileElementId, data) {
			//create form	
			var formId = 'jUploadForm' + id;
			var fileId = 'jUploadFile' + id;
			var form = jQuery('<form  action="" method="POST" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>');
			if (data) {
				for (var i in data) {
					jQuery('<input type="hidden" name="' + i + '" value="' + data[i] + '" />').appendTo(form);
				}
			}
			var oldElement = jQuery('#' + fileElementId);
			var newElement = jQuery(oldElement).clone();
			jQuery(oldElement).attr('id', fileId);
			jQuery(oldElement).before(newElement);
			jQuery(oldElement).appendTo(form);



			//set attributes
			jQuery(form).css('position', 'absolute');
			jQuery(form).css('top', '-1200px');
			jQuery(form).css('left', '-1200px');
			jQuery(form).appendTo('body');
			return form;
		},
		ajaxFileUpload: function(s) {
			// TODO introduce global settings, allowing the client to modify them for all requests, not only timeout		
			s = jQuery.extend({}, jQuery.ajaxSettings, s);
			var id = new Date().getTime()
			var form = TOOLS.createUploadForm(id, s.fileElementId, (typeof(s.data) == 'undefined' ? false : s.data));
			var io = TOOLS.createUploadIframe(id, s.secureuri);
			var frameId = 'jUploadFrame' + id;
			var formId = 'jUploadForm' + id;
			// Watch for a new set of requests
			if (s.global && !jQuery.active++) {
				jQuery.event.trigger("ajaxStart");
			}
			var requestDone = false;
			// Create the request object
			var xml = {}
			if (s.global)
				jQuery.event.trigger("ajaxSend", [xml, s]);
			// Wait for a response to come back
			var uploadCallback = function(isTimeout) {
				var io = document.getElementById(frameId);
				try {
					if (io.contentWindow) {
						xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
						xml.responseXML = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document;

					} else if (io.contentDocument) {
						xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
						xml.responseXML = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document;
					}
				} catch (e) {
					jQuery.handleError(s, xml, null, e);
				}
				if (xml || isTimeout == "timeout") {
					requestDone = true;
					var status;
					try {
						status = isTimeout != "timeout" ? "success" : "error";
						// Make sure that the request was successful or notmodified
						if (status != "error") {
							// process the data (runs the xml through httpData regardless of callback)
							var data = TOOLS.uploadHttpData(xml, s.dataType);
							// If a local callback was specified, fire it and pass it the data
							if (s.success)
								s.success(data, status);

							// Fire the global callback
							if (s.global)
								jQuery.event.trigger("ajaxSuccess", [xml, s]);
						} else
							jQuery.handleError(s, xml, status);
					} catch (e) {
						status = "error";
						jQuery.handleError(s, xml, status, e);
					}

					// The request was completed
					if (s.global)
						jQuery.event.trigger("ajaxComplete", [xml, s]);

					// Handle the global AJAX counter
					if (s.global && !--jQuery.active)
						jQuery.event.trigger("ajaxStop");

					// Process result
					if (s.complete)
						s.complete(xml, status);

					jQuery(io).unbind()

					setTimeout(function() {
						try {
							jQuery(io).remove();
							jQuery(form).remove();

						} catch (e) {
							jQuery.handleError(s, xml, null, e);
						}

					}, 100)

					xml = null

				}
			}
			// Timeout checker
			if (s.timeout > 0) {
				setTimeout(function() {
					// Check to see if the request is still happening
					if (!requestDone) uploadCallback("timeout");
				}, s.timeout);
			}
			try {

				var form = jQuery('#' + formId);
				jQuery(form).attr('action', s.url);
				jQuery(form).attr('method', 'POST');
				jQuery(form).attr('target', frameId);
				if (form.encoding) {
					jQuery(form).attr('encoding', 'multipart/form-data');
				} else {
					jQuery(form).attr('enctype', 'multipart/form-data');
				}
				jQuery(form).submit();

			} catch (e) {
				jQuery.handleError(s, xml, null, e);
			}

			jQuery('#' + frameId).load(uploadCallback);
			return {
				abort: function() {}
			};
		},
		uploadHttpData: function(r, type) {
			var data = !type;
			data = type == "xml" || data ? r.responseXML : r.responseText;
			// If the type is "script", eval it in global context
			if (type == "script")
				jQuery.globalEval(data);
			// Get the JavaScript object, if JSON is used.
			if (type == "json")
				eval("data = " + data);
			// evaluate scripts within html
			if (type == "html")
				jQuery("<div>").html(data).evalScripts();

			return data;
		}
	};
	
	var idNumber = 0;
	defaults = extend(defaults, {
		onFileSelectedIE9 : function(){} // 在IE9之下文件选中事件是这个
	});

	window.FileUpload = Upload = function(option) {
		this.option = extend(defaults, option);

		this.fileTypeRegExps = [];
		var enabledFileTypes = this.option.fileTypes.split('|');
		for(var i = 0, l = enabledFileTypes.length; i<l ; i++){
			this.fileTypeRegExps.push(new RegExp('\.'+enabledFileTypes[i], 'ig'));
		}

		this.addFile = function(key, file, input) {
			var supported = true;
			for(var i = 0, l = this.fileTypeRegExps.length ; i<l ; i++){
				supported = this.fileTypeRegExps[i].test(input.value);
				this.fileTypeRegExps[i].lastIndex = 0; // # bugfix: could not use an regexp test twice.
				if(supported){
					break;
				}
			}
			if(!supported){
				this.option.onFileNotSupported(input);
				return false;
			}

			var iptId = input.getAttribute('id');
			if(iptId){
				this.inputId = iptId;
			}else{
				idNumber++;
				this.inputId = 'J_wgtFileUpload' + idNumber;
				input.setAttribute('id', this.inputId);
			}
			this.option.onFileSelectedIE9(input);
		};
		this.removeFile = function(key) {
			this.inputId = 0;
		};
		this.upload = function() {
			var self = this;
			if(!self.inputId){
				return;
			}
			TOOLS.ajaxFileUpload({
				url: self.option.url,
				secureuri: false,
				fileElementId: self.inputId,
				dataType: 'json',
				success: function(data, status) {
					self.option.onCompleted(data);
				},
				error: function(data, status, e) {
					self.option.onError(status, data);
				}
			});
		};
	};
}());
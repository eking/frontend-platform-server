var formidable = require('formidable')
	, fs = require('fs');

exports.index = function(req, resp, end){
	end(0, {view : 'index', data : {time : new Date}});
}

exports.upload = function(req, resp, end){
	var form = new formidable.IncomingForm();
	console.info(form.uploadDir);
	form.keepExtensions = true;
	form.uploadDir = __dirname + '/static/files';
	form.parse(req, function(err, fields, files){

		if(err){
			end(err);
			return;
		}

		fs.rename(uploadedPath, form.uploadDir + '/' + files['file'].name, function(err){
			var back = {};
			if(err){
				end(err);
				return;
			}
			back.path = form.uploadDir + '/' + files['file'].name;
			end(0, {view : 'upload', data : back});
		});
	});
}
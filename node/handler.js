var formidable = require('formidable')
	, fs = require('fs')
	, uglify = require('./service/uglify')
	, server = require('./server');

exports.index = function(req, resp, callback){
	callback(0, 'index', {time : new Date});
	// callback(0, {view : 'index', data : {time : new Date}});
}

exports.upload = function(req, resp, callback){
	var form = new formidable.IncomingForm();
	
	form.keepExtensions = true;
	form.uploadDir = __dirname + '/static/files';

	form.parse(req, function(err, fields, files){
		if(err){
			callback(err);
			return;
		}
		// 上传成功以后命名文件
		fs.rename(files['file'].path, form.uploadDir + '/' + files['file'].name, function(err){
			var back = {};
			if(err){
				callback(err);
				return;
			}
			
			// 执行压缩
			uglify.run(form.uploadDir + '/' + files['file'].name, function(err, filePath){
				if(err){
					callback(err);
					return;
				}
				callback(0, 0, {filePath : server.staticServer + '/files/' + filePath});
			});

		});

	});

}

exports.showHistory = function(req, resp, callback){
	callback(0, 'history', {'title' : '历史记录页面'});
}
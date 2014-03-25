var formidable = require('formidable')
	, fs = require('fs')
	, uglify = require('./service/uglify')
	, server = require('./server');

exports.index = function(req, resp, callback){
	callback(0, 'index', {time : new Date});
}

exports.upload = function(req, resp, callback){
	var form = new formidable.IncomingForm();
	var broadcast = server.broadcast;
	var db = server.db;

	form.keepExtensions = true;
	form.uploadDir = server.uploadDir;

	form.parse(req, function(err, fields, files){
		if(err){
			callback(err);
			broadcast.error('构建上传失败, 错误原因：' + err);
			return;
		}
		
		// 上传成功以后命名文件
		broadcast.info(files['file'].name + ' 已成功上传!正在转存...');
		fs.rename(files['file'].path, form.uploadDir + '/' + files['file'].name, function(err){
			var back = {};
			if(err){
				callback(err, 'json');
				broadcast.error('构建转存失败, 失败原因：' + err);
				return;
			}
			
			// 执行压缩
			broadcast.info(files['file'].name + ' 转存成功, 开始压缩...');
			uglify.run(form.uploadDir + '/' + files['file'].name, fields['encoding'], function(err, filename){
				if(err){
					callback(err, 'json');
					broadcast.error('构建压缩失败, 失败原因：' + err);
					return;
				}

				broadcast.success(files['file'].name + ' 构建成功!');
				
				var path = server.staticServer + '/UPLOAD_FILES/' + filename;
				db.history.insert({url : path, fileName : filename, createdAt: (new Date).getTime()}, function(err, saved){
					if(err){
						console.error('[ERROR]', '历史记录存储失败');
					}
				});
				callback(0, 0, {url : path, fileName : filename});
			});

		});

	});
}

exports.history = function(req, resp, callback){
	var db = server.db;
	// db.history.find(function(err, records){
	db.history.find().sort({createdAt : -1}, function(err, records){
		if(err){
			callback(err, 'json');
			return;
		}

		callback(0, 0, records);
	});
}
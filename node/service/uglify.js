var uglify = require('uglify-js');
var fs = require('fs');
var iconv = require('iconv-lite');
var os = require('os');

function getMiniPath(fullpath, extension){
	var lastIdx = fullpath.lastIndexOf('.');
	var ext = extension || '.min';
	return fullpath.slice(0, lastIdx) + ext + fullpath.slice(lastIdx);
}
function getFileName(filePath){
	var lastIdx = filePath.lastIndexOf('/');
	return filePath.slice(lastIdx+1);
}

/**
 * do uglify script
 * @param  {[type]}   fullpath target filepath
 * @param  {Function} callback
 */
exports.run = function(fullpath, encoding, callback){
	if(typeof encoding == 'function'){
		callback = encoding;
		encoding = 'utf8'; // default is utf8
	}

	fs.readFile(fullpath, function(err, buf){
		if(err){
			callback(err);
			return;
		}

		var origin_code = iconv.decode(buf, encoding);
		
		var minified = uglify.minify(origin_code, {fromString : true, warnings : true});
		
		var gbk_mini_buff = iconv.encode(minified.code, encoding);
		
		var mini_path = getMiniPath(fullpath);

		fs.writeFile(mini_path, gbk_mini_buff, function(err){
			if(err){
				callback(err);
				return;
			}
			callback(0, getFileName(mini_path));
		});
	});
}

// TEST CODE
// exports.run(__dirname + '\\test-0.1.0.js', 'gbk', function(err, minifiedPath){
// 	if(err){
// 		console.info(err+'');
// 		return;
// 	}
// 	// console.info(minifiedPath);
// });
// exports.run(__dirname + '\\test-utf8-0.1.0.js', function(err, minifiedPath){
// 	if(err){
// 		console.info(err+'');
// 		return;
// 	}
// 	// console.info(minifiedPath);
// });
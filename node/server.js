var http = require('http')
	, ejs = require('ejs')
	, staticServerPrefix
	, router = {
		'/' : 'index',
		'post:/upload' : 'upload'
	}
	, handler = require('./handler');

/**
 * Handler包装器
 * @param  {[type]} handler [响应函数]
 * @param  {[type]} req     [http request]
 * @param  {[type]} resp    [http response]
 */
function actionWrapper(handler, req, resp){
	var renderData = handler(req, resp, function(err, renderData){
		if(err){
			resp.writeHead(500, {'Content-Type' : 'text/html'});
			resp.end(err);
			return;
		}
		onResponse(req, resp, renderData);
	});
}

/**
 * 前置过滤器，Handler执行前调用
 * @param  {[type]} req        [http request]
 * @param  {[type]} resp       [http response]
 * @param  {[type]} renderData [view name and rendered data]
 */
function onRequest(req, resp){
	var keyWithMethod = req.method.toLowerCase()+':'+req.url;

	if(router[req.url]){
		actionWrapper(handler[router[req.url]], req, resp);
	}else if(router[keyWithMethod]){
		actionWrapper(handler[router[keyWithMethod]], req, resp);
	}else{
		resp.writeHead(404, {'Content-Type' : 'text/html'});
		resp.end('<h1>404</h1>找不到页面');
	}
}

/**
 * 后置过滤器，Handler执行完毕调用
 * @param  {[type]} req        [http request]
 * @param  {[type]} resp       [http response]
 * @param  {[type]} renderData [view name and rendered data]
 */
function onResponse(req, resp, renderData){
	var data = renderData.data || {};
	data['static'] = staticServerPrefix;


	if(!renderData.view){
		resp.writeHead(500, {'Content-Type' : 'text/html'});
		resp.end('<h1>500</h1>未找到模板');
	}

	ejs.renderFile('./template/'+renderData.view+'.ejs', data, function(err, html){
		if(err){
			resp.writeHead(500, {'Content-Type' : 'text/plain'});
			resp.end(err);
		}
		resp.writeHead(200, {'Content-Type' : 'text/html'});
		resp.end(html);
	});
}

exports.start = function(option){
	http.createServer(onRequest).listen(option.serverPort, option.host);
	staticServerPrefix = option.staticHost + ':' + option.staticFileServerPort + '/static';
}
var http = require('http')
	, ejs = require('ejs')
	, staticServerPrefix
	, router
	, handler = require('./handler');

/**
 * Will called before handler excution
 * @param  {[type]} handler
 * @param  {[type]} req     [http request]
 * @param  {[type]} resp    [http response]
 */
function actionWrapper(handler, req, resp){
	handler(req, resp, function(err, view, data){
		if(err){
			resp.writeHead(500, {'Content-Type' : 'text/plain'});
			resp.end(err+'');
			return;
		}
		onResponse(req, resp, {view : view, data : data});
	});
}

/**
 * All request start here
 * @param  {[type]} req        [http request]
 * @param  {[type]} resp       [http response]
 */
function onRequest(req, resp){
	var keyWithMethod = req.method.toLowerCase()+':'+req.url;

	if(router[req.url]){
		actionWrapper(handler[router[req.url]], req, resp);
	}else if(router[keyWithMethod]){
		actionWrapper(handler[router[keyWithMethod]], req, resp);
	}else{
		resp.writeHead(404, {'Content-Type' : 'text/html'});
		resp.end('<h1>404</h1> not found');
	}
}

/**
 * Will called after handler excution
 * @param  {[type]} req        [http request]
 * @param  {[type]} resp       [http response]
 * @param  {[type]} renderData [view name and rendered data]
 */
function onResponse(req, resp, renderData){
	// undefined view
	if(!renderData.view && !renderData.data){
		resp.writeHead(500, {'Content-Type' : 'text/html'});
		resp.end('<h1>500</h1> template not found');
		return;
	}

	// return json
	if(!renderData.view && renderData.data){
		resp.writeHead(200, {'Content-Type' : 'text/plain'});
		resp.end(JSON.stringify(renderData.data));
		return;
	}

	// render template
	var data = renderData.data || {};
	data['static'] = staticServerPrefix;
	ejs.renderFile('./template/'+renderData.view+'.ejs', data, function(err, html){
		if(err){
			resp.writeHead(500, {'Content-Type' : 'text/plain'});
			resp.end(err);
		}
		resp.writeHead(200, {'Content-Type' : 'text/html'});
		resp.end(html);
	});
}

exports.start = function(option, routerDefinition){
	router = routerDefinition;
	http.createServer(onRequest).listen(option.serverPort, option.serverHost);
	staticServerPrefix = exports.staticServer = '//' + option.staticHost + ':' + option.staticFileServerPort + '/static';
}
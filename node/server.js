var http = require('http')
	, ejs = require('ejs')
	, staticServerPrefix
	, socketioServerPrefix
	, router = null
	, handler = require('./handler');

/**
 * Will called before handler excution
 * @param  {[type]} handler
 * @param  {[type]} req     [http request]
 * @param  {[type]} resp    [http response]
 */
function actionWrapper(handler, req, resp){
	handler(req, resp, function(err, view, data){
		if(err && view === 'json'){
			resp.writeHead(500, {'Content-Type' : 'text/plain'});
			resp.end(JSON.stringify({r : 0, msg : err}));
			return;
		}

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
		// resp.end(JSON.stringify(renderData.data));
		resp.end( JSON.stringify({ r: 1, b : renderData.data }) );
		return;
	}

	// render template
	var data = renderData.data || {};

	data['STATIC_SERVER'] = staticServerPrefix;
	data['SOCKETIO_SERVER'] = socketioServerPrefix;

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
	
	require('./static_server').start(option);
	staticServerPrefix = exports.staticServer = '//' + option.staticServerHost + ':' + option.staticFileServerPort + '/static';
	socketioServerPrefix = '//127.0.0.1:' + option.socketioPort;

	io = require('socket.io').listen(option.socketioPort);
	io.sockets.on('connection', function(socket){
		io.sockets.emit('message', {'msg' : '欢迎使用西祠前端自动化平台'});
	});

	db = require('mongojs').connect(option.mongodb.dburl, ['users', 'history']);
	// db.users.save({email : 'rayzy1991@gmail.com'}, function(err, saved){
	// 	if(err || !saved){
	// 		console.info('存储失败' + err);
	// 	}else{
	// 		console.info('存储成功！');
	// 	}
	// });
	
	exports.broadcast = {
		success : function(msg){
			// console.info('[SUCCESS]', msg);
			io.sockets.emit('message', {'msg' : '[成功] ' + msg});
		},
		error : function(msg){
			// console.error('[ERR]', msg);
			io.sockets.emit('message', {'msg' : '[失败] ' + msg});
		},
		info : function(msg){
			// console.info('[INFO]', msg);
			io.sockets.emit('message', {'msg' : '[信息] ' + msg});
		}
	};
	exports.db = db;
	exports.uploadDir = option.uploadDir;
}
var server = require('./server')
  	, staticServer = require('./static_server')
	, config = {
		host : 'localhost',
		staticHost : '//localhost',
		serverPort : 3000,
		staticFileServerPort : 3001
	};

server.start(config);
staticServer.start(config.staticFileServerPort);
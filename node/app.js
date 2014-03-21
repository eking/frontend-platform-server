var server = require('./server')
  	, staticServer = require('./static_server')
	, config = {
		serverPort : 3000,
		serverHost : 'localhost',
		staticFileServerPort : 4000,
		staticHost : 'localhost'
	};

server.start(config);
staticServer.start(config);
var server = require('./server');
var staticServer = require('./static_server');
var config = {
	serverPort: 3000,
	serverHost: 'localhost',
	staticFileServerPort: 4000,
	staticHost: 'localhost'
};
var router = {
	'/': 'index',
	'post:/upload': 'upload',
	'/history' : 'showHistory'
};

server.start(config, router);
staticServer.start(config);
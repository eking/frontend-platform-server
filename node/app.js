var server = require('./server');
var staticServer = require('./static_server');
var config = {
	serverPort: 3000,
	serverHost: 'localhost',
	staticFileServerPort: 4000,
	staticHost: 'localhost',
	socketioPort: 5000,
	mongodb: {
		dburl : 'localhost:27017/test',
		username : '',
		password : ''
	}
};
var router = {
	'/': 'index',
	'post:/upload': 'upload',
	'/history' : 'showHistory',
	'/close' : 'closeServer'
};

server.start(config, router);
staticServer.start(config);
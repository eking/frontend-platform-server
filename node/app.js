var server = require('./server');

var config = {
	serverPort: 3000,
	serverHost: 'localhost',
	staticFileServerPort: 4000,
	staticServerHost: 'localhost',
	socketioPort: 5000,
	uploadDir: __dirname + '/static/UPLOAD_FILES',
	mongodb: {
		dburl : 'localhost:27017/test',
		username : '',
		password : ''
	}
};

var router = {
	'/': 'index',
	'post:/upload': 'upload',
	'/history' : 'history',
	'/close' : 'closeServer'
};

server.start(config, router);
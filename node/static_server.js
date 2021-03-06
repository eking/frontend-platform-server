/**
 * From Github
 * https://gist.github.com/rpflorence/701407
 */
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

exports.start = function(config){
	http.createServer(function(request, response) {
	  var uri = url.parse(request.url).pathname
	    , filename = path.join(process.cwd(), uri);
	  
	  path.exists(filename, function(exists) {
	    if(!exists) {
	      response.writeHead(404, {"Content-Type": "text/html"});
	      response.end("<h1>404 Not Found</h1><h2>"+ request.url +"</h2>");
	      return;
	    }
	 
	    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
	 
	    fs.readFile(filename, "binary", function(err, file) {
	      if(err) {
	        response.writeHead(500, {"Content-Type": "text/plain"});
	        response.write(err + "\n");
	        response.end();
	        return;
	      }
	 
	      response.writeHead(200);
	      response.write(file, "binary");
	      response.end();
	    });
	  });
	}).listen(parseInt(config.staticFileServerPort, 10), config.staticHost);
}
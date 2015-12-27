"use strict";

var https = require('https');
var fs = require('fs');
var qs = require('querystring');

var options = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.crt')
};

var PORT = 8181;

function handleRequest(req, res){
	console.log('Something happened: ' + req.method);

	//Process Post Request
	if(req.method === "POST"){

	var data = '';

	req.on('data', function(chunk){
		data += chunk;
	});

	req.on('end', function(){
		var parseData = qs.parse(data);
		var prettyData = JSON.stringify(parseData, null, 2);
		console.log("Post request with:\n" + prettyData);
		res.end(prettyData);
	});
	} else { //Send a simple response
	res.end('Everything works');
	}
}

//Create a server
var server = https.createServer(options, handleRequest);

//Start server
server.listen(PORT, function(){
  console.log("Server listening on: https://localhost:" + PORT);
});
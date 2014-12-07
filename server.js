var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
var mime = require('mime');
var config = require('./config.js');
var colors = require('colors');

var server = http.createServer();

server.on('request', function (req, res) {
	var req_url = parsURL(res, req.url);

	if (!req_url) return; // bad request

	req_url = url.parse(req_url).path;
	req_url = path.normalize( req_url );
	req_url = path.join(config._pablic, req_url);

	if(req.method === 'GET') sendFile(res, req_url);
    else res.end();
});


function sendFile (res, req_url) {
	fs.stat(req_url, function(err, stats){
		if (err) return sendError(res, err.code);
		if ( stats.isDirectory() ) return sendFile(res, path.join(req_url, 'index.html') );
		if ( !stats.isFile() ) return sendError(res, 'ENOENT');

		var file = fs.createReadStream(req_url);

		res.setHeader( 'Content-Type', mime.lookup(req_url) );

		file.pipe(res);

		file.on('error', function(err){
			sendError(res, err.code);
		});

		res.on('close', function(){
			file.destroy();
		});
	});
}

function parsURL (res, url) {
	try {
		url = decodeURIComponent(url);
        url = url.replace(/^\/?app\/*.*/, '/index.html'); // => '/index.html'

		if ( url.indexOf('\0') !== -1 ) return sendError(res, 400);
		return url;
	} catch(e) {
		sendError(res, 400);
	}
}

function sendError (res, code) {
	if (code === 'ENOENT' || code === 404){
		res.statusCode = 404;
		res.end('File not found.');
	}
	else if (code === 400) {
		res.statusCode = 400;
		res.end('Bad Request.');
	}
	else {
		res.statusCode = 500;
		res.end('Internal Server Error.');
	}
}

module.exports = server;

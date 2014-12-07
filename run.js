var config = require('./config.js');
var server = require('./server.js');
require('./socket.js')(server);

server.listen(config.port, function(){
	console.log('Server started on port:' + config.port);
});

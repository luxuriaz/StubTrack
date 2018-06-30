var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('Server listening at port %d', port);
});
// removed keys for security reason
var accesskey = "***********";
var secretkey = "***********";


app.use(express.static(__dirname + '/public'));
io.on('connection', function(socket) {
  io.emit('Credentials', {
    accesskey: accesskey,
    secretkey: secretkey
  });
});

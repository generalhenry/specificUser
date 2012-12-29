
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

io.set('log level', 2);

app.use(express.static(__dirname));

var users = {};
var userNumber = 1;

function getUsers () {
   var userNames = [];
   for(var name in users) {
     if(users[name]) {
       userNames.push(name);  
     }
   }
   return userNames;
}

io.sockets.on('connection', function (socket) {
  var myNumber = userNumber++;
  var myName = 'user#' + myNumber;
  users[myName] = socket;
  
  socket.emit('hello', { hello: myName });
  io.sockets.emit('listing', getUsers());
  
  socket.on('chat', function (message) {
    io.sockets.emit('chat', myName + ': ' + message);
  });

  socket.on('message', function (data) {
    users[data.user] &&
      users[data.user].emit('message', myName + '-> ' + data.message); 
  });
  
  socket.on('disconnect', function () {
    users[myName] = null;
    io.sockets.emit('listing', getUsers());
  });
});

server.listen(process.env.PORT || 80);
console.log('listening on:', process.env.PORT || 80);

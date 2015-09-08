/*
 * Buiding simple HTTP server and listen port specified
 * Gilbert Gao
 */
/* server response and page returned */
var express = require('express'), /* get express and bind it to server */
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server), /* get socket.io and bind it to server */
    users = []; /* save all online users nickname */
    port = process.env.PORT || 3000;
/* server.listen(3000) for local */
server.listen(port, function(){
 console.log('Server listening at port %d', port);
});
/* locate html */
app.use('/', express.static(__dirname + '/www'));
/* socket */
io.sockets.on('connection', function(socket) {
    /* new user login, get and process 'login' event sent from client */
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');      /* send 'nickExisted' to client itself*/
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login'); /* send nicknames to all clients connected to server*/
        };
    });
    /* handel event 'leave' */
    socket.on('disconnect', function() {
        /* broadcast the user has left */
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    /* handle 'new message' event */
    socket.on('postMsg', function(msg, color) {
        /* broadcast new message to all clients */
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });

}); 
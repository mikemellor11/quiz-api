var { games } = require('../globals.js');

module.exports = (io) => {
    io.of(/./g).on('connection', function(socket){
        console.log(socket.nsp.name + ": " + socket.id + " connected");

        require('./events/connect.js')(socket);
    
        socket.on('disconnect', require('./events/disconnect.js')(socket, games[socket.nsp.name]));
        socket.on('join', require('./events/join.js')(socket, games[socket.nsp.name]));
        socket.on('leave', require('./events/leave.js')(socket, games[socket.nsp.name]));
        socket.on('start', require('./events/start.js')(socket, games[socket.nsp.name]));
        socket.on('reset', require('./events/reset.js')(socket, games[socket.nsp.name]));
        socket.on('answer', require('./events/answer.js')(socket, games[socket.nsp.name]));
        socket.on('input', require('./events/input.js')(socket, games[socket.nsp.name]));
    });
}
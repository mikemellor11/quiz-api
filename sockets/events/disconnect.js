var { games } = require('../../globals.js');

var users = {}; ({ 
    find: users.find,
    remove: users.remove
} = require('../../services/users.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('disconnect', reason => {
        console.log(`${socket.nsp.name}: ${socket.id} disconnected`);

        users.remove(game, socket.id);

        socket.nsp.emit('update users');
    });
}
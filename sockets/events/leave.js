var { games } = require('../../globals.js');

var users = {}; ({ 
    findActive: users.findActive,
    removeActive: users.removeActive
} = require('../../services/users.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('leave', (session) => {
        var user = users.findActive(game, session.id);

        console.log(`${socket.nsp.name}: ${socket.id} ${user.name} left the game`);

        socket.nsp.emit('output', '🔴 <i>' + user.name + ' left the game..</i>');
        
        socket.nsp.emit('update users');

        users.removeActive(game, user.id);
    });
}
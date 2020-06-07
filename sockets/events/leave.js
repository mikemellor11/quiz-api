var { games } = require('../../globals.js');

var users = {}; ({ 
    findActive: users.findActive
} = require('../../services/users.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('leave', (session) => {
        var user = users.findActive(game, session.id);

        console.log(`${socket.nsp.name}: ${socket.id} ${user.session.name} left the game`);
        socket.nsp.emit('output', '🔴 <i>' + user.session.name + ' left the game..</i>');
    
        user.session = null;
        
        socket.nsp.emit('update users');
    });
}
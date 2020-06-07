var { games } = require('../../globals.js');

var users = {}; ({ 
    findActive: users.findActive
} = require('../../services/users.js'));

module.exports = (socket) => {    
    var game = games[socket.nsp.name];

    socket.on('input', ({session, message}) => {
        var user = session && users.findActive(game, session.id);
        
        socket.nsp.emit('output', `<strong>${user && user.session.name || 'spectator'}</strong>: ${message}`);
    });
}
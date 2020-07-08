var { games } = require('../../globals.js');

var users = {}; ({ 
    findActive: users.findActive
} = require('../../services/users.js'));

module.exports = (socket, game) => ({session, message}) => {
    var user = session && users.findActive(game, session.id);
        
    socket.nsp.emit('output', `<strong>${user && user.name || 'spectator'}</strong>: ${message}`);
}
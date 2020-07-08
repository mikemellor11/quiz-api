var users = {}; ({ 
    remove: users.remove
} = require('../../services/users.js'));

module.exports = (socket, game) => (reason) => {
    console.log(`${socket.nsp.name}: ${socket.id} disconnected`);

    users.remove(game, socket.id);

    socket.nsp.emit('update users');
}
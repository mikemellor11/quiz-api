var { games } = require('../../globals.js');

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('leave', () => {
        console.log(`${socket.nsp.name}: ${socket.id} ${socket.session.name} left the game`);
        socket.nsp.emit('output', '🔴 <i>' + socket.session.name + ' left the game..</i>');
    
        socket.session = null;
        game.users.find(d => d.id === socket.id).session = null;
        
        socket.nsp.emit('update users');
    });
}
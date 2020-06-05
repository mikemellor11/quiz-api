var { games } = require('../../globals.js');

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('join', session => {
        console.log(`${socket.nsp.name}: ${socket.id} ${session.name} joined the game`);
        socket.session = session;
        game.users.find(d => d.id === socket.id).session = socket.session;
        game.users.find(d => d.id === socket.id).score = 0;
        
        socket.nsp.emit('output', '🔵 <i>' + socket.session.name + ' joined the game..</i>');
        socket.nsp.emit('update users');
    });
}
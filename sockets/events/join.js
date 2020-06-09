var { games } = require('../../globals.js');

var users = {}; ({ 
    findActive: users.findActive
} = require('../../services/users.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('join', session => {
        var user = users.findActive(game, session.id);

        if(user){
            console.log(`${socket.nsp.name}: ${socket.id} ${session.id.slice(0, 8)} ${session.name} joined the game in a another window`);

            user.sockets.push(socket.id);
        } else {
            console.log(`${socket.nsp.name}: ${socket.id} ${session.id.slice(0, 8)} ${session.name} joined the game`);

            game.users.push({
                id: session.id,
                name: session.name,
                sockets: [socket.id],
                score: 0
            });
            
            socket.nsp.emit('output', '🔵 <i>' + session.name + ' joined the game..</i>');   
        }
        
        socket.nsp.emit('update users');
    });
}
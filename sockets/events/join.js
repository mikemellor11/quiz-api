var { STATE, games } = require('../../globals.js');

var users = {}; ({ 
    add: users.add
} = require('../../services/users.js'));

module.exports = (socket, game) => (session) => {
    if(users.add(game, session, socket.id)){
        console.log(`${socket.nsp.name}: ${socket.id} ${session.id.slice(0, 8)} ${session.name} joined the game`);
        socket.nsp.emit('output', '🔵 <i>' + session.name + ' joined the game..</i>');     
    } else{
        console.log(`${socket.nsp.name}: ${socket.id} ${session.id.slice(0, 8)} ${session.name} joined the game in a another window`);
    }
    
    socket.nsp.emit('update users');

    socket.nsp.emit('joined', socket.id);
}
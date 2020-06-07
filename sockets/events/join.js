var { games } = require('../../globals.js');

var users = {}; ({ 
    find: users.find,
    findActive: users.findActive
} = require('../../services/users.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('join', session => {
        socket.session = session;

        if(users.findActive(game, session.id)){
            console.log(`${socket.nsp.name}: ${socket.id} ${session.id.slice(0, 8)} ${session.name} joined the game in a another window`);
        } else {
            console.log(`${socket.nsp.name}: ${socket.id} ${session.id.slice(0, 8)} ${session.name} joined the game`);

            var user = users.find(game, socket.id);

            user.session = socket.session;
            user.score = 0;
            
            socket.nsp.emit('output', '🔵 <i>' + socket.session.name + ' joined the game..</i>');
            
            socket.nsp.emit('update users');
        }
    });
}
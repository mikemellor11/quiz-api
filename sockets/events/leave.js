var { games } = require('../../globals.js');

var users = {}; ({ 
    find: users.find,
    removeActive: users.removeActive
} = require('../../services/users.js'));

module.exports = (socket, game) => () => {
    var user = users.find(game, socket.id);

    if(user){
        console.log(`${socket.nsp.name}: ${socket.id} ${user.name} left the game`);

        socket.nsp.emit('output', '🔴 <i>' + user.name + ' left the game..</i>');
        
        socket.nsp.emit('update users');

        users.removeActive(game, user.id);
    }
}
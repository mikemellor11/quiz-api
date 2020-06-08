var { games } = require('../../globals.js');

var users = {}; ({ 
    find: users.find
} = require('../../services/users.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('disconnect', reason => {
        console.log(`${socket.nsp.name}: ${socket.id} disconnected`);

        var user = users.find(game, socket.id);
        if(user){
            user.sockets.splice(user.sockets.findIndex(d => d === socket.id), 1);
        }

        game.sockets.splice(game.sockets.findIndex(d => d === socket.id), 1);
        socket.nsp.emit('update users');

        if(!game.sockets.length){
            console.log(`${socket.nsp.name}: all users disconnected - closing game`);
            game = null; 
        }
    });
}
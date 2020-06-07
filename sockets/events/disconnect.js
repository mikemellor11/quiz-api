var { games } = require('../../globals.js');

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('disconnect', reason => {
        console.log(`${socket.nsp.name}: ${socket.id} disconnected`);

        var index = game.users.findIndex(d => d.id === socket.id);

        if(index > -1){
            game.users.splice(index, 1);
            socket.nsp.emit('update users');
        }

        if(game.users && !game.users.length){
            console.log(`${socket.nsp.name}: all users disconnected - closing game`);
            game = null; 
        }
    });
}
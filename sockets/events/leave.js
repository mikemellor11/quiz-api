var { games, STATE } = require('../../globals.js');

var quiz = {}; ({ 
    reset: quiz.reset
} = require('../../services/quiz.js'));

var users = {}; ({ 
    find: users.find,
    removeActive: users.removeActive,
    admin: users.admin,
} = require('../../services/users.js'));

module.exports = (socket, game) => () => {
    var user = users.find(game, socket.id);

    if(user){
        console.log(`${socket.nsp.name}: ${socket.id} ${user.name} left the game`);

        socket.nsp.emit('output', '🔴 <i>' + user.name + ' left the game..</i>');
        
        users.removeActive(game, user.id);

        users.admin(game);
        
        socket.nsp.emit('update users');

        if(!game.users.length){
            quiz.reset(game);

            socket.nsp.emit('update state', game.state);
        }
    }
}
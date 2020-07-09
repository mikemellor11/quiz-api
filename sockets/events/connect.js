var { games } = require('../../globals.js');

var quiz = {}; ({ 
    init: quiz.init,
    ready: quiz.ready,
    getToken: quiz.getToken
} = require('../../services/quiz.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
        
    if(!game){
        game = quiz.init(socket.nsp.name);

        console.log(`${game.name}: State: ${game.state}`);

        socket.nsp.emit('update state', game.state)

        quiz.getToken()
            .then((res) => {
                quiz.ready(game, res);

                console.log(`${game.name}: State: ${game.state}`);

                socket.nsp.emit('update state', game.state);
            });
    }

    game.sockets.push(socket.id);

    socket.nsp.emit('update users');
}
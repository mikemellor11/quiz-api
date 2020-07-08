var { games } = require('../globals.js');

var quiz = {}; ({ 
    init: quiz.init,
    ready: quiz.ready,
    getToken: quiz.getToken
} = require('../services/quiz.js'));

module.exports = (io) => {
    io.of(/./g).on('connection', function(socket){
        console.log(socket.nsp.name + ": " + socket.id + " connected");

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
    
        socket.on('disconnect', require('./events/disconnect.js')(socket, games[socket.nsp.name]));
        socket.on('join', require('./events/join.js')(socket, games[socket.nsp.name]));
        socket.on('leave', require('./events/leave.js')(socket, games[socket.nsp.name]));
        socket.on('start', require('./events/start.js')(socket, games[socket.nsp.name]));
        socket.on('answer', require('./events/answer.js')(socket, games[socket.nsp.name]));
        socket.on('input', require('./events/input.js')(socket, games[socket.nsp.name]));
    });
}
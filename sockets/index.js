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
            game = quiz.init(socket, true);

            quiz.getToken()
                .then((res) => quiz.ready(game, res.data.token));
        }
    
        game.sockets.push(socket.id);
    
        socket.nsp.emit('update users');
    
        require('./events/answer.js')(socket);
        require('./events/disconnect.js')(socket);
        require('./events/input.js')(socket);
        require('./events/join.js')(socket);
        require('./events/leave.js')(socket);
        require('./events/start.js')(socket);
    });
}
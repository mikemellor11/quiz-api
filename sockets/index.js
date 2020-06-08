var { games } = require('../globals.js');
var { startQuiz } = require('../services/quiz.js');

module.exports = (io) => {
    io.of(/./g).on('connection', function(socket){
        console.log(socket.nsp.name + ": " + socket.id + " connected");
    
        startQuiz(socket);
    
        games[socket.nsp.name].sockets.push(socket.id);
    
        socket.nsp.emit('update users');
    
        require('./events/answer.js')(socket);
        require('./events/disconnect.js')(socket);
        require('./events/input.js')(socket);
        require('./events/join.js')(socket);
        require('./events/leave.js')(socket);
        require('./events/start.js')(socket);
    });
}
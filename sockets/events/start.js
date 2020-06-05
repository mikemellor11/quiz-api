var { STATE, games } = require('../../globals.js');
var { nextQuestion } = require('../../services/quiz.js');

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('start', message => {
        console.log(`${socket.nsp.name}: ${socket.id} State: ${STATE.PLAYING}`);
        game.state = STATE.PLAYING;

        socket.nsp.emit('update state', game.state);

        nextQuestion(game, socket);
    });
}
var { STATE, games } = require('../../globals.js');

var quiz = {}; ({ 
    getQuestion: quiz.getQuestion,
    setQuestion: quiz.setQuestion,
    reset: quiz.reset
} = require('../../services/quiz.js'));

module.exports = (socket, game) => () => {
    console.log(`${socket.nsp.name}: State: ${game.state}`);
    
    quiz.reset(game);

    socket.nsp.emit('update state', game.state);
    socket.nsp.emit('update users');
    socket.nsp.emit('question');
}
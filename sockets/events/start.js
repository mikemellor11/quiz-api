var { STATE, games } = require('../../globals.js');

var quiz = {}; ({ 
    getQuestion: quiz.getQuestion,
    setQuestion: quiz.setQuestion
} = require('../../services/quiz.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('start', message => {
        if(game.state !== STATE.READY){ return; }

        console.log(`${socket.nsp.name}: ${socket.id} State: ${STATE.PLAYING}`);
        
        game.state = STATE.PLAYING;

        socket.nsp.emit('update state', game.state);

        quiz.getQuestion(game)
            .then((res) => {
                quiz.setQuestion(game, res.data.results[0]);

                socket.nsp.emit('question');
            });
    });
}
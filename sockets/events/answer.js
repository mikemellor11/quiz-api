var { STATE, games } = require('../../globals.js');
var { nextQuestion } = require('../../services/quiz.js');

var quiz = {}; ({ 
    getQuestion: quiz.getQuestion,
    setQuestion: quiz.setQuestion,
    answer: quiz.answer,
    allAnswered: quiz.allAnswered,
    roundFinished: quiz.roundFinished,
    finished: quiz.finished
} = require('../../services/quiz.js'));

var users = {}; ({ 
    active: users.active,
    findActive: users.findActive
} = require('../../services/users.js'));

module.exports = (socket, game) => ({session, index}) => {
    if(quiz.answer(game, session.id, index)){
        console.log(`${socket.nsp.name}: ${socket.id} ${socket.name} answered ${index}`);

        socket.nsp.emit('question');

        if(quiz.allAnswered(game)){
            console.log(`${socket.nsp.name}: All answered`);

            socket.nsp.emit('update users');

            if(quiz.roundFinished(game)){
                quiz.finished(game);
            } else {
                setTimeout(() => {
                    quiz.getQuestion(game)
                        .then((res) => {
                            quiz.setQuestion(game, res.data.results[0]);

                            socket.nsp.emit('question');
                        });
                }, 1000);
            }
        }
    }
}
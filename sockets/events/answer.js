var { STATE, games } = require('../../globals.js');
var { nextQuestion } = require('../../services/quiz.js');

var quiz = {}; ({ 
    getQuestion: quiz.getQuestion,
    setQuestion: quiz.setQuestion
} = require('../../services/quiz.js'));

var users = {}; ({ 
    active: users.active,
    findActive: users.findActive
} = require('../../services/users.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('answer', ({session, index}) => {
        var user = users.findActive(game, session.id);

        // Only accept a single answer from the same user
        if(game.question.submitted.findIndex(d => d.id === user.id) === -1){
            console.log(`${socket.nsp.name}: ${socket.id} ${user.name} answered ${index}`);

            game.question.submitted.push({
                id: user.id,
                name: user.name,
                index: index
            });

            socket.nsp.emit('question');

            if(game.question.submitted.length === users.active(game).length){
                game.question.submitted.forEach(d => {
                    // var user = game.users.find(dd => dd.session.id === d.id);
                    var user = users.findActive(game, d.id);

                    if(d.index === game.question.correct){
                        user.score += 100;
                        console.log(`${socket.nsp.name}: ${user.id} ${user.name} answered correctly`);
                    } else {
                        console.log(`${socket.nsp.name}: ${user.id} ${user.name} answered incorrectly`);
                    }
                });

                game.question.answer = game.question.correct;

                socket.nsp.emit('update users');

                setTimeout(() => {
                    quiz.getQuestion(game)
                        .then((res) => quiz.setQuestion(game, res.data.results[0]));
                }, 2000);
            }
        }
    });
}
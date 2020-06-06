var { STATE, games } = require('../../globals.js');
var { nextQuestion } = require('../../services/quiz.js');

var users = {}; ({ 
    active: users.active
} = require('../../services/users.js'));

module.exports = (socket) => {
    var game = games[socket.nsp.name];
    
    socket.on('answer', index => {
        // Only accept a single answer from the same user
        if(game.question.submitted.findIndex(d => d.id === socket.session.id) === -1){
            console.log(`${socket.nsp.name}: ${socket.id} ${socket.session.name} answered ${index}`);

            game.question.submitted.push({
                id: socket.session.id,
                index: index
            });

            socket.nsp.emit('question');

            if(game.question.submitted.length === users.active(game).length){
                game.question.submitted.forEach(d => {
                    var user = game.users.find(dd => dd.session.id === d.id);

                    if(d.index === game.question.correct){
                        user.score += 10;
                        console.log(`${socket.nsp.name}: ${user.session.id} ${user.session.name} answered correctly`);
                    } else {
                        console.log(`${socket.nsp.name}: ${user.session.id} ${user.session.name} answered incorrectly`);
                    }
                });

                socket.nsp.emit('update users');

                nextQuestion(game, socket);
            }
        }
    });
}
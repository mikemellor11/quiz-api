var { games, STATE } = require('../../globals.js');

var quiz = require('../../services/quiz.js');
var users = require('../../services/users.js');

module.exports = (socket, game) => () => {
    var user = users.find(game, socket.id);

    if(user){
        console.log(`${socket.nsp.name}: ${socket.id} ${user.name} left the game`);

        socket.nsp.emit('output', '🔴 <i>' + user.name + ' left the game..</i>');
        
        users.removeActive(game, user.id);

        users.admin(game);
        
        socket.nsp.emit('update users');

        if(!game.users.length){
            quiz.reset(game);

            socket.nsp.emit('update state', game.state);
        } else {
            if(quiz.allAnswered(game)){
                console.log(`${socket.nsp.name}: All answered`);
    
                socket.nsp.emit('update users');
    
                if(quiz.roundFinished(game)){
                    console.log(`${socket.nsp.name}: Game finished`);
    
                    quiz.finished(game);
    
                    socket.nsp.emit('update state', game.state);
                } else {
                    setTimeout(() => {
                        quiz.getQuestion(game)
                            .then((res) => {
                                quiz.setQuestion(game, res.data.results[0]);
    
                                socket.nsp.emit('question');
                            });
                    }, 2000);
                }
            }
        }
    }
}
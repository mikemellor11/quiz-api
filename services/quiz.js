const axios = require('axios');

var { STATE, games } = require('../globals.js');

module.exports = {
    startQuiz: (socket) => {
        if(!games[socket.nsp.name]){
            games[socket.nsp.name] = {
                users: [],
                state: STATE.SETUP,
                token: null,
                question: null
            };
            console.log(`${socket.nsp.name}: ${socket.id} State: ${STATE.SETUP}`);
            
            socket.nsp.emit('update state', games[socket.nsp.name].state);
    
            axios.get(`https://opentdb.com/api_token.php?command=request`)
                .then(res => {
                    console.log(`${socket.nsp.name}: ${socket.id} State: ${STATE.READY}`);
                    
                    games[socket.nsp.name].token = res.data.token;
                    games[socket.nsp.name].state = STATE.READY;
                    socket.nsp.emit('update state', games[socket.nsp.name].state);
                });
        }
    },
    nextQuestion: (game, socket) => {
        axios.get(`https://opentdb.com/api.php?amount=1&type=multiple&token=${game.token}`)
            .then(res => {
                game.question = {
                    question: res.data.results[0].question,
                    answers: [res.data.results[0].correct_answer]
                        .concat(res.data.results[0].incorrect_answers)
                        .sort(),
                    submitted: []
                };

                game.question.correct = game.question.answers.indexOf(res.data.results[0].correct_answer);

                socket.nsp.emit('question');
            });
    }
}
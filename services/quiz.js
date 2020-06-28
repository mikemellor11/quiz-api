const axios = require('axios');

var { STATE, games } = require('../globals.js');

module.exports = exports = {
    init: (socket) => {
        if(games[socket.nsp.name]) {
            return;
        }

        var game = games[socket.nsp.name] = {
            socket: socket.nsp,
            users: [],
            sockets: [],
            state: STATE.INIT,
            token: null,
            question: null
        };
        
        console.log(`${game.socket.name}: State: ${game.state}`);
        
        game.socket.emit('update state', game.state);

        return game;
    },
    ready: (game, token) => {
        console.log(`${game.socket.name}: State: ${STATE.READY}`);

        game.token = token;
        game.state = STATE.READY;
        game.socket.emit('update state', game.state);
    },
    getToken: () => axios.get(`https://opentdb.com/api_token.php?command=request`),
    getQuestion: (game) => axios.get(`https://opentdb.com/api.php?amount=1&type=multiple&token=${game.token}`),
    setQuestion: (game, question) => {
        game.question = {
            question: question.question,
            answers: [question.correct_answer]
                .concat(question.incorrect_answers)
                .sort(),
            submitted: []
        };

        game.question.correct = game.question.answers.indexOf(question.correct_answer);

        game.socket.emit('question');
    }
};
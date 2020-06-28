const axios = require('axios');

var { STATE, games } = require('../globals.js');

module.exports = exports = {
    init: (name) => {
        if(games[name]) {
            return;
        }

        var game = games[name] = {
            name: name,
            users: [],
            sockets: [],
            state: STATE.INIT,
            token: null,
            question: null
        };
        
        console.log(`${game.name}: State: ${game.state}`);

        return game;
    },
    ready: (game, token) => {
        console.log(`${game.name}: State: ${STATE.READY}`);

        game.token = token;
        game.state = STATE.READY;
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
    }
};
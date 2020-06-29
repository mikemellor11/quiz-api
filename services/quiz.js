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

        return game;
    },
    ready: (game, token) => {
        game.token = token || '';
        game.state = STATE.READY;
    },
    getToken: () => {
        return new Promise((resolve) => {
                axios.get(`https://opentdb.com/api_token.php?command=request`)
                    .then((res) => resolve(res.data.token))
                    .catch((err) => resolve(''));
            });
    },
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
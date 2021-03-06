const axios = require('axios');

var { STATE, games } = require('../globals.js');

var users = {}; ({ 
    active: users.active,
    findActive: users.findActive
} = require('./users.js'));

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
    remove: (name) => {
        games[name] = null;
    },
    ready: (game, token) => {
        game.token = token || '';
        game.state = STATE.READY;
    },
    start: (game) =>{
        game.state = STATE.PLAYING;
    },
    finished: (game) => {
        game.state = STATE.FINISHED;
    },
    reset: (game) => {
        game.state = STATE.READY;
        game.question = null;
        exports.resetScores(game);
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
    },
    answer: (game, session, index) => {
        if(session){
            var user = users.findActive(game, session.id);

            // Only accept a single answer from the same user and from users that are part of this game
            if(user && game.question.submitted.findIndex(d => d.id === user.id) === -1){
                game.question.submitted.push({
                    id: user.id,
                    name: user.name,
                    index: index
                });

                return true;
            }
        }
        
        return false;
    },
    allAnswered: (game) => {
        if(game.question && game.question.submitted.length >= users.active(game).length){
            exports.addScores(game);

            game.question.answer = game.question.correct;

            return true;
        }

        return false;
    },
    resetScores: (game) => {
        game.users.forEach(d => d.score = 0);
    },
    addScores: (game) => {
        game.question.submitted.forEach(d => {
            var user = users.findActive(game, d.id);

            if(user && d.index === game.question.correct){
                user.score += 100;
            }
        });
    },
    roundFinished: (game) => {
        return !!users.active(game).filter(d => d.score >= 1000).length;
    }
};
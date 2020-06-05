const express = require('express');
const route = express.Router();
var { games } = require('../../globals.js');

module.exports = (app) => {
    app.use('/question', route);

    route.get('/:room', (req, res) => {
        var game = games[`/${req.params.room}`];
    
        res.json(game && game.question && {
            question: game.question.question,
            answers: game.question.answers,
            submitted: game.question.submitted
        } || null);
    });
};
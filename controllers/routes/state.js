const express = require('express');
const route = express.Router();
var { games } = require('../../globals.js');

module.exports = (app) => {
    app.use('/state', route);

    route.get('/:room', (req, res) => {
        var game = games[`/${req.params.room}`];
        
        res.json(game && game.state || 0);
    });
};
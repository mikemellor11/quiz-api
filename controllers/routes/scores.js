const express = require('express');
const route = express.Router();
var { games } = require('../../globals.js');

var users = {}; ({ 
    active: users.active,
    spectators: users.spectators,
    connected: users.connected
} = require('../../services/users.js'));

module.exports = (app) => {
    app.use('/scores', route);

    route.get('/:room', (req, res) => {
        var game = games[`/${req.params.room}`];

        res.json(users.connected(game));
    });
};
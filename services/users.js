const axios = require('axios');

var { STATE, games } = require('../globals.js');

module.exports = exports = {
    active: (game) => {
        return game.users;
    },
    spectators: (game) => {
        return game.sockets.filter(d => !exports.find(game, d));
    },
    find: (game, socket) => {
        return game.users.find(d => d.sockets.indexOf(socket) > -1) || null;
    },
    findActive: (game, id) => {        
        return exports.active(game).find(d => d.id === id) || null;
    }
};
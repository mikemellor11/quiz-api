const axios = require('axios');

var { STATE, games } = require('../globals.js');

module.exports = exports = {
    add: (game, session, socket) => {
        var user = exports.findActive(game, session.id);

        if(user){
            // Not sure if this if statement is needed
            if(user.sockets.indexOf(socket) === -1){
                user.sockets.push(socket);
            }
        } else if(game.state === STATE.INIT || game.state === STATE.READY){
            game.users.push({
                id: session.id,
                name: session.name,
                sockets: [socket],
                score: 0
            });

            return true;
        }

        return false;
    },
    active: (game) => {
        return game && game.users || [];
    },
    spectators: (game) => {
        return game && game.sockets.filter(d => !exports.find(game, d)) || [];
    },
    connected: (game) => {
        return game && exports.active(game).concat(exports.spectators(game)) || [];
    },
    // Find active user with given socket id
    find: (game, id) => {
        return exports.active(game).find(d => d.sockets.indexOf(id) > -1) || null;
    },
    // Find active user with the given id
    findActive: (game, id) => {        
        return exports.active(game).find(d => d.id === id) || null;
    },
    // Check if socket id is bound to a user, if it is remove it. Also remove socket from sockets array
    remove: (game, id) => {
        var user = exports.find(game, id);

        if(user){
            user.sockets.splice(user.sockets.findIndex(d => d === id), 1);
        }

        game.sockets.splice(game.sockets.findIndex(d => d === id), 1);
    },
    removeActive: (game, id) => {
        game.users.splice(game.users.findIndex(d => d.id === id), 1);
    }
};
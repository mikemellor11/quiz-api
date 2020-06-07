const axios = require('axios');

var { STATE, games } = require('../globals.js');

module.exports = exports = {
    active: (game) => {
        return game.users.reduce((arr, d) => {
            // If users has active session and isn't already added to the array
            if(d.session && arr.findIndex(dd => dd.session.id === d.session.id) === -1){
                arr.push(d);
            }
            return arr;
        }, []);
    },
    spectators: (game) => {
        return game.users.reduce((arr, d) => {
            // If user has no session and isn't already added to the array
            if(!d.session && arr.findIndex(dd => dd.id === d.id) === -1){
                arr.push(d);
            }
            return arr;
        }, []);
    },
    find: (game, id) => {
        return game.users.find(d => d.id === id) || null;
    },
    findActive: (game, id) => {        
        return exports.active(game).find(dd => dd.session.id === id) || null;
    }
};
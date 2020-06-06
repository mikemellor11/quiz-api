const axios = require('axios');

var { STATE, games } = require('../globals.js');

module.exports = {
    active: (game) => {
        return game.users.reduce((arr, d) => {
            if(!d.session || arr.findIndex(dd => dd.session && dd.session.id === d.session.id) === -1){
                arr.push(d);
            }
            return arr;
        }, []);
    },
    test: () => {
        console.log("ZXCV");
    }
};
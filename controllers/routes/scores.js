const express = require('express');
const route = express.Router();
var { games } = require('../../globals.js');

module.exports = (app) => {
    app.use('/scores', route);

    route.get('/:room', (req, res) => {
        var game = games[`/${req.params.room}`];
    
        var val = game && game.users.reduce((arr, d) => {
            if(!d.session || arr.findIndex(dd => dd.session && dd.session.id === d.session.id) === -1){
                arr.push(d);
            }
            return arr;
        }, []);
        
        res.json(val || []);
    });
};
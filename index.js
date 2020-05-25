const express = require('express');
const cors = require('cors')
const app = express();
const axios = require('axios');

app.use(cors());

const http = require('http').Server(app);
const io = require('socket.io')(http);

var tokens = {};
var games = {};

app.get('/scores/:room', (req, res) => {
    var game = games[`/${req.params.room}`];
    
    res.json(game && game.users.reduce((arr, d) => {
            if(!d.session || arr.findIndex(dd => !dd.session || d.session.id === dd.session.id) === -1){
                arr.push(d);
            }
            return arr;
        }, []) || []);
});

app.get('/question', (req, res) => {
    res.json([
        {
            name: 'Mike',
            score: 10
        }
    ]);
});

io.of(/./g).on('connection', function(socket){
    console.log(socket.nsp.name + ": " + socket.id + " connected");

    if(!games[socket.nsp.name]){
        games[socket.nsp.name] = {
            users: [],
            state: 0
        };
    }

    games[socket.nsp.name].users.push({id: socket.id});

    // if(!tokens[socket.nsp.name]){
    //     axios.get(`https://opentdb.com/api_token.php?command=request`)
    //         .then(res => {
    //             tokens[socket.nsp.name] = res.data.token;
    //             // console.log("ready");
    //         });
    // }

    socket.nsp.emit('update users');

    socket.on('join', session => {
        console.log(`${socket.nsp.name}: ${socket.id} ${session.name} joined the game`);
        socket.session = session;
        games[socket.nsp.name].users.find(d => d.id === socket.id).session = socket.session;
        games[socket.nsp.name].users.find(d => d.id === socket.id).score = 0;
        
        socket.nsp.emit('output', '🔵 <i>' + socket.session.name + ' joined the game..</i>');
        socket.nsp.emit('update users');
    });

    socket.on('leave', () => {
        console.log(`${socket.nsp.name}: ${socket.id} ${socket.session.name} left the game`);
        socket.nsp.emit('output', '🔵 <i>' + socket.session.name + ' left the games..</i>');

        socket.session = null;
        games[socket.nsp.name].users.find(d => d.id === socket.id).session = null;
        
        socket.nsp.emit('update users');
    });

    socket.on('disconnect', reason => {
        console.log(`${socket.nsp.name}: ${socket.id} ${socket.session && socket.session.name || ''} disconnected`);

        var index = games[socket.nsp.name].users.findIndex(d => d.id === socket.id);

        if(index > -1){
            games[socket.nsp.name].users. splice(index, 1);
            socket.nsp.emit('update users');
        }


        if(games[socket.nsp.name].users && !games[socket.nsp.name].users.length){
            games[socket.nsp.name] = null; 
        }
    });

    socket.on('input', message => {
        socket.nsp.emit('output', `<strong>${socket.session && socket.session.name || 'spectator'}</strong>: ${message}`);
    });

    socket.on('start', message => {
        axios.get(`https://opentdb.com/api.php?amount=1&type=multiple&token=${tokens[socket.nsp.name]}`)
            .then(res => {
                socket.nsp.emit('question', {
                    question: res.data.results[0].question,
                    answers: [res.data.results[0].correct_answer]
                        .concat(res.data.results[0].incorrect_answers)
                        .sort()
                });
            });
    });
});

const server = http.listen(8080, () => console.log("Listening on *:8080"));
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
    res.json(game && game.users.map(d => {
        return {
            id: d.id,
            name: d.name,
            score: 0
        };
    }) || []);
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

    socket.on('join', username => {
        console.log(`${socket.nsp.name}: ${socket.id} ${username} joined the game`);
        socket.username = username;
        games[socket.nsp.name].users.find(d => d.id === socket.id).name = username;
        
        socket.nsp.emit('output', '🔵 <i>' + socket.username + ' join the chat..</i>');
        socket.nsp.emit('update users');
    });

    socket.on('leave', () => {
        console.log(`${socket.nsp.name}: ${socket.id} ${socket.username} left the game`);
        socket.username = null;
        games[socket.nsp.name].users.find(d => d.id === socket.id).name = null;
        
        socket.nsp.emit('output', '🔵 <i>' + socket.username + ' left the chat..</i>');
        socket.nsp.emit('update users');
    });

    socket.on('disconnect', reason => {
        console.log(`${socket.nsp.name}: ${socket.id} ${socket.username || ''} disconnected`);

        var index = games[socket.nsp.name].users.findIndex(d => d.id === socket.id);

        if(index > -1){
            games[socket.nsp.name].users. splice(index, 1);
            socket.nsp.emit('output', '🔴 <i>' + socket.username + ' left the chat..</i>');
            socket.nsp.emit('update users');
        }


        if(!games[socket.nsp.name].users.length){
            games[socket.nsp.name] = null; 
        }
    });

    socket.on('input', message => socket.nsp.emit('output', '<strong>' + socket.username + '</strong>: ' + message));

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
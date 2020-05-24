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
            name: d,
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
    console.log(socket.nsp.name + ": " + "connection");

    if(!games[socket.nsp.name]){
        games[socket.nsp.name] = {
            users: [],
            state: 0
        };
    }

    // if(!tokens[socket.nsp.name]){
    //     axios.get(`https://opentdb.com/api_token.php?command=request`)
    //         .then(res => {
    //             tokens[socket.nsp.name] = res.data.token;
    //             // console.log("ready");
    //         });
    // }

    socket.nsp.emit('update users');

    socket.on('username', username => {
        console.log(socket.nsp.name + ": " + username + " connected");
        socket.username = username;
        games[socket.nsp.name].users.push(username);
        socket.nsp.emit('output', '🔵 <i>' + socket.username + ' join the chat..</i>');
        socket.nsp.emit('update users');
    });

    socket.on('disconnect', reason => {
        var index = games[socket.nsp.name].users.indexOf(socket.username);

        if(index > -1){
            console.log(socket.nsp.name + ": " + socket.username + " disconnected");
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
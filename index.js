const express = require('express');
const cors = require('cors')
const app = express();
const axios = require('axios');

app.use(cors());

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/scores', (req, res) => {
    res.json([
        {
            name: 'Mike',
            score: 10
        }
    ]);
});

app.get('/question', (req, res) => {
    res.json([
        {
            name: 'Mike',
            score: 10
        }
    ]);
});

var tokens = {};
var games = {};

io.of(/./g).on('connection', function(socket){
    //console.log(socket.nsp.name, tokens);

    if(!tokens[socket.nsp.name]){
        games[socket.nsp.name] = {
            users: [],
            state: 0
        };

        axios.get(`https://opentdb.com/api_token.php?command=request`)
            .then(res => {
                tokens[socket.nsp.name] = res.data.token;
                // console.log("ready");
            });
    }
    socket.on('username', username => {
        socket.username = username;
        games[socket.nsp.name].users.push(username);
        console.log(games[socket.nsp.name]);
        socket.nsp.emit('output', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('disconnect', reason => {
        console.log(`${socket.username} disconnected`)
        games[socket.nsp.name].users.splice(games[socket.nsp.name].users.indexOf(socket.username), 1);
        console.log(games[socket.nsp.name]);
        socket.nsp.emit('output', '🔴 <i>' + socket.username + ' left the chat..</i>');
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
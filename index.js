const express = require('express');
const cors = require('cors')
const app = express();
const axios = require('axios');

app.use(cors());

const http = require('http').Server(app);
const io = require('socket.io')(http);

var STATE = {
    SETUP: 0,
    READY: 1,
    PLAYING: 2,
    FINISHED: 3
};
Object.freeze(STATE);

var games = {};

app.get('/scores/:room', (req, res) => {
    var game = games[`/${req.params.room}`];

    var val = game && game.users.reduce((arr, d) => {
        if(!d.session || arr.findIndex(dd => dd.session && dd.session.id === d.session.id) === -1){
            arr.push(d);
        }
        return arr;
    }, []);
    
    res.json(val || []);
});

app.get('/state/:room', (req, res) => {
    var game = games[`/${req.params.room}`];
    
    res.json(game && game.state || 0);
});

app.get('/question/:room', (req, res) => {
    var game = games[`/${req.params.room}`];

    res.json(game && game.question || null);
});

io.of(/./g).on('connection', function(socket){
    console.log(socket.nsp.name + ": " + socket.id + " connected");

    if(!games[socket.nsp.name]){
        games[socket.nsp.name] = {
            users: [],
            state: STATE.SETUP,
            token: null,
            question: null
        };
        console.log(`${socket.nsp.name}: ${socket.id} State: ${STATE.SETUP}`);
        
        socket.nsp.emit('update state', games[socket.nsp.name].state);

        axios.get(`https://opentdb.com/api_token.php?command=request`)
            .then(res => {
                console.log(`${socket.nsp.name}: ${socket.id} State: ${STATE.READY}`);
                
                games[socket.nsp.name].token = res.data.token;
                games[socket.nsp.name].state = STATE.READY;
                socket.nsp.emit('update state', games[socket.nsp.name].state);
            });
    }

    var game = games[socket.nsp.name];

    game.users.push({id: socket.id});

    socket.nsp.emit('update users');

    socket.on('join', session => {
        console.log(`${socket.nsp.name}: ${socket.id} ${session.name} joined the game`);
        socket.session = session;
        game.users.find(d => d.id === socket.id).session = socket.session;
        game.users.find(d => d.id === socket.id).score = 0;
        
        socket.nsp.emit('output', '🔵 <i>' + socket.session.name + ' joined the game..</i>');
        socket.nsp.emit('update users');
    });

    socket.on('leave', () => {
        console.log(`${socket.nsp.name}: ${socket.id} ${socket.session.name} left the game`);
        socket.nsp.emit('output', '🔴 <i>' + socket.session.name + ' left the game..</i>');

        socket.session = null;
        game.users.find(d => d.id === socket.id).session = null;
        
        socket.nsp.emit('update users');
    });

    socket.on('disconnect', reason => {
        console.log(`${socket.nsp.name}: ${socket.id} ${socket.session && socket.session.name || 'spectator'} disconnected`);

        var index = game.users.findIndex(d => d.id === socket.id);

        if(index > -1){
            game.users. splice(index, 1);
            socket.nsp.emit('update users');
        }


        if(game.users && !game.users.length){
            game = null; 
        }
    });

    socket.on('input', message => {
        socket.nsp.emit('output', `<strong>${socket.session && socket.session.name || 'spectator'}</strong>: ${message}`);
    });

    socket.on('start', message => {
        console.log(`${socket.nsp.name}: ${socket.id} State: ${STATE.PLAYING}`);
        game.state = STATE.PLAYING;

        socket.nsp.emit('update state', game.state);

        nextQuestion();
    });

    function nextQuestion(){
        axios.get(`https://opentdb.com/api.php?amount=1&type=multiple&token=${game.token}`)
            .then(res => {
                game.question = {
                    question: res.data.results[0].question,
                    answers: [res.data.results[0].correct_answer]
                        .concat(res.data.results[0].incorrect_answers)
                        .sort()
                };

                socket.nsp.emit('question');
            });
    }
});

const server = http.listen(8080, () => console.log("Listening on *:8080"));
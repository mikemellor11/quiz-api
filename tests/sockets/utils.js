module.exports = exports = (function() {
    require('console.mute');

    this.expect = require('chai').expect;

    this.STATE = require('../../globals.js').STATE;
    this.games = require('../../globals.js').games;

    this.users = require('../../services/users');
    this.quiz = require('../../services/quiz');

    this.io_server;
    this.io = require('socket.io-client');

    this.serverSockets = [];
    this.serverSocket = (id) => serverSockets.find(d => d.id === id);

    this.sockets;
    
    this.sessions;
    this.questions;

    this.setup = async (cb) => {
        console.mute();
        await cb();
        console.resume();
    };

    this.answer = (socket, session, index) => {
        require('../../sockets/events/answer.js')(serverSocket(socket.id), games[serverSocket(socket.id).nsp.name])({session, index})
    };
    
    this.reset = (socket) => {
        require('../../sockets/events/reset.js')(serverSocket(socket.id), games[serverSocket(socket.id).nsp.name])()
    };
    
    this.join = (socket, session) => {
        require('../../sockets/events/join.js')(serverSocket(socket.id), games[serverSocket(socket.id).nsp.name])(session)
    };

    this.leave = (socket) => {
        require('../../sockets/events/leave.js')(serverSocket(socket.id), games[serverSocket(socket.id).nsp.name])()
    };
    
    this.connect = (socket) => {
        return new Promise((resolve) => {
            socket.once('connect', () => resolve());
            socket.open();
        });
    };
    
    this.disconnect = (socket) => {
        return new Promise((resolve) => {
            if(socket.connected){
                require('../../sockets/events/disconnect.js')(serverSocket(socket.id), games[serverSocket(socket.id).nsp.name])();
                socket.once('disconnect', () => resolve());
                socket.disconnect();
            } else {
                resolve();
            }
        });
    };

    this.open = () => {
        sessions = require('../fixtures/sessions.json');
        questions = require('../fixtures/questions.json');

        io_server = require('socket.io').listen(3000);

        sockets = {
            '/room-1': [
                io.connect('http://localhost:3000/room-1', {autoConnect: false}),
                io.connect('http://localhost:3000/room-1', {autoConnect: false})
            ],
            '/room-2': [
                io.connect('http://localhost:3000/room-2', {autoConnect: false})
            ],
            '/room-3': [
            ]
        };

        io_server.of(/./g).on('connection', (socket) => serverSockets.push(socket));
    };

    this.start = (cb1, cb2) => async () => {
        await setup(async () => {
            for(var room in sockets){
                quiz.init(room);
                quiz.ready(games[room]);

                for(var i = 0; i < sockets[room].length; i++){
                    await connect(sockets[room][i]);

                    if(cb1){
                        cb1(room, i);
                    }
                }

                if(cb2){
                    cb2(room);
                }
            }
        });
    };

    this.clean = async () => {
        await setup(async () => {
            for(var room in sockets){
                for(var i = 0; i < sockets[room].length; i++){
                    await disconnect(sockets[room][i])
                }
                quiz.remove(room);
            }
            serverSockets = [];
        });
    };

    this.close = () => {
        io_server.close();
        console.resume();
    };
}());
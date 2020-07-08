require('console.mute');

var expect = require('chai').expect;

var { STATE, games } = require('../../globals.js');

var users = require('../../services/users');
var quiz = require('../../services/quiz');

var io_server;
const io = require('socket.io-client');

var serverSockets = [];
var serverSocket = (id) => serverSockets.find(d => d.id === id);

async function setup(cb){
    console.mute();
    await cb();
    console.resume();
}

function join(socket, session){
    require('../../sockets/events/join.js')(serverSocket(socket.id), games[serverSocket(socket.id).nsp.name])(session)
}

function leave(socket){
    require('../../sockets/events/leave.js')(serverSocket(socket.id), games[serverSocket(socket.id).nsp.name])()
}

function connect(socket){
    return new Promise((resolve) => {
        socket.once('connect', () => resolve());
        socket.open();
    });
}

function disconnect(socket){
    return new Promise((resolve) => {
        if(socket.connected){
            require('../../sockets/events/disconnect.js')(serverSocket(socket.id), games[serverSocket(socket.id).nsp.name])();
            socket.once('disconnect', () => resolve());
            socket.disconnect();
        } else {
            resolve();
        }
    });
}

describe('sockets: disconnect', () => {
    var sockets;
    var sessions;

    before(() => {
        sessions = require('../fixtures/sessions.json');

        io_server = require('socket.io').listen(3000);

        sockets = {
            '/room-1': [
                io.connect('http://localhost:3000/room-1', {autoConnect: false}),
                io.connect('http://localhost:3000/room-1', {autoConnect: false})
            ],
            '/room-2': [
                io.connect('http://localhost:3000/room-2', {autoConnect: false}),
                io.connect('http://localhost:3000/room-2', {autoConnect: false})
            ]
        };

        io_server.of(/./g).on('connection', (socket) => serverSockets.push(socket));
    });

    beforeEach(async () => {
        await setup(async () => {
            for(var room in sockets){
                quiz.init(room);
                quiz.ready(games[room]);

                for(var i = 0; i < sockets[room].length; i++){
                    await connect(sockets[room][i]);
                    join(sockets[room][i], sessions[i]);
                }
            }
        });
    });

    it('Should only remove socket id from users sockets array if disconnect called on active user with multiple connected sockets', async () => {
        // await setup(async () => {
        //     leave(sockets['/room-1'][0], sessions[0]);
        // });

        // var game = games['/room-1'];
        // var user = users.findActive(game, 'test-1');

        // expect(user.sockets).to.have.lengthOf(1);
        // expect(user.sockets).to.not.contain(id);
        // expect(game.sockets).to.not.contain(id);
    });

    it('Should remove user from sockets array if disconnected called on active user', async () => {
        // await setup(async () => {
        //     leave(sockets['/room-1'][0], sessions[0]);
        // });

        // var game = games['/room-1'];
        // var user = users.findActive(game, 'test-1');

        // expect(user.sockets).to.not.have.length;
        // expect(user.sockets).to.not.contain(id);
        // expect(game.sockets).to.not.contain(id);
    });

    afterEach(async () => {
        await setup(async () => {
            for(var room in sockets){
                for(var i = 0; i < sockets[room].length; i++){
                    await disconnect(sockets[room][i])
                }
                quiz.remove(room);
            }
            serverSockets = [];
        });
    });

    after(() => {
        io_server.close();
        console.resume();
    });
});
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

function connect(socket){
    return new Promise((resolve) => {
        socket.once('connect', () => {
            require('../../sockets/events/connect.js')(serverSocket(socket.id));
            resolve();
        });
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

describe('sockets: connect', () => {
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

    it('Should add a user to games sockets array', async () => {
        await setup(async () => {
            await connect(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];

        expect(game.sockets).to.contain(sockets['/room-1'][0].id);
    });

    it('Should set state to INIT on first connection to game', async () => {
        await setup(async () => {
            await connect(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];

        expect(game.state).to.equal(STATE.INIT);
    });

    // NEED SINON TO STUB GETTOKEN REQUEST
    it('Should set state to READY when api token returned', async () => {
        // await setup(async () => {
        //     await connect(sockets['/room-1'][0]);
        //     console.log("CONNECTED");
        // });

        // expect(games['/room-1'].state).to.equal(STATE.INIT);

        // console.log("asdfasdf", games['/room-1'].state);

        // return new Promise((resolve) => {
        //     sockets['/room-1'][0].on('update state', () => {
        //         console.log("asdfasdf", games['/room-1'].state);

        //         var game = games['/room-1'];

        //         expect(game.state).to.equal(STATE.READY);

        //         resolve();
        //     });
        // });
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
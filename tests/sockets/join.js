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

describe('sockets: join', () => {
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
                }
            }
        });
    });

    it('Should add user to active users when unique id passed in', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
        });

        var game = games['/room-1'];
        var user = users.find(game, sockets['/room-1'][0].id);

        expect(game.users).to.have.lengthOf(1);        
        expect(user).to.not.be.null;
        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.contain(sockets['/room-1'][0].id);
    });

    it('Should only add to users sockets array when duplicate id passed in', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[0]);
        });
        
        var game = games['/room-1'];
        var user = users.find(game, sockets['/room-1'][1].id);
        
        expect(game.users).to.have.lengthOf(1);
        expect(user).to.not.be.null;
        expect(user.sockets).to.have.lengthOf(2);
        expect(user.sockets).to.contain(sockets['/room-1'][0].id);
        expect(user.sockets).to.contain(sockets['/room-1'][1].id);
    });

    it('Should add multiple users to active users when unique ids passed in', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[1]);
        });

        expect(games['/room-1'].users).to.have.lengthOf(2);
    });

    it('Should reconnect active user when an existing session id passed in', async () => {
        var game = games['/room-1'];

        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            await disconnect(sockets['/room-1'][0]);
            join(sockets['/room-1'][1], sessions[0]);
        });
        
        var user = users.find(game, sockets['/room-1'][1].id);

        expect(game.users).to.have.lengthOf(1);
        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.contain(sockets['/room-1'][1].id);
    });

    it('Should reconnect active user if join called with an existing session id even after game has started', async () => {
        var game = games['/room-1'];

        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            await disconnect(sockets['/room-1'][0]);
            quiz.start(game);
            join(sockets['/room-1'][1], sessions[0]);
        });

        var user = users.find(game, sockets['/room-1'][1].id);

        expect(game.users).to.have.lengthOf(1);
        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.contain(sockets['/room-1'][1].id);
    });

    it('Should ignore when the same id passed in by the same socket', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][0], sessions[0]);
        });

        var game = games['/room-1'];
        var user = users.find(game, sockets['/room-1'][0].id);

        expect(game.users).to.have.lengthOf(1);
        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.contain(sockets['/room-1'][0].id);
    });

    it('Should ignore when different ids passed in by the same socket', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][0], sessions[1]);
        });
        var game = games['/room-1'];

        expect(game.users).to.have.lengthOf(1);
    });

    it('Should ignore join calls for new users after the game has begun', async () => {
        var game = games['/room-1'];

        await setup(async () => {
            quiz.start(game);
            join(sockets['/room-1'][0], sessions[0]);
        });

        expect(game.users).to.have.lengthOf(0);
    });

    it('Should set an admin flag on the first person to join', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
        });

        var user = users.find(games['/room-1'], sockets['/room-1'][0].id);

        expect(user).to.have.property('admin');
    });

    it('Should not set admin flag on second user to join', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[1]);
        });

        var user = users.find(games['/room-1'], sockets['/room-1'][1].id);

        expect(user).to.not.have.property('admin');
    });

    it('Should resassign the admin to a new user if the admin leaves', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[1]);
            leave(sockets['/room-1'][0]);
        });

        var user = users.find(games['/room-1'], sockets['/room-1'][1].id);

        expect(user).to.have.property('admin');
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
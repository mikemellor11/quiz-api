require('console.mute');

var expect = require('chai').expect;

var { STATE, games } = require('../../globals.js');

const io_server = require('socket.io').listen(3001);
const io = require('socket.io-client');

require('../../sockets/index.js')(io_server);

describe('sockets: state', () => {
    var socket;
    var game;

    before(() => {
        console.mute();
        socket = io.connect('http://localhost:3001/room-state');
    });

    it('Should have an initial state of INIT', (done) => {
        socket.on('connect', () => {
            game = games[socket.nsp];

            socket.once('update state', () => {
                expect(game.state).to.be.equal(STATE.INIT);
                done();
            });
        });
    });

    it('Should be READY after the quiz api has returned', (done) => {
        console.mute();
        socket.once('update state', () => {
            console.resume();
            expect(game.state).to.be.equal(STATE.READY);
            done();
        });
    });

    it('Should be PLAYING after the quiz api has returned', (done) => {
        console.mute();
        socket.emit('start');

        socket.once('update state', () => {
            console.resume();
            expect(game.state).to.be.equal(STATE.PLAYING);
            done();
        });
    });

    it('Should be FINISHED when first user has reached the target score', (done) => {
        console.mute();
        socket.emit('join', {id: 'test', name: 'john'});

        socket.once('update users', () => {
            console.resume();
            // expect(game.state).to.be.equal(STATE.FINISHED);
            done();
        });
    });

    after(() => {
        console.mute();
        if(socket.connected) {
            socket.disconnect();
        }

        io_server.close();
        console.resume();
    });
});
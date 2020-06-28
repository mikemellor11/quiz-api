require('console.mute');

var expect = require('chai').expect;

var { STATE, games } = require('../../globals.js');

const io_server = require('socket.io').listen(3001);
const io = require('socket.io-client');

require('../../sockets/index.js')(io_server);

describe('sockets: state', () => {
    var socket;
    var game;

    before((done) => {
        console.mute();
        socket = io.connect('http://localhost:3001/test');
        
        socket.on('connect', () => {
            game = games[socket.nsp];
            console.resume(); 
            done();
        });
    });

    it('Should have an initial state of INIT', () => {
        expect(game.state).to.be.equal(STATE.INIT);
    });

    it('Should keep INIT state if start called before state set to READY', () => {
        console.mute();
        socket.emit('start');

        console.resume();
        expect(game.state).to.be.equal(STATE.INIT);
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
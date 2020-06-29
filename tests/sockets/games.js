require('console.mute');

var expect = require('chai').expect;

var { STATE, games } = require('../../globals.js');

var quiz = require('../../services/quiz.js');
var users = require('../../services/users.js');

const io_server = require('socket.io').listen(3003);
const io = require('socket.io-client');

require('../../sockets/index.js')(io_server);

describe('sockets: games', () => {
    var socket;
    var game;
    var sessions;
    var question;

    before((done) => {
        question = require('../fixtures/question.json');
        sessions = require('../fixtures/sessions.json');

        console.mute();
        socket = io.connect('http://localhost:3003/test');
        
        socket.once('connect', () => {
            game = games[socket.nsp];

            socket.on('update state', () => {
                if(game.state === STATE.READY){
                    socket.off('update state');

                    socket.once('update users', () => {
                        socket.once('update state', () => {
                            console.resume();
                            done();
                        });

                        socket.emit('start');
                    });

                    socket.emit('join', sessions[0]);
                }
            });
        });
    });

    beforeEach(() => {
        quiz.setQuestion(game, question);
    });

    it('Should add 100 points for correct answer', (done) => {
        console.mute();
        socket.once('update users', () => {
            console.resume();
            expect(users.findActive(game, 'test-1').score).to.equal(100);
            
            socket.once('question', () => {
                done();
            });
        });
        
        socket.emit('answer', {session: sessions[0], index: 0});
    });

    it('Should add 0 points for incorrect answer', (done) => {
        console.mute();
        socket.once('update users', () => {
            console.resume();
            expect(users.findActive(game, 'test-1').score).to.equal(100);
            
            socket.once('question', () => {
                done();
            });
        });
        
        socket.emit('answer', {session: sessions[0], index: 1});
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
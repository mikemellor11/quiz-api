require('console.mute');

var expect = require('chai').expect;

var { STATE, games } = require('../../globals.js');

const io_server = require('socket.io').listen(3002);
const io = require('socket.io-client');

require('../../sockets/index.js')(io_server);

describe('sockets: users', () => {
    var sockets = [];
    var game;
    var sessions;

    before(() => {
        sessions = require('../fixtures/sessions.json');
    });

    it('Should add socket ids to games sockets array', (done) => {
        console.mute();
        sockets.push(io.connect('http://localhost:3002/room-1'));
        sockets.push(io.connect('http://localhost:3002/room-1'));
        sockets.push(io.connect('http://localhost:3002/room-1'));
        sockets.push(io.connect('http://localhost:3002/room-1'));
        sockets.push(io.connect('http://localhost:3002/room-1'));
    
        sockets[0].on('update state', () => {
            game = games[sockets[0].nsp];

            if(game.state === STATE.READY){
                console.resume();

                sockets.forEach(d => {
                    expect(game.sockets).to.be.an('array').that.contains(d.id);
                });

                sockets[0].off('update state');
                
                done();
            }
        });
    });

    it('Should add user to active users when join called with unique id', (done) => {
        console.mute();
        sockets[0].emit('join', sessions[0]);
        
        sockets[0].once('update users', () => {
            console.resume();
            expect(game.users).to.have.lengthOf(1);
            expect(game.users[0].id).to.be.equal('test-1');
            expect(game.users[0].sockets).to.contain(sockets[0].id);
            done();
        });
    });

    it('Should only add to users sockets array when join called with a duplicate id', (done) => {
        console.mute();
        sockets[1].emit('join', sessions[0]);
        
        sockets[1].once('update users', () => {
            console.resume();
            expect(game.users).to.have.lengthOf(1);
            expect(game.users[0].sockets).to.have.lengthOf(2);
            expect(game.users[0].sockets).to.contain(sockets[1].id);
            done();
        });
    });

    it('Should add second user to active users when join called with unique id', (done) => {
        console.mute();
        sockets[2].emit('join', sessions[1]);
        
        sockets[2].once('update users', () => {
            console.resume();
            expect(game.users).to.have.lengthOf(2);
            expect(game.users[1].id).to.be.equal('test-2');
            expect(game.users[1].sockets).to.contain(sockets[2].id);
            done();
        });
    });

    it('Should remove active user if leave called', (done) => {
        console.mute();
        sockets[2].emit('leave');
        
        sockets[2].once('update users', () => {
            expect(game.users).to.have.lengthOf(1);

            sockets[2].emit('join', sessions[1]);
        
            sockets[2].once('update users', () => {
                console.resume();
                done();
            });
        });
    });

    it('Should ignore multiple calls to leave', (done) => {
        console.mute();
        sockets[2].emit('leave');
        sockets[2].emit('leave');
        
        sockets[2].once('update users', () => {
            expect(game.users).to.have.lengthOf(1);
            
            sockets[2].emit('join', sessions[1]);
        
            sockets[2].once('update users', () => {
                console.resume();
                done();
            });
        });
    });

    it('Should only remove socket id from users sockets array if disconnect called on active user with multiple connected sockets', (done) => {
        console.mute();

        var id = sockets[1].id;
        
        sockets[0].once('update users', () => {
            console.resume();
            expect(game.users[0].sockets).to.have.lengthOf(1);
            expect(game.sockets).to.not.contain(id);
            done();
        });

        sockets[1].disconnect();
    });

    it('Should remove user from sockets array if disconnected called on active user', (done) => {
        console.mute();

        var id = sockets[2].id;
        
        sockets[0].once('update users', () => {
            console.resume();
            expect(game.users[1].sockets).to.not.have.length;
            expect(game.sockets).to.not.contain(id);
            
            done();
        });

        sockets[2].disconnect();
    });

    it('Should reconnect active user if join called with an existing session id', (done) => {
        console.mute();

        sockets[3].emit('join', sessions[1]);
        
        sockets[3].once('update users', () => {
            console.resume();
            expect(game.users[1].sockets).to.have.lengthOf(1);
            expect(game.users[1].sockets).to.contain(sockets[3].id);
            done();
        });
    });

    it('Should ignore a second join call from the same socket id', (done) => {
        console.mute();

        sockets[3].emit('join', sessions[1]);
        
        sockets[3].once('update users', () => {
            console.resume();
            expect(game.users).to.have.lengthOf(2);
            expect(game.users[1].sockets).to.have.lengthOf(1);
            expect(game.users[1].sockets).to.contain(sockets[3].id);
            done();
        });
    });

    it('Should ignore join calls for new users after the game has begun', (done) => {
        console.mute();

        sockets[3].emit('start');
        
        sockets[3].once('update state', () => {
            sockets[4].emit('join', sessions[2]);
        
            sockets[4].once('update users', () => {
                console.resume();                
                expect(game.users).to.have.lengthOf(2);
                done();
            });
        });
    });

    after((done) => {
        console.mute();

        // Close final socket and server
        sockets[sockets.length - 1].once('update users', () => {
            sockets[sockets.length - 1].disconnect();
            io_server.close();
            console.resume();
            done();
        });

        // Close all but last, use last to listen for update users even in the disconnect event
        sockets.forEach((d, i) => {
            if(d.connected && i !== sockets.length - 1) {
                d.disconnect();
            }
        });
    });
});
require('console.mute');

var expect = require('chai').expect;

var { STATE, games } = require('../../globals.js');

var users = require('../../services/users');

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
            var user = users.findActive(game, 'test-1');
            console.resume();
            expect(game.users).to.have.lengthOf(1);
            expect(user).to.not.be.null;
            expect(user.sockets).to.contain(sockets[0].id);
            done();
        });
    });

    it('Should only add to users sockets array when join called with a duplicate id', (done) => {
        console.mute();
        sockets[1].emit('join', sessions[0]);
        
        sockets[1].once('update users', () => {
            var user = users.find(game, sockets[1].id);
            console.resume();
            expect(game.users).to.have.lengthOf(1);
            expect(user).to.not.be.null;
            expect(user.sockets).to.have.lengthOf(2);
            expect(user.sockets).to.contain(sockets[1].id);
            done();
        });
    });

    it('Should add second user to active users when join called with unique id', (done) => {
        console.mute();
        sockets[2].emit('join', sessions[1]);
        
        sockets[2].once('update users', () => {
            var user = users.findActive(game, 'test-2');
            console.resume();
            expect(game.users).to.have.lengthOf(2);
            expect(user).to.not.be.null;
            expect(user.sockets).to.contain(sockets[2].id);
            done();
        });
    });

    it('Should remove active user if leave called', (done) => {
        console.mute();
        sockets[2].emit('leave');
        
        sockets[2].once('update users', () => {
            console.resume();
            expect(game.users).to.have.lengthOf(1);
            expect(users.findActive(game, 'test-2')).to.be.null;
            expect(game.sockets).to.be.an('array').that.contains(sockets[2].id);

            console.mute();
            
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
            console.resume();
            expect(game.users).to.have.lengthOf(1);
            expect(users.findActive(game, 'test-2')).to.be.null;
            expect(game.sockets).to.be.an('array').that.contains(sockets[2].id);

            console.mute();
            
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
        var user = users.find(game, id);

        sockets[0].once('update users', () => {
            console.resume();
            expect(user.sockets).to.have.lengthOf(1);
            expect(user.sockets).to.not.contain(id);
            expect(game.sockets).to.not.contain(id);
            done();
        });

        sockets[1].disconnect();
    });

    it('Should remove user from sockets array if disconnected called on active user', (done) => {
        console.mute();

        var id = sockets[2].id;
        var user = users.find(game, id);
        
        sockets[0].once('update users', () => {
            console.resume();
            expect(user.sockets).to.not.have.length;
            expect(user.sockets).to.not.contain(id);
            expect(game.sockets).to.not.contain(id);
            
            done();
        });

        sockets[2].disconnect();
    });

    it('Should reconnect active user if join called with an existing session id', (done) => {
        console.mute();

        sockets[3].emit('join', sessions[1]);
        
        sockets[3].once('update users', () => {
            var user = users.findActive(game, 'test-2');
            console.resume();
            expect(game.users).to.have.lengthOf(2);
            expect(user.sockets).to.have.lengthOf(1);
            expect(user.sockets).to.contain(sockets[3].id);
            done();
        });
    });

    it('Should ignore a second join call from the same socket id', (done) => {
        console.mute();

        sockets[3].emit('join', sessions[1]);
        
        sockets[3].once('update users', () => {
            var user = users.findActive(game, 'test-2');
            console.resume();
            expect(game.users).to.have.lengthOf(2);
            expect(user.sockets).to.have.lengthOf(1);
            expect(user.sockets).to.contain(sockets[3].id);
            done();
        });
    });

    it('Should ignore join calls for new users after the game has begun', (done) => {
        console.mute();

        sockets[3].emit('start');
        
        sockets[3].once('update state', () => {
            sockets[4].emit('join', sessions[2]);
        
            sockets[4].once('update users', () => {
                var user = users.findActive(game, 'test-3');
                console.resume();                
                expect(user).to.be.null;
                expect(game.users).to.have.lengthOf(2);
                done();
            });
        });
    });

    it('Should reconnect active user if join called with an existing session id even after game has started', (done) => {
        console.mute();

        var id = sockets[3].id;
        var user = users.find(game, id);
        
        sockets[0].once('update users', () => {
            console.resume();
            expect(user.sockets).to.have.lengthOf(0);
            expect(game.sockets).to.not.contain(id);
            
            console.mute();

            setTimeout(() => {
                sockets[5].emit('join', sessions[1]);
            
                sockets[5].once('update users', () => {
                    console.resume();
                    expect(game.users).to.have.lengthOf(2);
                    expect(user.sockets).to.have.lengthOf(1);
                    expect(user.sockets).to.contain(sockets[5].id);
                    done();
                });
            });
        });

        sockets[3].disconnect();
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
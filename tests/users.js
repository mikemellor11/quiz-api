var expect = require('chai').expect;

var users = require('../services/users');

describe('users', () => {
    let games;
    let game;

    before(() => {
        games = require('./fixtures/users.json');
        game = games['game-1'];
    });

    it('Should only return active users', () => {
        expect(users.active(game)).to.have.lengthOf(3);
    });

    it('Should return an empty array if invalid game passed to active', () => {
        expect(users.active(null)).to.be.empty;
    });

    it('Should only return spectators', () => {
        expect(users.spectators(game)).to.have.lengthOf(2);
    });

    it('Should return an empty array if invalid game passed to spectators', () => {
        expect(users.spectators(null)).to.be.empty;
    });

    it('Should return all connected users', () => {
        expect(users.connected(game)).to.have.lengthOf(5);
    });

    it('Should return an empty array if invalid game passed to connected', () => {
        expect(users.connected(null)).to.be.empty;
    });

    it('Should find an active user with a given session id', () => {
        expect(users.findActive(game, 'session-id-1')).to.have.property('id').to.equal('session-id-1');
    });

    it('Should return the first active user found if multiple present', () => {
        expect(users.findActive(game, 'session-id-2')).to.have.property('id').to.equal('session-id-2');
    });

    it('Should return null if the given session id is not a valid active user', () => {
        expect(users.findActive(game, 'session-id-4')).to.be.null;
    });

    it('Should find user with a given socket id', () => {
        expect(users.find(game, 'socket-id-6')).to.have.property('id').to.equal('session-id-3');
    });

    it('Should return null if the given socket id is not a valid user', () => {
        expect(users.find(game, 'socket-id-nonexistent')).to.be.null;
    });

    it('Should find the user with the connected socket and remove it', () => {
        users.remove(game, 'socket-id-6');

        expect(users.find(game, 'socket-id-6')).to.be.null;
    });

    it('Should remove the socket from the sockets array', () => {
        users.remove(game, 'socket-id-7');

        expect(game.sockets.indexOf('socket-id-7')).to.be.equal(-1);
    });

    it('Should remove a user with the given id', () => {
        users.removeActive(game, 'session-id-1');

        expect(users.findActive(game, 'session-id-1')).to.be.null;
    });
});
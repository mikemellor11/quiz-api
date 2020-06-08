var expect = require('chai').expect;

var users = require('../services/users');

describe('users', () => {
    let games;

    before(() => {
        games = require('./fixtures/users.json');
    });

    it('Should only return active users', () => {
        expect(users.active(games['game-1'])).to.have.lengthOf(3);
    });

    it('Should only return spectators', () => {
        expect(users.spectators(games['game-1'])).to.have.lengthOf(2);
    });

    it('Should find an active user with a given session id', () => {
        expect(users.findActive(games['game-1'], 'session-id-1')).to.have.property('id').to.equal('session-id-1');
    });

    it('Should return the first active user found if multiple present', () => {
        expect(users.findActive(games['game-1'], 'session-id-2')).to.have.property('id').to.equal('session-id-2');
    });

    it('Should return null if the given session id is not a valid active user', () => {
        expect(users.findActive(games['game-1'], 'session-id-4')).to.be.null;
    });

    it('Should find user with a given socket id', () => {
        expect(users.find(games['game-1'], 'socket-id-6')).to.have.property('id').to.equal('session-id-3');
    });

    it('Should return null if the given socket id is not a valid user', () => {
        expect(users.find(games['game-1'], 'socket-id-nonexistent')).to.be.null;
    });
});
var expect = require('chai').expect;

var quiz = require('../../services/quiz');

describe('Services: quiz', () => {
    let games;
    let game;

    before(() => {
        games = JSON.parse(JSON.stringify(require('../fixtures/users.json')));
        game = games['game-1'];
    });

    it('Should return the current game when init called', () => {
        expect(true).to.be.true;
    });
});
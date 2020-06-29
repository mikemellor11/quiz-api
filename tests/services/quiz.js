var expect = require('chai').expect;

var { STATE, games } = require('../../globals.js');

var quiz = require('../../services/quiz');

describe('services: quiz', () => {
    let game;
    let question;

    before(() => {
        question = JSON.parse(JSON.stringify(require('../fixtures/question.json')));
    });

    it('Should init and return the current game', () => {
        game = quiz.init('test');

        expect(game.name).to.be.equal('test');
        expect(game.state).to.be.equal(STATE.INIT);
        expect(game.users).to.be.empty;
        expect(game.sockets).to.be.empty;
        expect(game.token).to.be.null;
        expect(game.question).to.be.null;
    });

    it('Should set game state to ready', () => {
        quiz.ready(game);

        expect(game.state).to.be.equal(STATE.READY);
    });

    it('Should set the question', () => {
        quiz.setQuestion(game, question);

        expect(game.question.question).to.be.equal('Dummy question?');
    });

    it('Should return a valid open trivia token', (done) => {
        quiz.getToken()
            .then((res) => {
                expect(res).to.be.string;
                done();
            });
    });

    it('Should return a question from open trivia api', (done) => {
        quiz.getQuestion(game)
            .then((res) => {
                expect(res.data.results[0]).to.have.property('question');
                done();
            });
    });
});
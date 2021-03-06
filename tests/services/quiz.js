var expect = require('chai').expect;

var { STATE, games } = require('../../globals.js');

var quiz = require('../../services/quiz');
var users = require('../../services/users');

describe('services: quiz', () => {
    let game;
    let questions;

    before(() => {
        questions = JSON.parse(JSON.stringify(require('../fixtures/questions.json')));
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

    it('Should ignore multiple init commands', () => {
        expect(quiz.init('test')).to.be.undefined;
    });

    it('Should set game state to ready', () => {
        quiz.ready(game);

        expect(game.state).to.be.equal(STATE.READY);
    });

    it('Should set the question', () => {
        quiz.setQuestion(game, questions[0]);

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

    it('Should set the game state to finished when score of 1000 reached', () => {
        quiz.setQuestion(game, questions[0]);
        users.add(game, {id: 'test-1', name: 'pat'}, 'socket-1');
        quiz.answer(game, {id: 'test-1', name: 'pat'}, 0);
        for(var i = 0; i < 10; i++){quiz.addScores(game);}
        expect(quiz.roundFinished(game)).to.be.true;
        quiz.finished(game);
        expect(game.state).to.be.equal(STATE.FINISHED);
    });

    it('Should reset the game score and state to ready', () => {
        quiz.reset(game);
        
        expect(game.users[0].score).to.be.equal(0);
        expect(game.state).to.be.equal(STATE.READY);
    });
});
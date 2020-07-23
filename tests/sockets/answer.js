require("./utils.js");

describe('sockets: answer', () => {
    before(open);
    beforeEach(start(
        (room, i) => join(sockets[room][i], sessions[i]),
        (room) => {
            quiz.start(games[room]);
            quiz.setQuestion(games[room], questions[0]);
        })
    );

    it('Should add 100 points for correct answer', async () => {
        await setup(async () => {
            answer(sockets['/room-2'][0], sessions[0], 0);
        });

        expect(users.findActive(games['/room-2'], 'test-1').score).to.equal(100);
    });

    it('Should add 0 points for incorrect answer', async () => {
        await setup(async () => {
            answer(sockets['/room-2'][0], sessions[0], 1);
        });

        expect(users.findActive(games['/room-2'], 'test-1').score).to.equal(0);
    });

    it('Should not add any points to scores if not all users have answered', async () => {
        await setup(async () => {
            answer(sockets['/room-1'][0], sessions[0], 0);
        });

        expect(users.findActive(games['/room-1'], 'test-1').score).to.equal(0);
    });

    it('Should add points to scores if all users have answered', async () => {
        await setup(async () => {
            answer(sockets['/room-1'][0], sessions[0], 0);
            answer(sockets['/room-1'][1], sessions[1], 0);
        });

        expect(users.findActive(games['/room-1'], 'test-1').score).to.equal(100);
    });

    it('Should ignore answers from spectators', async () => {
        await setup(async () => {
            answer(sockets['/room-2'][0], null, 0);
        });

        expect(users.findActive(games['/room-2'], 'test-2')).to.be.null;
    });

    it('Should ignore answers from active users that are not part of this game', async () => {
        await setup(async () => {
            answer(sockets['/room-2'][0], sessions[1], 0);
        });

        expect(users.findActive(games['/room-2'], 'test-2')).to.be.null;
    });

    it('Should trigger all answers given if user answers and then leaves then another user answers', async () => {
        await setup(async () => {
            answer(sockets['/room-1'][0], sessions[0], 0);
            leave(sockets['/room-1'][0]);
            answer(sockets['/room-1'][1], sessions[1], 0);
        });

        expect(users.find(games['/room-1'], sockets['/room-1'][1].id).score).to.equal(100);
    });

    it('Should trigger all answers given if the last user to answer leaves without answering', async () => {
        await setup(async () => {
            answer(sockets['/room-1'][0], sessions[0], 0);
            leave(sockets['/room-1'][1]);
        });

        expect(users.find(games['/room-1'], sockets['/room-1'][0].id).score).to.equal(100);
    });

    afterEach(clean);
    after(close);
});
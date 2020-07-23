require("./utils.js");

describe('sockets: reset', () => {
    before(open);
    beforeEach(start((room, i) => join(sockets[room][i], sessions[i])));

    it('Should set the game state back to READY', async () => {
        var game = games['/room-1'];

        await setup(async () => {
            quiz.start(game);
            reset(sockets['/room-1'][1]);
        });

        expect(game.state).to.equal(STATE.READY);
    });

    afterEach(clean);
    after(close);
});
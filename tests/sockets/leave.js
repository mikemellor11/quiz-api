require("./utils.js");

describe('sockets: leave', () => {
    before(open);
    beforeEach(start((room, i) => join(sockets[room][i], sessions[i])));

    it('Should remove active user', async () => {
        await setup(async () => {
            leave(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];
        var user = users.findActive(game, 'test-1');

        expect(game.users).to.have.lengthOf(1);
        expect(user).to.be.null;
    });

    it('Should ignore multiple calls', async () => {
        await setup(async () => {
            leave(sockets['/room-1'][0]);
            leave(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];
        var user = users.findActive(game, 'test-1');

        expect(game.users).to.have.lengthOf(1);
        expect(user).to.be.null;
    });

    it('Should end game if all users leave', async () => {
        var game = games['/room-1'];

        await setup(async () => {
            quiz.start(game);
            leave(sockets['/room-1'][0]);
            leave(sockets['/room-1'][1]);
        });

        expect(game.state).to.equal(STATE.READY);
    });

    afterEach(clean);
    after(close);
});
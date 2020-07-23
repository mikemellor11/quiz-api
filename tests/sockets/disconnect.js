require("./utils.js");

describe('sockets: disconnect', () => {
    before(open);
    beforeEach(start());

    it('Should remove socket id from the games sockets array', async () => {
        await setup(async () => {
            await disconnect(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];

        expect(game.sockets).to.not.contain(sockets['/room-1'][0].id);
    });

    it('Should remove socket id from sockets array if disconnected called on active user', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            await disconnect(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];
        var user = users.findActive(game, 'test-1');

        expect(user.sockets).to.not.have.length;
        expect(user.sockets).to.not.contain(sockets['/room-1'][0].id);
        expect(game.sockets).to.not.contain(sockets['/room-1'][0].id);
    });

    it('Should remove socket id from users sockets array if disconnect called on active user with multiple connected sockets', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[0]);
            await disconnect(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];
        var user = users.findActive(game, 'test-1');

        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.not.contain(sockets['/room-1'][0].id);
        expect(game.sockets).to.not.contain(sockets['/room-1'][0].id);
    });

    afterEach(clean);
    after(close);
});
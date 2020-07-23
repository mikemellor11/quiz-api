require("./utils.js");

describe('sockets: join', () => {
    before(open);
    beforeEach(start());

    it('Should add user to active users when unique id passed in', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
        });

        var game = games['/room-1'];
        var user = users.find(game, sockets['/room-1'][0].id);

        expect(game.users).to.have.lengthOf(1);        
        expect(user).to.not.be.null;
        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.contain(sockets['/room-1'][0].id);
    });

    it('Should only add to users sockets array when duplicate id passed in', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[0]);
        });
        
        var game = games['/room-1'];
        var user = users.find(game, sockets['/room-1'][1].id);
        
        expect(game.users).to.have.lengthOf(1);
        expect(user).to.not.be.null;
        expect(user.sockets).to.have.lengthOf(2);
        expect(user.sockets).to.contain(sockets['/room-1'][0].id);
        expect(user.sockets).to.contain(sockets['/room-1'][1].id);
    });

    it('Should add multiple users to active users when unique ids passed in', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[1]);
        });

        expect(games['/room-1'].users).to.have.lengthOf(2);
    });

    it('Should reconnect active user when an existing session id passed in', async () => {
        var game = games['/room-1'];

        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            await disconnect(sockets['/room-1'][0]);
            join(sockets['/room-1'][1], sessions[0]);
        });
        
        var user = users.find(game, sockets['/room-1'][1].id);

        expect(game.users).to.have.lengthOf(1);
        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.contain(sockets['/room-1'][1].id);
    });

    it('Should reconnect active user if join called with an existing session id even after game has started', async () => {
        var game = games['/room-1'];

        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            await disconnect(sockets['/room-1'][0]);
            quiz.start(game);
            join(sockets['/room-1'][1], sessions[0]);
        });

        var user = users.find(game, sockets['/room-1'][1].id);

        expect(game.users).to.have.lengthOf(1);
        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.contain(sockets['/room-1'][1].id);
    });

    it('Should ignore when the same id passed in by the same socket', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][0], sessions[0]);
        });

        var game = games['/room-1'];
        var user = users.find(game, sockets['/room-1'][0].id);

        expect(game.users).to.have.lengthOf(1);
        expect(user.sockets).to.have.lengthOf(1);
        expect(user.sockets).to.contain(sockets['/room-1'][0].id);
    });

    it('Should ignore when different ids passed in by the same socket', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][0], sessions[1]);
        });
        var game = games['/room-1'];

        expect(game.users).to.have.lengthOf(1);
    });

    it('Should ignore join calls for new users after the game has begun', async () => {
        var game = games['/room-1'];

        await setup(async () => {
            quiz.start(game);
            join(sockets['/room-1'][0], sessions[0]);
        });

        expect(game.users).to.have.lengthOf(0);
    });

    it('Should set an admin flag on the first person to join', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
        });

        var user = users.find(games['/room-1'], sockets['/room-1'][0].id);

        expect(user).to.have.property('admin');
    });

    it('Should not set admin flag on second user to join', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[1]);
        });

        var user = users.find(games['/room-1'], sockets['/room-1'][1].id);

        expect(user).to.not.have.property('admin');
    });

    it('Should resassign the admin to a new user if the admin leaves', async () => {
        await setup(async () => {
            join(sockets['/room-1'][0], sessions[0]);
            join(sockets['/room-1'][1], sessions[1]);
            leave(sockets['/room-1'][0]);
        });

        var user = users.find(games['/room-1'], sockets['/room-1'][1].id);

        expect(user).to.have.property('admin');
    });

    afterEach(clean);
    after(close);
});
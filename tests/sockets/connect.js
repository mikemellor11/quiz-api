require("./utils.js");

function connect(socket){
    return new Promise((resolve) => {
        socket.once('connect', () => {
            require('../../sockets/events/connect.js')(serverSocket(socket.id));
            resolve();
        });
        socket.open();
    });
}

describe('sockets: connect', () => {
    before(open);

    it('Should add a user to games sockets array', async () => {
        await setup(async () => {
            await connect(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];

        expect(game.sockets).to.contain(sockets['/room-1'][0].id);
    });

    it('Should set state to INIT on first connection to game', async () => {
        await setup(async () => {
            await connect(sockets['/room-1'][0]);
        });

        var game = games['/room-1'];

        expect(game.state).to.equal(STATE.INIT);
    });

    // NEED SINON TO STUB GETTOKEN REQUEST
    it('Should set state to READY when api token returned', async () => {
        // await setup(async () => {
        //     await connect(sockets['/room-1'][0]);
        //     console.log("CONNECTED");
        // });

        // expect(games['/room-1'].state).to.equal(STATE.INIT);

        // console.log("asdfasdf", games['/room-1'].state);

        // return new Promise((resolve) => {
        //     sockets['/room-1'][0].on('update state', () => {
        //         console.log("asdfasdf", games['/room-1'].state);

        //         var game = games['/room-1'];

        //         expect(game.state).to.equal(STATE.READY);

        //         resolve();
        //     });
        // });
    });

    afterEach(clean);
    after(close);
});
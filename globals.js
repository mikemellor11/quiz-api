var STATE = {
    SETUP: 0,
    READY: 1,
    PLAYING: 2,
    FINISHED: 3
};
Object.freeze(STATE);

var games = {};

module.exports = {
    STATE,
    games
};
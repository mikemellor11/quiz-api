const express = require('express');
const cors = require('cors')
const app = express();

app.use(cors());

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/', require("./controllers/index.js")());

require('./sockets/index.js')(io);

const server = http.listen(8080, () => console.log("Listening on *:8080"));
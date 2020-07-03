const express = require('express');
const cors = require('cors')
const app = express();

var whitelist = [
    'http://localhost:1234',
    'http://192.168.0.11:1234',
    'https://mikemellor11-quiz-site.netlify.app',
    'https://quiz-site-seven.vercel.app'
];
app.use(cors({
    origin: (origin, cb) => {
        if (whitelist.indexOf(origin) !== -1) {
            cb(null, true)
        } else {
            cb(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/', require("./controllers/index.js")());

require('./sockets/index.js')(io);

const server = http.listen(process.env.PORT || 8080, (res) => console.log(`Listening on *:${server.address().port}`));
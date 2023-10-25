const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require('express-session')
//const router = express.Router()

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.json())
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}))


server.listen(8080, () => {
    console.log('Listening on 8080');
});
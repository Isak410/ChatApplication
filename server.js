const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require('express-session')
//const router = express.Router()

var users = {
    'id1':{username:'Isak', password:'Isak123'},
    'id2':{username:'Adrian', password:'Adrian123'}
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/login', (req,res) => {
    res
})

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
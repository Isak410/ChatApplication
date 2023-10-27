const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require('express-session')
const sessionLength = 1*60*5 //hvor mange sekunder til session slettes
//const router = express.Router()
const { Server } = require('socket.io');
const io = new Server(server);

var users = {
    'id1':{username:'Isak', password:'Isak123'},
    'id2':{username:'Adrian', password:'Adrian123'}
}



app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge:sessionLength*1000 }
}))

function cookieStillValid(cookie) {
    console.log(new Date())
    if (cookie.expires < new Date()) {
        return false
    } else {return true}
}

app.get('/sendUsername', (req,res) => {
    if (!req.session.username || !cookieStillValid(req.session.cookie)) {
        req.session.destroy();
        console.log("session destroyed");
        res.json('No active session');
        return;
    }
    console.log(req.session.username);
    res.json(req.session.username);
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userList = Object.values(users);
    const user = userList.find(u => u.username === username && u.password === password);
    console.log(user)
    if (user) {
        req.session.username = username;
        res.json({success:true});
    } else {
        res.json({success:false})
    }
});

app.get('/checkSession', (req,res) => {
    if (req.session.username) {
        var bool = cookieStillValid(req.session.cookie)
        if (bool == true) {
            res.json(true)
        }   else {req.session.destroy();res.json(false)}
    }   else {res.json(false)}             
})



io.on('connection', (socket) => {
    console.log('a user connected');
})

app.use(express.static('public'));

server.listen(8080, () => {
    console.log('Listening on 8080');
});
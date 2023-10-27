const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require('express-session')
const sessionLength = 1000*60*10
//const router = express.Router()
var sessions

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
    cookie: { maxAge:sessionLength }
}))

function cookieStillValid(cookie) {
    if (cookie._expires < new Date()) {
        return false
    } else {return true}
}

app.get('/sendUsername', (req,res) => {
    //sessions = req.session
    if (cookieStillValid(req.session.cookie) == false) {
        req.session.destroy()
        console.log("session destroyed")
        return
    }
    console.log(sessions.username)
    res.json(sessions.username)
    
})

app.post('/login', (req,res) => {
    if (cookieStillValid(req.session.cookie) == false) {
        req.session.destroy()
        console.log("session destroyed")
        return
    }
    const { username, password} = req.body
    const userList = Object.values(users);
    const user = userList.find(u => u.username === username && u.password === password);
    if (user) {
        res.json('Login successful!');
        
        sessions = req.session
        sessions.username = username
        console.log(req.session)
      } else {
        res.json('Invalid username or password');
      }
})


app.use(express.static('public'));

server.listen(8080, () => {
    console.log('Listening on 8080');
});
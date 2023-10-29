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
    'user1':{username:'Isak', password:'Isak123'},
    'user2':{username:'Adrian', password:'Adrian123'},
    'user3':{username:'Albert', password:'Albert123'},
    'user4':{username:'Håkon', password:'Håkon123'},
    'user5':{username:'Thomas', password:'Thomas123'},
    'user6':{username:'Gabriel', password:'Gabriel123'},
    'user7':{username:'Terje', password:'Terje123'},
}

var totalRoomsCreated = 4
var chatRooms = [
    {id:0,roomName:'heihei',users:['Isak','Adrian','Håkon']},
    {id:1,roomName:'rom2',users:['Albert','Adrian','Håkon']},
    {id:2,roomName:'Gamers',users:['Isak','Adrian','Håkon']},
    {id:3,roomName:'gompers',users:['Isak','Adrian','Håkon']}
]

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

app.post('/checkifusernametaken', (req,res) => {
    const { username } = req.body
    var bool = false
    for (var key in users) {
        if (person[key].username == username) {
            bool = true
        }
    }
    res.json(bool)
})

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

app.get('/allUsernames', (req,res) => {
    const userList = Object.values(users);
    var arr = []
    for (let i = 0; i < Object.values(users).length; i++) {
        arr[i] = userList[i].username
    }
    res.json(arr)
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userList = Object.values(users);
    const user = userList.find(u => u.username === username && u.password === password);
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
    socket.on('userlogin', () => {
        socket.join('LoggedIn')
        io.to('LoggedIn').emit('message', 'heiheiehiheiehije')
    })
    socket.on('joinchatrooms', (roomids) => {
        console.log(roomids)
        for(let i = 0; i < roomids.length; i++){
            socket.join('chatroom'+roomids[i])
        }
        console.log(socket.rooms)

    })
    socket.on('chat message', (data) => {
        console.log(data)
    })
})

app.post('/sendmessage', (req,res) => {
    const { selectedRoom, timeOfSend, message } = req.body
    var sendTimeArr = [timeOfSend[0]+timeOfSend[1],timeOfSend[3]+timeOfSend[4]]
    var myObj = {
        "room":selectedRoom,
        "senderuser":req.session.username,
        "timeOfSend":sendTimeArr,
        "message":message
    }
    console.log(selectedRoom)
    if (selectedRoom == 'global') {
    io.to('LoggedIn').emit('chatmessage', myObj)
    }   else {
        io.to('chatroom'+selectedRoom).emit('chatmessage', myObj)
    }

    console.log(myObj)

    res.json("successfull")
})

app.post('/newchatroom', (req,res) => {
    const { usersChecked, roomName } = req.body
    console.log(usersChecked)
    console.log(roomName)
    totalRoomsCreated++
    var myObj = {
        id:totalRoomsCreated,
        roomName:roomName,
        users:usersChecked
    }
    chatRooms.push(myObj)
    console.log(chatRooms)
    io.to('LoggedIn').emit('newchatroom',chatRooms)
})

app.post('/checkroomnames', (req,res) => {
    const { navn } = req.body
    var bool = false
    for (let i = 0; i < chatRooms.length; i++) {
        if (chatRooms[i].roomName == navn) {
            bool = true
        }
    }
    res.json(bool)
})

app.get('/allchatrooms', (req,res) => {
    res.json(chatRooms)
}) 



app.use(express.static('public'));

server.listen(8080, () => {
    console.log('Listening on 8080');
});
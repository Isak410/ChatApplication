const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require('express-session')
const sessionLength = 1*60*5 //hvor mange sekunder til session slettes
const sharedSession = require('express-socket.io-session');
const { Server } = require('socket.io');
const io = new Server(server);

var users = {
    'user1':{username:'Admin', password:'Admin123'},
    'user2':{username:'Isak', password:'Isak123'},
}

var totalRoomsCreated = 0
var chatRooms = [

]

app.use(express.json())


app.post('/createUser', (req,res) => {
    const { username, password } = req.body
    var usernum = "user"+(Object.keys(users).length+1)
    users[usernum] = {'username':username,'password':password}
    res.json({ success:true })
})

const sessionMiddleware = session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge:sessionLength*1000 }
})

app.use(sessionMiddleware)

io.use(sharedSession(sessionMiddleware, { autoSave: true }));

app.post('/checkifusernametaken', (req,res) => {
    const { username } = req.body
    var bool = false
    for (var userKey in users) {
        if (users.hasOwnProperty(userKey)) {
            if (users[userKey].username == username) {
                bool = true
            }
        }
    }
    res.json({usernametaken:bool})
})

function cookieStillValid(cookie) {
    if (cookie.expires < new Date()) {
        return false
    } else {return true}
}

app.get('/sendUsername', (req,res) => {
    if (!req.session.username || !cookieStillValid(req.session.cookie)) {
        req.session.destroy();
        res.json('No active session');
        return;
    }
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

app.get('/userschatrooms', (req,res) => {
    const username = req.session.username
    var arr = []
    for (let i = 0; i < chatRooms.length; i++) {
        const index = chatRooms[i].users.indexOf(username)
        if (index !== -1) {
            arr.push[chatRooms[i].id]
        }
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

app.get('/destroysession', (req,res) => {
    req.session.destroy()
})

io.on('connection', (socket) => {
    socket.on('userlogin', () => {
        socket.join('LoggedIn')

        const username = socket.handshake.session.username
        var arr = []
        for (let i = 0; i < chatRooms.length; i++) {
            const index = chatRooms[i].users.indexOf(username)
            if (index !== -1) {
                arr.push(chatRooms[i].id)
            }
        }
        io.to('LoggedIn').emit('userjoin', {roomids:arr,user:username})
    })
    socket.on('joinchatrooms', (roomids) => {
        for(let i = 0; i < roomids.length; i++){
            socket.join('chatroom'+roomids[i])
        }
    })

    socket.on('disconnect', () => {
    const username = socket.handshake.session.username
        var arr = []
        for (let i = 0; i < chatRooms.length; i++) {
            const index = chatRooms[i].users.indexOf(username)
            if (index !== -1) {
                arr.push(chatRooms[i].id)
            }
        }
        io.to('LoggedIn').emit('userjoin', {roomids:arr,user:username})
    io.to('LoggedIn').emit('userleave', {roomids:arr,user:username})
    for (let i = 0; i < arr.length; i++) {
        io.to('chatroom'+arr[i]).emit('userleave', {roomids:arr,user:username})
    }
    });
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
    if (selectedRoom == 'global') {
    io.to('LoggedIn').emit('chatmessage', myObj)
    }   else {
        io.to('chatroom'+selectedRoom).emit('chatmessage', myObj)
    }
    res.json("successfull")
})

app.post('/newchatroom', (req,res) => {
    const { usersChecked, roomName } = req.body
    totalRoomsCreated++
    var myObj = {
        id:totalRoomsCreated,
        roomName:roomName,
        users:usersChecked,
        usersconnected:[]
    }
    chatRooms.push(myObj)
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

function checksessionuser(data) {
    if (data) {
        return true
    }   else {
        return false
    }
}

app.get('/allchatrooms', (req,res) => {
    res.json(chatRooms)
}) 

app.get('/showcreateprofilepage', (req,res) => {
    res.sendFile(__dirname + '/public/createprofile.html')
})

app.get('/showmessagepage', (req,res) => {
    if (checksessionuser(req.session.username) == true) {
    res.sendFile(__dirname + '/public/chatpage.html')
    }   else{
    res.sendFile(__dirname + '/public/login.html')
    }
})

app.get('/showloginpage', (req,res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.use(express.static('public'));

app.get('/', (req, res) => {
    const htmlFile = '/public/login.html'
    res.sendFile(__dirname + htmlFile);
});

server.listen(8080, () => {
    console.log('Listening on 8080');
});
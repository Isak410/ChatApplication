const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require('express-session')
const sessionLength = 1*60*5 //hvor mange sekunder til session slettes
const sharedSession = require('express-socket.io-session');
const fs = require('fs')
const { Server } = require('socket.io');
const io = new Server(server);


var newMessages = []
var newChatrooms = []

var totalRoomsCreated = 0




app.use(express.json())


app.post('/createUser', (req,res) => {
    const { username, password } = req.body
    fs.readFile(__dirname+'/public/Storage/users.json','utf8',function(err,data){
        if(err){console.log(err);return}
        var parsedData = JSON.parse(data)
        var usernum = "user"+(Object.keys(parsedData).length+1)
        parsedData[usernum] = {'username':username,'password':password}
        fs.writeFile(__dirname+'/public/Storage/users.json',JSON.stringify(parsedData),function(err){
            if(err)console.log(err)
            else console.log('successfully created user')
            res.json({success:true})
        })
    })
})

const sessionMiddleware = session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge:sessionLength*1000 }
})

async function saveMessages() {
    if (newMessages.length == 0) return;
    fs.readFile(__dirname+'/public/Storage/messages.json', 'utf8', function(err,data){
        if (err) {console.log(err);return}
        var dataFromJsonFile = JSON.parse(data)
        console.log(dataFromJsonFile)
        for (let i = 0; i < newMessages.length; i++) {
            dataFromJsonFile.messages.push(newMessages[i])
        }
        newMessages = []
        fs.writeFile(__dirname+'/public/Storage/messages.json', JSON.stringify(dataFromJsonFile), function(err) {
            if (err) console.log(err)
            else console.log('successfully wrote file')
        })
    })
}

app.get('/getMessages', (req,res) => {
    fs.readFile(__dirname+'/public/Storage/messages.json','utf8',function(err,data){
        if(err){console.log(err);return}
        var info = JSON.parse(data)
        res.json(info)
    })
})


app.use(sessionMiddleware)

io.use(sharedSession(sessionMiddleware, { autoSave: true }));

app.post('/checkifusernametaken', (req,res) => {
    const { username } = req.body
    var bool = false
    fs.readFile(__dirname+'/public/Storage/users.json','utf8',function(err,data){
        if(err){console.log(err);return}
        var users = JSON.parse(data)
        for (var userKey in users) {
            if (users.hasOwnProperty(userKey)) {
                if (users[userKey].username == username) {
                    bool = true
                }
            }
        }
        res.json({usernametaken:bool})
    })
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
    fs.readFile(__dirname+'/public/Storage/users.json', 'utf8', function(err,data){
        if(err){console.log(err);return}
        var users = JSON.parse(data)
        const userList = Object.values(users);
        var arr = []
        for (let i = 0; i < Object.values(users).length; i++) {
            arr[i] = userList[i].username
        }
        res.json(arr)
    })
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile(__dirname+'/public/Storage/users.json','utf8',function(err,data){
        if(err){console.log(err);return}
        var parsedUsers = JSON.parse(data)
        const userList = Object.values(parsedUsers);
        const user = userList.find(u => u.username === username && u.password === password);
        if (user) {
        req.session.username = username;
        res.json({success:true});
        } else {
            res.json({success:false})
        }
    })
    
    
    
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
    })
    socket.on('joinchatrooms', (roomids) => {
        for(let i = 0; i < roomids.length; i++){
            socket.join('chatroom'+roomids[i])
        }
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
    newMessages.push(myObj)
    if (selectedRoom == 'global') {
    io.to('LoggedIn').emit('chatmessage', myObj)
    }   else {
        io.to('chatroom'+selectedRoom).emit('chatmessage', myObj)
    }
    res.json("successfull")
})

app.post('/newchatroom', (req,res) => {
    const { usersChecked, roomName } = req.body
    fs.readFile(__dirname+'/public/Storage/chatrooms.json', 'utf8', function(err,data){
        if(err){console.log(err);return}
        var allchatrooms = JSON.parse(data)
        var myObj = {
            id:allchatrooms.chatrooms.length+1,
            roomName:roomName,
            users:usersChecked,
            usersconnected:[]
        }
        allchatrooms.chatrooms.push(myObj)
        newChatrooms.push(myObj)
        io.to('LoggedIn').emit('newchatroom',allchatrooms.chatrooms)
        fs.writeFile(__dirname+'/public/Storage/chatrooms.json',JSON.stringify(allchatrooms),function(err){
            if(err)console.log(err)
            else console.log('successfully created chatroom')
            res.json({success:true})
        })
    })
    
})

app.post('/checkroomnames', (req,res) => {
    const { navn } = req.body
    fs.readFile(__dirname+'/public/Storage/chatrooms.json','utf8',function(err,data){
        if(err){console.log(err);return}
        var parsedData = JSON.parse(data)
        var bool = false
        for(let i = 0; i < parsedData.chatrooms.length; i++){
            if(parsedData.chatrooms[i].roomName == navn){
                bool = true
            }
        }
        res.json(bool)
    })
})

function checksessionuser(data) {
    if (data) {
        return true
    }   else {
        return false
    }
}

app.get('/allchatrooms', (req,res) => {
    fs.readFile(__dirname+'/public/Storage/chatrooms.json','utf8',function(err,data){
        if(err){console.log(err);return}
        var parsedData = JSON.parse(data)
        res.json(parsedData.chatrooms)
    })
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
    setInterval(saveMessages, 2000)
    console.log('Listening on 8080');
});
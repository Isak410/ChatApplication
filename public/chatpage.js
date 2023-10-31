document.addEventListener('DOMContentLoaded', () => {
    
    const formdiv = document.getElementById('formDiv')
    var prevTime = [0,0]
    var selectedRoom = 'global'
    var myUsername
    var socket = io();
    var form = document.getElementById('form');
    var input = document.getElementById('m');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission behavior
        if (input.value == "") {return}
        let tid = getTime()  
        let currentTime = (""+tid[0]+":"+tid[1]+":"+tid[2])
        var msgval = input.value
    
        //socket.emit('chat message', {timeOfSend:currentTime, message: msgval});
        fetch('/sendmessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({selectedRoom:selectedRoom,timeOfSend:currentTime,message:msgval}),
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        input.value = '';
      });

    async function activateIO() {
        socket.emit('userlogin')
        fetch('/allchatrooms')
        .then(res => res.json())
        .then(data => {
            loadtabs(data)
        })
        myUsername = await getMyUsername()
    }

    function sendmessage(e) {
        
    }

    async function loadtabinfo() {
        var arr = await getAllUsernames()
        var myUser = await getMyUsername()
        console.log(arr)
        document.getElementById('createnewtabmenu').style.display = "block"
        document.getElementById('createnewtabmenu').style.pointerEvents = "all"
        var menudiv = document.getElementById('createnewtabmenu')
        menudiv.textContent = ''
        var tabinput = document.createElement('input')
        tabinput.type = 'text'
        tabinput.placeholder = 'room name'
        tabinput.id = 'tabnavn'
        menudiv.appendChild(tabinput)
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] != myUser) {
            var div = document.createElement('div')
            
            var newInput = document.createElement('input')
            newInput.type = "checkbox"
            newInput.class = "checkboxes"
            newInput.id = ("checkbox"+arr[i])
            newInput.value = arr[i]
            var tekst = document.createTextNode(arr[i])
            div.appendChild(newInput)
            div.appendChild(tekst)
            menudiv.appendChild(div)
            }
        }
        var newKnapp = document.createElement('button')
        newKnapp.id = "newTabKnapp"
        newKnapp.textContent = "submit"
        newKnapp.addEventListener('click', createNewTab)
        var h6tag = document.createElement('h6')
        h6tag.id = 'menuh6'
        menudiv.appendChild(newKnapp)
        menudiv.appendChild(h6tag)
    }

    async function loadtabs(allchatrooms) {
        document.getElementById('tabcontainer').textContent = ""
        console.log("awdfvjkløjklawf")
        var username = await getMyUsername()
        var arr1 = []
        var roomsToJoin = []
        console.log(allchatrooms)
        for (let i = 0; i < allchatrooms.length; i++) {
            if (allchatrooms[i].users.indexOf(username) != -1) {
                arr1.push(i)
                roomsToJoin.push(allchatrooms[i].id)
                console.log(allchatrooms[i])
            }
        }
        socket.emit('joinchatrooms', roomsToJoin)
        var globalchatdiv = document.createElement('div')
        globalchatdiv.className = 'tab'
        globalchatdiv.appendChild(document.createTextNode("Global"))
        var allmessagedivs = document.getElementsByClassName('messages')
        globalchatdiv.addEventListener('click', function() {
            for (let i = 0; i < allmessagedivs.length; i++){
                allmessagedivs[i].style.display = "none"
            }   
            document.querySelector('#chatglobal').style.display = 'block'
            selectedRoom = 'global'
        })
        document.getElementById('tabcontainer').appendChild(globalchatdiv)
        for (let i = 0; i < arr1.length; i++) {
                var newDiv = Object.assign(document.createElement('div'),{className:'tab',})
                newDiv.appendChild(document.createTextNode(allchatrooms[arr1[i]].roomName))
                newDiv.addEventListener("click", function(index) {
                    return function(){
                        selectedRoom = allchatrooms[arr1[i]].id
                        openTab(index)
                        }
                    }(allchatrooms[arr1[i]].id))
                document.getElementById('tabcontainer').appendChild(newDiv)
        }
        for (let i = 0; i < arr1.length;i++) {

            var newMessageDiv = document.createElement('div')
            newMessageDiv.className = 'messages'
            newMessageDiv.id = ('chat'+allchatrooms[arr1[i]].id)
            newMessageDiv.style.display = 'none'
            document.getElementById('allmessagedivs').appendChild(newMessageDiv)
            console.log(formdiv.children.length)
    
    
        }
    
        var newClickabc = document.createElement('div')
        newClickabc.className = 'tab'
        newClickabc.id = 'clickabc'
        newClickabc.appendChild(document.createTextNode('+'))
        newClickabc.addEventListener('click', loadtabinfo)
        document.getElementById('tabcontainer').appendChild(newClickabc)
    }

    async function createNewTab() {
        var val = document.getElementById('tabnavn').value
        if (val == ""){return}
        if (val.length > 15){
            document.getElementById('menuh6').textContent = 'must contain under 16 chars'
            return;
        }
        const response = await fetch('/checkroomnames', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({navn:val})
        });
        const data = await response.json();
        if (data == true) {
            document.getElementById('menuh6').textContent = 'name taken'
            return
        }
        document.getElementById('menuh6').textContent = ''
        var arr = await getAllUsernames()
        var myUser = await getMyUsername()
        var usersChecked = [myUser]
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] != myUser) {
            if (document.getElementById('checkbox'+arr[i]).checked == true) {
                usersChecked.push(arr[i])
                }
            }
        }
        console.log(usersChecked)
        var roomName = document.getElementById('tabnavn').value
        fetch('/newchatroom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usersChecked, roomName }),
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        resetTabMenu(arr)
    }

    async function getMyUsername() {
        const username = await fetch('/sendUsername')
        .then(res => res.json())
        return username;
    }

    async function getAllUsernames() {
        const response = await fetch('/allUsernames');
        const data = await response.json();
        return data;
    }

    function getTime() {
        const dato = new Date()
        var time = dato.getHours()
        if (time < 10) {time = "0"+time}
        var minutter = dato.getMinutes()
        if (minutter < 10) {minutter = "0"+minutter}
        var sekunder = dato.getSeconds()
        if (sekunder < 10) {sekunder = "0"+sekunder}
        return ([time, minutter, sekunder])
    }

    async function openTab(roomname) {
        console.log(roomname)
        var allmessagedivs = document.getElementsByClassName('messages')
        for (let i = 0; i < allmessagedivs.length; i++){
            allmessagedivs[i].style.display = "none"
        }
        document.getElementById('chat'+roomname).style.display = "block"
        console.log("opened tab")
    }

    function resetTabMenu(arr) {
        document.getElementById('createnewtabmenu').style.display = "none"
        for (let i = 0; i < arr.length; i++) {
    
        }
    }

    async function loadChatmessage(msg) {

        var divToAppendTo = document.getElementById('chat'+msg.room)
        console.log(myUsername)
        console.log(prevTime)
          if (prevTime[0] != msg.timeOfSend[0] || prevTime[1] != msg.timeOfSend[1]){
            console.log(msg.timeOfSend[0]+":"+msg.timeOfSend[1])
            var timeStamp = document.createElement("p")
            var timeStampDiv = document.createElement("div")
            timeStampDiv.id = "timeStampDiv"
            timeStamp.id = "timeStamp"
            timeStamp.textContent = (msg.timeOfSend[0]+":"+msg.timeOfSend[1])
            console.log("timeStamp generated - "+msg.timeOfSend)
            timeStampDiv.appendChild(timeStamp)
            divToAppendTo.appendChild(timeStampDiv)
          }
          if (!msg.senderuser == myUsername) {playNotification()}
          var message1 = document.createElement('p');
          prevTime[0] = msg.timeOfSend[0]
          prevTime[1] = msg.timeOfSend[1]
          var br = document.createElement("br")
          message1.innerHTML = ("User: "+msg.senderuser);
          message1.appendChild(br)
          message1.appendChild(document.createTextNode(msg.message))
          console.log("my username: "+myUsername)
          
          if (msg.senderuser == myUsername) {
            var myMessageDiv = document.createElement("div")
            myMessageDiv.id = "mymesdiv"
            message1.className = "myMessage"
            message1.textContent = (msg.message)
            myMessageDiv.appendChild(message1)
            divToAppendTo.appendChild(myMessageDiv);
          } else {
            divToAppendTo.appendChild(message1)
          }
          var scrollableDiv = document.querySelector('#chat'+msg.room);
          scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }




    socket.on('chatmessage', (msg) => {
        loadChatmessage(msg)
    })

    socket.on('newchatroom', (allchatrooms) => {
        loadtabs(allchatrooms)
    })

    activateIO()
})
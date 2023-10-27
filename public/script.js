document.addEventListener('DOMContentLoaded',  () => {

const knapp = document.getElementById('knapp')
const inputBruker = document.getElementById('input0')
const inputPassord = document.getElementById('input1')
const knapp1 = document.getElementById('brukerKnapp')
const logindiv = document.getElementById('logindiv')
const formdiv = document.getElementById('formDiv')
const loginField = document.getElementById('loginField')

var socket = io();

async function getMyUsername() {
    const username = await fetch('/sendUsername')
    .then(res => res.json())
    console.log(username)
}

function displayChat() {
    logindiv.style.display = "none"
    formdiv.style.display = "block"
    
}

function loginTest() {
    for (let i = 0; i < 2; i++){if (document.getElementById('input'+i).value == "") {return}}
    console.log(inputBruker.value)
    let username = inputBruker.value
    let password = inputPassord.value
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then (res => res.json())
    .then (data => {
        console.log(data.success)
        if (data.success == false) {loginField.innerHTML = "wrong username or password"; return}
            displayChat()
    })
}

fetch('/checkSession')
.then(res => res.json())
.then(data => {
    if (data == true) {
        displayChat()
        console.log("data true")
    }   else {console.log("data false")}
})

knapp.addEventListener('click', loginTest)
})

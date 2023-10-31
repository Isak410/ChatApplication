const inputBruker = document.getElementById('input0')
const inputPassord = document.getElementById('input1')
const knapp = document.getElementById('knapp')
const logindiv = document.getElementById('logindiv')
const loginField = document.getElementById('loginField')
const showcreateProfile = document.getElementById('showcreateProfile')

function login() {
    for (let i = 0; i < 2; i++){if (document.getElementById('input'+i).value == "") {return}}
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
        if (data.success == false) {
            loginField.innerHTML = "wrong username or password"; 
            return
        } else {
            window.location.href = '/showmessagepage'
        }
    })
}

showcreateProfile.addEventListener('click', () => {
    window.location.href = '/showcreateprofilepage'
})
knapp.addEventListener('click', login)
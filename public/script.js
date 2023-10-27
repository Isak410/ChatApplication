const knapp = document.getElementById('knapp')
const inputBruker = document.getElementById('input0')
const inputPassord = document.getElementById('input1')
const knapp1 = document.getElementById('brukerKnapp')

async function getMyUsername() {
    console.log("afkjlalkwjla")
    const username = await fetch('/sendUsername')
    .then(res => res.json())
    console.log(username)
    
}

async function loginTest() {
    for (let i = 0; i < 2; i++){if (document.getElementById('input'+i).value == "") {return}}
    console.log(inputBruker.value)
    let username = inputBruker.value
    let password = inputPassord.value
    var response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then (res => res.json())
    console.log(response)
}


knapp1.addEventListener('click', getMyUsername)
knapp.addEventListener('click', loginTest)
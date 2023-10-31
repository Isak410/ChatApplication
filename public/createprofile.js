const createuserButton = document.getElementById('createuserButton')
const createprofileh6 = document.getElementById('createProfileP')
const createprofileDiv = document.getElementById('createProfile')

async function createprofile() {
    if (document.getElementById('createuserUsername').value == "" || document.getElementById('createuserPassword').value == "") {
        createprofileh6.textContent = "All fields not filled"
        return;
    }
    fetch('/checkifusernametaken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username:document.getElementById('createuserUsername').value }),
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.usernametaken)
        if (data.usernametaken == true) {createprofileh6.textContent = "username taken";return}
        createprofileh6.textContent = ""
        fetch('/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username:document.getElementById('createuserUsername').value,
                password:document.getElementById('createuserPassword').value
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success == true) {
                window.location.href = '/showloginpage'
            }   else {
                console.error("createuserfeil")
            }
        })
    })
}

createuserButton.addEventListener('click', createprofile)
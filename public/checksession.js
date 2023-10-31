function checksession() {
    console.log('checking session')
    fetch('/checkSession')
    .then(res => res.json())
    .then(data => {
        if (data == true) {
            window.location.href = '/showmessagepage'
        }   else {
            console.log('no session active')
        }
    })
}

checksession()
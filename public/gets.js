const gets = {
    checkIfSessionActive: function() {
    fetch('/checkSession')
    .then(res => res.json())
    .then(data => {
        return data
        })
    },
    
}
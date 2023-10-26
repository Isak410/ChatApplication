const knapp = document.getElementById('knapp')
const inputBruker = document.getElementById('input0')
const inputPassord = document.getElementById('input1')


function loginTest() {
    for (let i = 0; i < 2; i++){if (document.getElementById('input'+i).value == "") {return}}

    
    console.log(inputBruker.value)
    console.log(inputPassord.value)
}



knapp.addEventListener('click', loginTest)
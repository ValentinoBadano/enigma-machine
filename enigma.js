class EnigmaMachine {
    constructor() {
        this.rotors = ['I', 'II', 'III'];
        this.reflector = 'B';
        this.plugboard = {};
        this.rotorPositions = [0, 0, 0];
        this.rotorMappings = {
            // configuración de la Enigma I 
            'I': 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
            'II': 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
            'III': 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
            'IV': 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
            'V': 'VZBRGITYUPSDNHLXAWMJQOFECK'
        };
        this.reflectorMappings = {
            'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT' ,
            'C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
        };
    }

    setPlugboard(settings) {
        // acepta una cadena de texto con pares de letras separadas por espacios
        this.plugboard = {};
        if (settings) {
            const pairs = settings.split(' ');
            pairs.forEach(pair => {
                const [a, b] = pair.toUpperCase().split(''); 
                this.plugboard[a] = b;
                this.plugboard[b] = a;
            });
        }
    }

    encrypt(letter) {
        let encryptedLetter = letter.toUpperCase();
        encryptedLetter = this.plugboard[encryptedLetter] || encryptedLetter;
        encryptedLetter = this.passThroughRotors(encryptedLetter, 'forward');
        encryptedLetter = this.reflect(encryptedLetter);
        encryptedLetter = this.passThroughRotors(encryptedLetter, 'backward');
        encryptedLetter = this.plugboard[encryptedLetter] || encryptedLetter;
        this.stepRotors();
        return encryptedLetter;
    }

    passThroughRotors(letter, direction) {
        let index = letter.charCodeAt(0) - 65;
        if (direction === 'forward') {
            for (let i = 0; i < this.rotors.length; i++) {
                index = (index + this.rotorPositions[i]) % 26;
                index = this.rotorMappings[this.rotors[i]].charCodeAt(index) - 65;
                index = (index - this.rotorPositions[i] + 26) % 26;
            }
        } else {
            for (let i = this.rotors.length - 1; i >= 0; i--) {
                index = (index + this.rotorPositions[i]) % 26;
                index = this.rotorMappings[this.rotors[i]].indexOf(String.fromCharCode(index + 65));
                index = (index - this.rotorPositions[i] + 26) % 26;
            }
        }
        return String.fromCharCode(index + 65);
    }

    reflect(letter) {
        const index = letter.charCodeAt(0) - 65;
        return this.reflectorMappings[this.reflector][index];
    }

    stepRotors() {
        this.rotorPositions[0] = (this.rotorPositions[0] + 1) % 26;
        if (this.rotorPositions[0] === 0) {
            this.rotorPositions[1] = (this.rotorPositions[1] + 1) % 26;
            if (this.rotorPositions[1] === 0) {
                this.rotorPositions[2] = (this.rotorPositions[2] + 1) % 26;
            }
        }
    }
}

document.addEventListener('keydown', function(event) {
    // when a key is pressed, check if it is a letter and if so, encrypt it
    const key = event.key.toUpperCase();
    if (/^[a-zA-Z]$/.test(key)) {
        pressKey(key);
        // Agregar la clase para la animación
        document.getElementById("key-" + key).classList.add('pressed');
        // Eliminar la clase después de 1 segundo
        setTimeout(function() {
            document.getElementById(`key-${key}`).classList.remove('pressed');
        }, 200);
    }
});


function addToinputText(char) {
    var inputTextElement = document.getElementById('input-text');
    var currentText = inputTextElement.value;
    currentText += char + " ";
    inputTextElement.value = currentText;
}

function addToOutputText(char) {
    var outputTextElement = document.getElementById('output-text');
    var currentText = outputTextElement.value;
    currentText += char + " ";
    outputTextElement.value = currentText;
}

function emptyText() {
    var outputTextElement = document.getElementById('output-text');
    outputTextElement.value = "";
    var inputTextElement = document.getElementById('input-text');
    inputTextElement.value = "";
}

const enigma = new EnigmaMachine();
emptyText();

function pressKey(key) {
    addToinputText(key)
    document.querySelectorAll('.lamp').forEach(lamp => {
        lamp.classList.remove('on');
    });

    const encryptedKey = enigma.encrypt(key);
    let lamp = document.getElementById('lamp-' + encryptedKey)
    lamp.classList.add('on');

    setTimeout(function() {
        lamp.classList.remove('on');
    }, 2000);
    addToOutputText(encryptedKey);
    updateRotorCharacters();

}

function updateRotorCharacters() {
    for (let rotorId = 1; rotorId <= 3; rotorId++) {
        const prev = document.getElementById('rotor' + rotorId + '-prev');
        const char = document.getElementById('rotor' + rotorId + '-char');
        const next = document.getElementById('rotor' + rotorId + '-next');
        // Set the next character
        prev.textContent = enigma.rotorMappings[enigma.rotors[rotorId - 1]][(enigma.rotorPositions[rotorId - 1] + 25) % 26];
        char.textContent = enigma.rotorMappings[enigma.rotors[rotorId - 1]][enigma.rotorPositions[rotorId - 1]];
        next.textContent = enigma.rotorMappings[enigma.rotors[rotorId - 1]][(enigma.rotorPositions[rotorId - 1] + 1) % 26];
    }
}

function changeRotorPosition(rotorId, direction) {
    enigma.rotorPositions[rotorId - 1] += direction;
    if (enigma.rotorPositions[rotorId - 1]) {
    enigma.rotorPositions[rotorId - 1] = (enigma.rotorPositions[rotorId - 1] + 26) % 26;
    }
    updateRotorCharacters();
}

let selectedPlugs = [];
let plugColor = Math.floor(Math.random()*16777215).toString(16);

function plug(p) {
    selectedPlugs.push(p);    
    selectedPlugs.forEach(plug => {
        plug.style.backgroundColor = '#' + plugColor;
    });
    if (selectedPlugs.length === 2) {
        plugColor = Math.floor(Math.random()*16777215).toString(16);
        const [first, second] = selectedPlugs;
        selectedPlugs = [];
        enigma.setPlugboard(`${first.innerText}${second.innerText}`);
        updateRotorCharacters();
    }
}


function changeRotor(number) {
    enigma.rotors[number - 1] = document.getElementById('rotor' + number + '-sel').value;
    updateRotorCharacters();
}

function changeReflector() {
    enigma.reflector = document.getElementById('reflector-sel').value;
    updateRotorCharacters();
}

function init() {
    changeRotor(1);
    changeRotor(2);
    changeRotor(3);
    changeReflector();
    updateRotorCharacters();
}

init();




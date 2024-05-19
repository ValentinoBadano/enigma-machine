class EnigmaMachine {
    constructor() {
        this.rotors = ['I', 'II', 'III'];
        this.reflector = 'B';
        this.plugboard = {};
        this.rotorPositions = [0, 0, 0];
        this.rotorMappings = {
            'I': 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
            'II': 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
            'III': 'BDFHJLCPRTXVZNYEIWGAKMUSQO'
        };
        this.reflectorMappings = {
            'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT'
        };
    }

    setPlugboard(settings) {
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
    const key = event.key.toUpperCase();
    if (/^[a-zA-Z]$/.test(key)) {
        pressKey(key);
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
    document.getElementById('lamp-' + encryptedKey).classList.add('on');
    addToOutputText(encryptedKey);
    updateRotorCharacters();
}


function updateRotorCharacters() {
    document.getElementById('rotor1-char').innerText = enigma.rotorMappings["I"][enigma.rotorPositions[0]];
    document.getElementById('rotor2-char').innerText = enigma.rotorMappings["II"][enigma.rotorPositions[1]];
    document.getElementById('rotor3-char').innerText = enigma.rotorMappings["III"][enigma.rotorPositions[2]];
}


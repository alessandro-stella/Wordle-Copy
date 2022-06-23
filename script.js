//Constants and variables
const allWords = await fetch("./dictionary.json")
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => console.log(error));

const validChars = [
    "q",
    "w",
    "e",
    "r",
    "t",
    "y",
    "u",
    "i",
    "o",
    "p",
    "a",
    "s",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "z",
    "x",
    "c",
    "v",
    "b",
    "n",
    "m",
    "enter",
    "backspace",
];

const randomWord = await generateRandomWord();
let currentWord = "";

let charCells = Array.from(document.getElementsByClassName("char-cell"));
let charCellsInner = Array.from(
    document.getElementsByClassName("char-cell__inner")
);

let cellContainers = [];
let outputRows = [];

for (let i = 0; i < 6; i++) {
    cellContainers.push(charCells.splice(0, 5));
    outputRows.push(charCellsInner.splice(0, 5));
}

let currentIndex = 0;
let lockEventListeners = false;
let won = false;

let allKeys = Array.from(document.getElementsByClassName("key"));

allKeys.forEach((singleKey) => {
    singleKey.addEventListener("click", (e) => {
        if (lockEventListeners === true) {
            return;
        }

        window.navigator.vibrate(15);

        let char = singleKey.innerHTML;

        if (validChars.indexOf(char) === -1) {
            checkChar(singleKey.classList[2]);
        } else {
            checkChar(char);
        }
    });
});

window.addEventListener("keydown", (e) => {
    if (e.repeat || lockEventListeners === true) {
        return;
    }

    checkChar(e.key.toLowerCase());
});

//Start of program

function randomIndex(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function generateRandomWord() {
    let i = randomIndex(0, allWords.length - 1);
    let j = randomIndex(0, allWords[i].length - 1);

    return allWords[i][j].toLowerCase();
}

function checkChar(char) {
    if (validChars.indexOf(char) === -1) {
        return;
    }

    switch (char) {
        case "backspace":
            currentWord = currentWord.slice(0, -1);

            for (let i = 0; i < 5; i++) {
                outputRows[currentIndex][i].getElementsByClassName(
                    "char-cell__front"
                )[0].innerHTML =
                    typeof currentWord[i] === "string" ? currentWord[i] : "";

                outputRows[currentIndex][i].getElementsByClassName(
                    "char-cell__back"
                )[0].innerHTML =
                    typeof currentWord[i] === "string" ? currentWord[i] : "";
            }

            cellContainers[currentIndex][currentWord.length].classList.remove(
                "filled"
            );
            break;

        case "enter":
            if (currentWord.length < 5) {
                break;
            }

            if (wordValidity()) {
                lockEventListeners = true;
                checkWord();

                setTimeout(() => {
                    currentWord = "";
                    currentIndex++;
                    lockEventListeners = false;

                    if (currentIndex === 6 && won === false) {
                        endGame("lose");
                    }
                }, 3100);
            } else {
                document.getElementsByClassName("alert")[0].innerHTML =
                    "Parola non valida!";

                setTimeout(() => {
                    document.getElementsByClassName("alert")[0].innerHTML = "";
                }, 2000);
            }

            break;

        default:
            if (currentWord.length < 5) {
                currentWord += char;
            }

            for (let i = 0; i < currentWord.length; i++) {
                outputRows[currentIndex][i].getElementsByClassName(
                    "char-cell__front"
                )[0].innerHTML = currentWord[i];
                outputRows[currentIndex][i].getElementsByClassName(
                    "char-cell__back"
                )[0].innerHTML = currentWord[i];

                cellContainers[currentIndex][i].classList.add("filled");
            }
            break;
    }
}

function wordValidity() {
    let validWord = false;

    allWords.forEach((singleLetterCluster) => {
        if (validWord === true) {
            return;
        }

        if (singleLetterCluster.indexOf(currentWord) !== -1) {
            validWord = true;
        }
    });

    return validWord;
}

function endGame(result) {
    document.getElementById("popup").classList.remove("hidden");
    document.getElementById("popup-word").innerHTML =
        "Parola: <span>" + randomWord + "</span>";

    if (result === "win") {
        document.getElementById("popup-message").innerHTML =
            "Complimenti, hai indovinato la parola misteriosa!";
    } else {
        document.getElementById("popup-message").innerHTML =
            "Ritenta, la prossima volta potresti anche indovinare!";
    }
}

function checkWord() {
    if (currentWord === randomWord) {
        won = true;

        setTimeout(() => {
            endGame("win");
        }, 3100);
    }

    currentWord = currentWord.split("");
    let currentWordForKey = [...currentWord];

    let workRandomWord = randomWord.split("");
    let classesToAdd = ["", "", "", "", ""];

    currentWord.forEach((singleLetter, index) => {
        if (singleLetter === randomWord[index]) {
            workRandomWord[index] = "";
            currentWord[index] = "";
            classesToAdd[index] = "match";
        }
    });

    currentWord.forEach((singleLetter, index) => {
        if (singleLetter === "") {
            return;
        }

        let letterIndex = workRandomWord.indexOf(singleLetter);

        if (letterIndex === -1) {
            return;
        }

        workRandomWord[letterIndex] = "";
        classesToAdd[index] = "found";
    });

    classesToAdd.forEach((singleClass, index) => {
        setTimeout(() => {
            cellContainers[currentIndex][index].classList.add(
                singleClass === "" ? "missed" : singleClass
            );

            let currentKey = document.getElementsByClassName(
                `key-${currentWordForKey[index]}`
            )[0];

            if (currentKey.classList[2] === "match") {
                return;
            }

            if (currentKey.classList[2] === "found") {
                if (singleClass !== "match") {
                    return;
                }
            }

            let possibleClasses = ["missed", "found", "match"];
            currentKey.classList.remove(...possibleClasses);

            currentKey.classList.add(
                singleClass === "" ? "missed" : singleClass
            );
        }, 500 * index);
    });
}

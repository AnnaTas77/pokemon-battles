const getAllPokemons = async () => {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");

    const pokemonsArray = await res.json();
    return pokemonsArray.results;
};

const numberOfGeneratedPokemons = 3;

let selectedPokemon = {};
let selectedPokemonMoves = [];
let selectedMove = {};
let enemyPokemon = {};
let enemyMovesArray = [];

const chooseYourPokemon = async () => {
    const pokemonsArray = await getAllPokemons();

    const chosenPokemons = [];

    for (i = 0; i < numberOfGeneratedPokemons; i++) {
        const randomNum = Math.floor(Math.random() * 150);
        chosenPokemons.push(pokemonsArray[randomNum]);
    }

    const imagesArray = chosenPokemons.map((pokemon) => {
        const pokemonName = pokemon.name;
        const capitalizedName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
        const pokemonImageUrl = getPokemonImage(pokemon.url);
        return { name: capitalizedName, url: pokemonImageUrl };
    });

    const pokemonChoices = document.getElementById("choices");

    const choicesWrapper = document.createElement("div");
    choicesWrapper.classList.add("choices-wrapper");

    const wrapperTitle = document.createElement("h3");
    wrapperTitle.classList.add("choices-title");
    wrapperTitle.innerText = "Select your Pokemon";

    const existingPokemons = pokemonChoices.querySelectorAll("div");
    const existingTitles = pokemonChoices.querySelectorAll("h3");

    if (existingPokemons.length > 0) {
        existingPokemons.forEach((div) => {
            div.remove();
        });
    }

    if (existingTitles.length > 0) {
        existingTitles.forEach((title) => {
            title.remove();
        });
    }

    imagesArray.forEach((obj) => {
        const pokemonButton = document.createElement("button");
        pokemonButton.classList.add("pokemon-card");

        const imageEl = document.createElement("img");
        const textEl = document.createElement("p");
        imageEl.src = obj.url;
        imageEl.alt = `Image of ${obj.name}`;
        textEl.innerText = obj.name;

        pokemonButton.appendChild(imageEl);
        pokemonButton.appendChild(textEl);
        pokemonButton.addEventListener("click", () => {
            selectedPokemon = obj;
            selectedPokemon.health = 100;
            getEnemyPokemon();
            displaySelectedPokemon();
        });
        choicesWrapper.appendChild(pokemonButton);
    });

    pokemonChoices.appendChild(wrapperTitle);
    pokemonChoices.appendChild(choicesWrapper);
};

const getPokemonImage = (pokemonUrl) => {
    const numberRegEx = /(\d+)\/$/;
    const number = pokemonUrl.match(numberRegEx)[1];

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${number}.png`;
};

const getEnemyPokemon = async () => {
    const pokemonsArray = await getAllPokemons();
    const randomNum = Math.floor(Math.random() * 150);
    const chosenPokemon = pokemonsArray[randomNum];

    const pokemonName = chosenPokemon.name;
    const pokemonImageUrl = getPokemonImage(chosenPokemon.url);

    enemyPokemon = { name: pokemonName, url: pokemonImageUrl, health: 100 };

    const chosenEnemy = document.getElementById("enemy-pokemon");

    const existingDivs = chosenEnemy.querySelectorAll("div");

    if (existingDivs.length > 0) {
        existingDivs.forEach((div) => {
            div.remove();
        });
    }

    const enemyCard = document.createElement("div");
    enemyCard.classList.add("enemy-card");

    const enemyInfo = document.createElement("div");
    enemyInfo.classList.add("enemy-info");

    const cardTitle = document.createElement("h3");
    const healthScore = document.createElement("p");

    const imageEl = document.createElement("img");
    const textEl = document.createElement("p");
    imageEl.src = enemyPokemon.url;
    imageEl.alt = `Image of ${enemyPokemon.name}`;
    textEl.innerText = enemyPokemon.name;
    healthScore.classList.add("enemy-health-score");
    healthScore.innerText = `Health: ${enemyPokemon.health}/100`;
    cardTitle.innerText = "Enemy Pokemon";

    enemyInfo.appendChild(cardTitle);
    enemyInfo.appendChild(healthScore);
    enemyInfo.appendChild(imageEl);
    enemyInfo.appendChild(textEl);
    chosenEnemy.appendChild(enemyInfo);

    getEnemyMoves(pokemonImageUrl, createEnemyUI);
};

const displaySelectedPokemon = () => {
    const pokemonsToSelect = document.getElementById("pokemon-container");
    pokemonsToSelect.remove();

    const selectedPokemonCard = document.getElementById("selected-pokemon");
    const mainContainer = document.querySelector("main");

    const divEl = document.createElement("div");
    divEl.classList.add("selected-pokemon-card");

    const innerDiv = document.createElement("div");
    innerDiv.classList.add("pokemon-info");

    const cardTitle = document.createElement("h3");
    const healthScore = document.createElement("p");
    const imageEl = document.createElement("img");
    const textEl = document.createElement("p");
    const fightButton = document.createElement("button");
    const resetButton = document.createElement("button");

    fightButton.classList.add("fight-btn");
    fightButton.innerText = "Fight!";

    const boxingGlovesImg = document.createElement("img");
    boxingGlovesImg.classList.add("boxing-gloves-img");
    boxingGlovesImg.src = "./images/boxing-gloves.png";
    boxingGlovesImg.alt = "boxing gloves";

    fightButton.appendChild(boxingGlovesImg);

    resetButton.classList.add("reset-btn");
    resetButton.innerText = "Restart the Game";

    const resetImg = document.createElement("img");
    resetImg.classList.add("reset-img");
    resetImg.src = "./images/refresh.png";
    resetImg.alt = "refresh icon";

    resetButton.appendChild(resetImg);

    resetButton.addEventListener("click", () => {
        location.reload();
    });

    fightButton.addEventListener("click", () => {
        pokemonFight();
    });

    cardTitle.innerText = "Your Pokemon";
    healthScore.classList.add("pokemon-health-score");
    healthScore.innerText = `Health: ${selectedPokemon.health}/100`;
    imageEl.src = selectedPokemon.url;
    imageEl.alt = `Image of ${selectedPokemon.name}`;
    textEl.innerText = selectedPokemon.name;

    innerDiv.appendChild(cardTitle);
    innerDiv.appendChild(healthScore);
    innerDiv.appendChild(imageEl);
    innerDiv.appendChild(textEl);
    divEl.appendChild(innerDiv);
    selectedPokemonCard.appendChild(divEl);
    mainContainer.appendChild(fightButton);
    mainContainer.appendChild(resetButton);
    fetchNewPokemonMoves(selectedPokemon.url, createMovesButtons);
};

const fetchNewPokemonMoves = async (urlString, onDisplayMoves) => {
    const numberRegEx = /\d+/;
    const number = urlString.match(numberRegEx);

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number[0]}/`);

    const statsObject = await response.json();

    const movesArray = statsObject.moves;

    const randomMovesArray = [];

    for (i = 0; i < 3; i++) {
        const randomNum = Math.floor(Math.random() * movesArray.length);
        const moveName = movesArray[randomNum].move.name;

        const min = 10;
        const max = 25;
        let damagePoints = Math.floor(Math.random() * (max - min + 1)) + min;

        if (moveName === "protect" || moveName === "rest") {
            damagePoints = 0;
        }

        randomMovesArray.push({ moveName: moveName, damagePoints: damagePoints });
    }

    selectedPokemonMoves = randomMovesArray;

    onDisplayMoves(selectedPokemonMoves);
};

const createMovesButtons = (movesArray) => {
    const movesContainer = document.createElement("div");
    movesContainer.classList.add("moves-container");
    const title = document.createElement("h3");
    title.innerText = "Select a Move";

    movesContainer.appendChild(title);

    movesArray.forEach((move, index) => {
        const moveButton = document.createElement("button");
        moveButton.classList.add("move-btn", "pulse");
        moveButton.innerText = move.moveName;
        movesContainer.appendChild(moveButton);

        moveButton.addEventListener("click", () => {
            const moveForButton = selectedPokemonMoves[index];
            selectMove(moveForButton);
            moveButton.classList.remove("pulse");
            moveButton.classList.add("active");
        });
    });

    const selectedPokemonCard = document.querySelector(".selected-pokemon-card");
    selectedPokemonCard.appendChild(movesContainer);
};

const updateMoveButtons = (movesArray) => {
    const moveButtonsArray = document.querySelectorAll(".move-btn");

    movesArray.forEach((move, index) => {
        const moveButton = moveButtonsArray[index];
        moveButton.innerText = move.moveName;
        moveButton.classList.remove("active");
        moveButton.classList.add("pulse");
    });
};

const selectMove = (move) => {
    const allMoveButtons = document.querySelectorAll(".move-btn");

    allMoveButtons.forEach((otherMoveButton) => {
        otherMoveButton.classList.remove("active");
        otherMoveButton.classList.add("pulse");
    });

    selectedMove = move;
};

const getEnemyMoves = async (enemyUrl, onEnemyMoves) => {
    const numberRegEx = /\d+/;
    const number = enemyUrl.match(numberRegEx);

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number[0]}/`);

    const dataObject = await response.json();

    const movesArray = dataObject.moves;

    const randomNum = Math.floor(Math.random() * movesArray.length);
    const moveName = movesArray[randomNum].move.name;

    const min = 10;
    const max = 25;
    let damagePoints = Math.floor(Math.random() * (max - min + 1)) + min;

    if (moveName === "protect" || moveName === "rest") {
        damagePoints = 0;
    }

    enemyMovesArray.push({ moveName: moveName, damagePoints: damagePoints });

    onEnemyMoves(moveName);
};

const createEnemyUI = (moveName) => {
    const enemyPokemon = document.getElementById("enemy-pokemon");
    const enemyPokemonCard = document.createElement("div");
    enemyPokemonCard.classList.add("enemy-pokemon-card");
    const enemyInfo = document.querySelector(".enemy-info");

    const moveBox = document.createElement("div");
    moveBox.classList.add("move-box");

    const moveInfo = document.createElement("div");
    moveInfo.classList.add("enemy-move-info");

    const cardTitle = document.createElement("h3");
    const enemyMoveName = document.createElement("p");
    enemyMoveName.id = "enemy-move-name";
    const moveImage = document.createElement("img");
    moveImage.classList.add("enemy-move-img");

    moveImage.src = "./images/enemy.png";
    moveImage.alt = "skull on fire";

    cardTitle.innerText = "Your Enemy's Move";
    enemyMoveName.innerText = moveName;

    const currentEnemyMove = enemyPokemon.querySelectorAll(".enemy-move-info");

    if (currentEnemyMove.length > 0) {
        currentEnemyMove.forEach((move) => {
            move.remove();
        });
    }

    enemyPokemonCard.appendChild(enemyInfo);
    moveInfo.appendChild(cardTitle);
    moveInfo.appendChild(moveBox);
    moveBox.appendChild(enemyMoveName);
    moveBox.appendChild(moveImage);
    enemyPokemonCard.appendChild(moveInfo);
    enemyPokemon.appendChild(enemyPokemonCard);
};

const updateEnemyUI = (moveName) => {
    const enemyMoveNameLabel = document.getElementById("enemy-move-name");
    enemyMoveNameLabel.innerText = moveName;
};

const pokemonFight = () => {
    if (Object.keys(selectedMove).length !== 0) {
        selectedPokemon.health -= enemyMovesArray[0].damagePoints;
        enemyPokemon.health = enemyPokemon.health - selectedMove.damagePoints;

        const updatedPokemonHealth = document.querySelector(".pokemon-health-score");

        updatedPokemonHealth.innerText = `Health: ${selectedPokemon.health}/100`;

        const updatedEnemyHealth = document.querySelector(".enemy-health-score");

        updatedEnemyHealth.innerText = `Health: ${enemyPokemon.health}/100`;

        if (selectedPokemon.health < 30) {
            updatedPokemonHealth.style.color = "red";
        }

        if (enemyPokemon.health < 30) {
            updatedEnemyHealth.style.color = "red";
        }

        const resetBtn = document.querySelector(".reset-btn");

        if (enemyPokemon.health <= 0) {
            alert("Your Enemy has fainted! You won the battle!");
            document.querySelector(".fight-btn").disabled = true;

            updatedEnemyHealth.innerText = `Health: 0/100`;
            const moveButtonsArray = document.querySelectorAll(".move-btn");
            moveButtonsArray.forEach((btn) => {
                btn.disabled = true;
            });

            resetBtn.classList.add("pulse-reset");

            return;
        }

        if (selectedPokemon.health <= 0) {
            alert("Your Pokemon has fainted! You've been defeated!");
            document.querySelector(".fight-btn").disabled = true;

            updatedPokemonHealth.innerText = `Health: 0/100`;

            const moveButtonsArray = document.querySelectorAll(".move-btn");
            moveButtonsArray.forEach((btn) => {
                btn.disabled = true;
            });

            resetBtn.classList.add("pulse-reset");
            console.log(resetBtn);
        }
    } else {
        alert("Please select a move for your Pokemon.");
    }

    // if (document.querySelector(".fight-btn").disabled) {
    //     resetButton.classList.add("pulse");
    // } else {
    //     resetButton.classList.remove("pulse");
    // }

    resetAttackMoves();
};

const resetAttackMoves = () => {
    enemyMovesArray = [];
    selectedMove = {};
    selectedPokemonMoves = [];

    fetchNewPokemonMoves(selectedPokemon.url, updateMoveButtons);
    getEnemyMoves(enemyPokemon.url, updateEnemyUI);
};

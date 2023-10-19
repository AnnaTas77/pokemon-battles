const getAllPokemons = async () => {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");

    const pokemonsArray = await res.json();
    return pokemonsArray.results;
};

const pokemonSelectedbyUser = [];

const choose4Pokemons = async () => {
    const pokemonsArray = await getAllPokemons();

    const chosenPokemons = [];

    for (i = 0; i < 3; i++) {
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

    const existingPokemons = pokemonChoices.querySelectorAll("button");

    if (existingPokemons.length > 0) {
        existingPokemons.forEach((button) => {
            button.remove();
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
            if (pokemonSelectedbyUser.length > 0) {
                pokemonSelectedbyUser.pop();
            }
            pokemonSelectedbyUser.push(obj);

            getEnemyPokemon();

            displaySelectedPokemon(pokemonSelectedbyUser);
        });
        pokemonChoices.appendChild(pokemonButton);
    });
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

    const enemyPokemon = { name: pokemonName, url: pokemonImageUrl };

    const chosenEnemy = document.getElementById("enemy-pokemon");

    const existingDivs = chosenEnemy.querySelectorAll("div");

    if (existingDivs.length > 0) {
        existingDivs.forEach((div) => {
            div.remove();
        });
    }

    const divEl = document.createElement("div");
    divEl.classList.add("enemy-card");

    const imageEl = document.createElement("img");
    const textEl = document.createElement("p");
    const cardTitle = document.createElement("h3");
    imageEl.src = enemyPokemon.url;
    imageEl.alt = `Image of ${enemyPokemon.name}`;
    textEl.innerText = enemyPokemon.name;
    cardTitle.innerText = "Enemy Pokemon";

    divEl.appendChild(cardTitle);
    divEl.appendChild(imageEl);
    divEl.appendChild(textEl);
    chosenEnemy.appendChild(divEl);

    getEnemyMoves(pokemonImageUrl);

    return enemyPokemon;
};

const displaySelectedPokemon = (usersPokemon) => {
    const pokemonsToSelect = document.getElementById("pokemon-container");
    pokemonsToSelect.remove();

    const selectedPokemonCard = document.getElementById("selected-pokemon");
    const mainContainer = document.querySelector("main");

    const divEl = document.createElement("div");
    divEl.classList.add("selected-pokemon-card");

    const innerDiv = document.createElement("div");
    innerDiv.classList.add("pokemon-info");

    const imageEl = document.createElement("img");
    const textEl = document.createElement("p");
    const cardTitle = document.createElement("h3");
    const fightButton = document.createElement("button");
    fightButton.classList.add("fight-btn");
    fightButton.innerText = "Fight!";

    imageEl.src = usersPokemon[0].url;
    imageEl.alt = `Image of ${usersPokemon[0].name}`;
    textEl.innerText = usersPokemon[0].name;
    cardTitle.innerText = "Your Pokemon";

    innerDiv.appendChild(cardTitle);
    innerDiv.appendChild(imageEl);
    innerDiv.appendChild(textEl);
    divEl.appendChild(innerDiv);
    selectedPokemonCard.appendChild(divEl);
    mainContainer.appendChild(fightButton);
    getPokemonMoves(usersPokemon[0].url);
};

const getPokemonMoves = async (urlString) => {
    const numberRegEx = /\d+/;
    const number = urlString.match(numberRegEx);

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number[0]}/`);

    const statsObject = await response.json();

    const movesArray = statsObject.moves;

    const randomMovesArray = [];

    for (i = 0; i < 3; i++) {
        const randomNum = Math.floor(Math.random() * movesArray.length);
        const moveName = movesArray[randomNum].move.name;

        const min = 0;
        const max = 25;
        const damagePoints = Math.floor(Math.random() * (max - min + 1)) + min;

        if (moveName === "protect" || moveName === "rest") {
            damagePoints = 0;
        }

        randomMovesArray.push({ moveName: moveName, damagePoints: damagePoints });
    }

    const movesContainer = document.createElement("div");
    movesContainer.classList.add("moves-container");
    const title = document.createElement("h3");
    title.innerText = "Choose a Move";

    movesContainer.appendChild(title);

    randomMovesArray.forEach((move) => {
        const moveButton = document.createElement("button");
        moveButton.innerText = move.moveName;
        movesContainer.appendChild(moveButton);
    });

    const selectedPokemonCard = document.querySelector(".selected-pokemon-card");
    selectedPokemonCard.appendChild(movesContainer);

    console.log("randomMovesArray", randomMovesArray);
    return randomMovesArray[0];
};

const getEnemyMoves = async (enemyUrl) => {
    const numberRegEx = /\d+/;
    const number = enemyUrl.match(numberRegEx);

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number[0]}/`);

    const statsObject = await response.json();

    const movesArray = statsObject.moves;

    const enemyMovesArray = [];

    const randomNum = Math.floor(Math.random() * movesArray.length);
    const moveName = movesArray[randomNum].move.name;

    const min = 0;
    const max = 25;
    const damagePoints = Math.floor(Math.random() * (max - min + 1)) + min;

    if (moveName === "protect" || moveName === "rest") {
        damagePoints = 0;
    }

    enemyMovesArray.push({ moveName: moveName, damagePoints: damagePoints });

    console.log("enemyMovesArray", enemyMovesArray);
    return enemyMovesArray;
};

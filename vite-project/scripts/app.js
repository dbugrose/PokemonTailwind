//-------------------get elements--------------------------//
const userInput = document.getElementById("userInput");
const EnterBtn = document.getElementById("EnterBtn");
const FavoriteBtn = document.getElementById("favoriteBtn");
const ShinyBtn = document.getElementById("shinyBtn");
const MainImg = document.getElementById("mainImg");
const Type = document.getElementById("type");
const Form = document.getElementById("form");
const Abilities = document.getElementById("abilities");
const Locations = document.getElementById("locations");
const Moves = document.getElementById("moves");
const EvolutionBox = document.getElementById("evolutionBox");
const PokemonName = document.getElementById("pokemonName");
const PokedexNumber = document.getElementById("pokedexNumber");
const FavoritesBox = document.getElementById("favoritesBox");

//-------------------declare variables--------------------------//

let pokeSpan;
let favoritePokemonList;
let searchingFromFavorites = false;
let searchingForPics = false;
let favoritePokemon = "pikachu";
let data;
let locations;
let pokemon = "pikachu";
let isShiny = false;
let startShiny = false;
let isFavorited = false;
favoritePokemonList = [];
let favSpan;
let EvoUrl;
let evolutionNames = [];
let evolution;
let evolutionName;
let index;
let outerListenerActive = true;
let rnd = false;
let response;
//-------------------main fetch function start --------------------------//

async function GetAPI(pokemon) {

    if (!searchingFromFavorites && !searchingForPics && !rnd) { pokemon = userInput.value; }
    if (favoritePokemonList.includes(pokemon)) { isFavorited = true }
    else { isFavorited = false }
    favoritesCheck();
    if (rnd == true) { pokemon = (Math.floor(Math.random() * 650)).toString(); }
    response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
    data = await response.json();
    console.log(data);
}
//-------------------main fetch function end--------------------------//

//-------------------capitalize function start--------------------------//

function capitalize(pokemon) {
    return String(pokemon).charAt(0).toUpperCase() + String(pokemon).slice(1);
}
//-------------------capitalize function end--------------------------//


//-------------------update Pokemon function start--------------------------//

async function updatePokemon(pokemon) {
    if (!searchingFromFavorites && !searchingForPics) { pokemon = userInput.value; }
    if (favoritePokemonList.includes(userInput.value)) { isFavorited = true }
    else { isFavorited = false }
    await GetAPI(pokemon);
    favoritesCheck();
    startShiny = null;
    //abilities update
    Abilities.textContent = "";
    let abilitiesList = [];
    for (let i = 0; i < data.abilities.length; i++) {
        abilitiesList.push(data.abilities[i].ability.name);
    }
    abilitiesList = abilitiesList.join(", ");
    Abilities.textContent = abilitiesList;


    //name update
    PokemonName.textContent = capitalize(data.name);


    // image update
    MainImg.src = data.sprites.other["official-artwork"].front_default;
    MainImg.alt = `${capitalize(userInput.value)}`


    // pokedex number update
    PokedexNumber.textContent = `#${data.id}`;


    // type update
    let typesList = [];
    for (let i = 0; i < data.types.length; i++) {
        typesList.push(data.types[i].type.name);
    }
    typesList = typesList.join(" + ");
    Type.textContent = capitalize(typesList);

    //moves update
    let movesList = [];
    for (let i = 0; i < data.moves.length; i++) {
        movesList.push(data.moves[i].move.name);
    }
    movesList = movesList.join(", ");
    Moves.textContent = movesList;


    //fetch and update locations
    GetLocations();


    //get evolution line

    FetchEvolutions();

    //reset input
    userInput.value = "";
}

//-------------------update Pokemon function end--------------------------//

//-------------------get locations function start--------------------------//
async function GetLocations() {
    response = await fetch(`${data.location_area_encounters}`)
    locations = await response.json();
    let locationsList = [];
    if (locations.length === 0) {
        Locations.textContent = "N/A";
    }
    else {
        for (let i = 0; i < locations.length; i++) { locationsList.push(locations[i].location_area.name); }
        locationsList = locationsList.join(", ");
        Locations.textContent = locationsList;
    }
}

//-------------------get locations function end--------------------------//

//-------------------get evolutions function start--------------------------//
async function FetchEvolutionsUrl() {
    response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`);
    console.log(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`)
    let evo = await response.json();
    EvoUrl = evo.evolution_chain.url;
}
async function FetchEvolutions() {
    await FetchEvolutionsUrl();
    response = await fetch(EvoUrl);
    let evo2 = await response.json();
    let evolutionNames = [];
    evolutionNames.push(evo2.chain.species.name)

    for (let i = 0; i < evo2.chain.evolves_to.length; i++) {        
        {
            evolutionNames.push(evo2.chain.evolves_to[i].species.name);
            for (let j = 0; j < evo2.chain.evolves_to[i].evolves_to.length; j++) {
                {
                    evolutionNames.push(evo2.chain.evolves_to[i].evolves_to[j].species.name)
                }
            }
        }

    }
    if (evolutionNames.length<2)
    {EvolutionBox.textContent = "N/A"}
    else {FetchEvolutionsPics(evolutionNames);}
}

//-------------------picture fetch function start --------------------------//

function FetchEvolutionsPics(evolutionNames) {
    EvolutionBox.innerHTML = "";
    evolutionNames.forEach((evolutionName) => {
        searchingForPics = true;
        GetAPIPictures(evolutionName);
    })
}

async function GetAPIPictures(evolutionName) {
    response = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionName}`)
    let evodata = await response.json();
    const EvoImage = document.createElement("img");
    EvoImage.src = evodata.sprites.other["official-artwork"].front_default;
    EvoImage.classList = "place-self-center";
    EvolutionBox.appendChild(EvoImage);
}
//-------------------picture fetch function end--------------------------//

//-------------------get evolutions function end--------------------------//

//---------------favorites setup start --------------------//
function getLocalStorage() {
    favoritePokemon = localStorage.getItem("Favorite Pokemon");

    if (favoritePokemon === null) { return [] };
    return JSON.parse(favoritePokemon);
}

function saveToStorage(favoritePokemon) {
    favoritePokemonList = getLocalStorage();
    if (!favoritePokemonList.includes(favoritePokemon)) {
        favoritePokemonList.push(favoritePokemon);
    }
    localStorage.setItem("Favorite Pokemon", JSON.stringify(favoritePokemonList))
}

function removeFromStorage(index) {
    let favoritePokemonList = getLocalStorage();
    favoritePokemonList.splice(index, 1);
    localStorage.setItem("Favorite Pokemon", JSON.stringify(favoritePokemonList));
}

function DisplayList() {
    if (rnd == true) {
    pokemon = PokemonName.textContent;
    }
    favoritePokemonList = getLocalStorage();
    FavoritesBox.innerHTML = "";
    favoritePokemonList.forEach((pokemon, index) => {
        favSpan = document.createElement("span");
        favSpan.className = "px-1 favSpan";
        favSpan.textContent = pokemon;
        favoritePokemon = favSpan.textContent;
        favSpan.addEventListener("click", (event) => {
            if (outerListenerActive) {
                searchingFromFavorites = true;
                isFavorited = true;
                GetAPI(pokemon);
                updatePokemon(pokemon);
            }
        })

        const deleteBtn = document.createElement("img");
        deleteBtn.src = "/assets/star filled.png";
        deleteBtn.classList = "px-1 w-5 inline-block";
        deleteBtn.addEventListener("click", (event) => {
            isFavorited = false;
            favoritesCheck();
            removeFromStorage(index);
            DisplayList();
            outerListenerActive = false;
        })

        favSpan.appendChild(deleteBtn);
        FavoritesBox.appendChild(favSpan);
    })
rnd = false;
}




FavoriteBtn.addEventListener("click", () => {
    favoritesToggle();
    DisplayList();


}
)

function favoritesCheck() {
    if
        (isFavorited == true) {
        FavoriteBtn.src = "/assets/star filled.png";
        console.log("favoritescheck is making this star filled")
    }
    else {
        FavoriteBtn.src = "/assets/star.png";
        console.log("favoritescheck is making this star empty")
    }
}

function favoritesToggle() {
    if (!isFavorited) {
        getLocalStorage();
        saveToStorage(PokemonName.textContent.toLowerCase());
        FavoriteBtn.src = "/assets/star filled.png";
        console.log("favoritestoggle is making this star filled")

    }
    else {
        FavoriteBtn.src = "/assets/star.png";
        removeFromStorage(index);
        favSpan.remove();
        console.log("favoritestoggle is making this star empty")

    }
    isFavorited = !isFavorited;
}

//---------------favorites setup end --------------------//

RandomizeBtn.addEventListener("click", () => {
    rnd = true;
    searchingFromFavorites = false;
    console.log(pokemon);
    favoritesCheck();
    updatePokemon(pokemon);
    DisplayList();
})

userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        if (!parseInt(userInput.value) || (parseInt(userInput.value) && parseInt(userInput.value) <= 649)) {
            searchingFromFavorites = false;
            pokemon = userInput.value;
            favoritesCheck();
            updatePokemon(pokemon);
            DisplayList();
        }
        else {
            alert("Please only enter a pokedex number between 1 and 649.")
        }
    }
})

EnterBtn.addEventListener("click", () => {
    if (!parseInt(userInput.value) || (parseInt(userInput.value) && parseInt(userInput.value) <= 649)) {
        searchingFromFavorites = false;
        pokemon = userInput.value;
        favoritesCheck();
        updatePokemon(pokemon);
        DisplayList();
    }
    else {
        alert("Please only enter a pokedex number between 1 and 649.")
    }
})


ShinyBtn.addEventListener("click", () => {
    if (!(startShiny == null)) {
        if (!startShiny) { 
            Form.textContent = "Shiny Form";
            MainImg.src = "/assets/pikachushiny.png"; 
           
         }
        else if (startShiny) { MainImg.src = "/assets/pikachu.png"; 
            Form.textContent = "Default Form";
        }
        startShiny = !startShiny;

    }
    else {
        if (isShiny) { MainImg.src = data.sprites.other["official-artwork"].front_default; 
                        Form.textContent = "Default Form";

        }
        else { MainImg.src = data.sprites.other["official-artwork"].front_shiny;
                        Form.textContent = "Shiny Form";

         }
        isShiny = !isShiny;
    }
})

//-------------------event listeners end--------------------------//
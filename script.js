// Use the API_URL variable to make fetch requests to the API.
// Replace the placeholder with your cohort name (ex: 2109-UNF-HY-WEB-PT)
const cohortName = "2501-ftb-et-web-pt";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
	try {
		const res = await fetch(`${API_URL}/players`);
		const data = await res.json();
		return data.data.players;
	} catch (err) {
		console.error("Uh oh, trouble fetching players!", err);
	}
};

/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
	try {
		const res = await fetch(`${API_URL}/players/${playerId}`);
		const data = await res.json();
		return data.data.player;
	} catch (err) {
		console.error(`Oh no, trouble fetching player #${playerId}!`, err);
	}
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
	try {
		const res = await fetch(`${API_URL}/players`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: `${playerObj.name}`,
				breed: `${playerObj.breed}`,
				status: `${playerObj.status}`,
				imageUrl: `${playerObj.imageUrl}`,
				teamId: `${playerObj.teamId}`,
			}),
		});

		const players = await fetchAllPlayers();
	  renderAllPlayers(players);
	} catch (err) {
		console.error("Oops, something went wrong with adding that player!", err);
	}
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
	try {
		await fetch(`${API_URL}/players/${playerId}`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
		});

		const players = await fetchAllPlayers();
	  renderAllPlayers(players);
	} catch (err) {
		console.error(
			`Whoops, trouble removing player #${playerId} from the roster!`,
			err
		);
	}
};

const form = document.querySelector("#new-player-form");
const main = document.querySelector("main");

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
	main.replaceChildren();

  playerList.forEach((player) => {
		const card = document.createElement("div");
		card.classList.add("card");
		card.innerHTML = `
    <h2>${player.name}</h2>
    <p>Player ID: ${player.id}</p>
    <img src="${player.imageUrl}" alt="${player.name}">
    <button class="getDetails" id=${player.id}>Get Details</button>
    <button class="removePlayer" id=${player.id}>Remove from Roster</button>
    `;
		main.appendChild(card);
	});

	document.querySelectorAll(".getDetails").forEach((button) => {
		button.addEventListener("click", (e) => {
			renderSinglePlayer(e.target.id);
		});
	});

	document.querySelectorAll(".removePlayer").forEach((button) => {
		button.addEventListener("click", (e) => {
			removePlayer(e.target.id);
		});
	});
};

/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = async (playerId) => {
  const player = await fetchSinglePlayer(playerId);
  const card = document.createElement("div");
	card.classList.add("card", "single");

  let teamName = "None";
  if(player.teamId === 4943){
    teamName = "Fluff";
  }else if(player.teamId === 4942){
    teamName = "Ruff";
  };

  let status = "None";
  if(player.status === "field"){
    status = "Field";
  }else if(player.status === "bench"){
    status = "Bench";
  };

	card.innerHTML = `
      <img src="${player.imageUrl}" alt="${player.name}">
      <h1>Name: ${player.name}</h1>
      <p>Player ID: ${player.id}</p>
      <p>Breed: ${player.breed}</p>
      <p>Team: ${teamName}</p>
      <p>Status: ${status}</p>
      <button class="getDetails" id="goBack"> Back to All Players </button>
    `;
	main.replaceChildren(card);

	const goBackButton = document.querySelector("#goBack")
  goBackButton.addEventListener("click", async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players)});
};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = async (newPlayer) => {
	form.innerHTML = `
    <h1 id="title">Welcome to the 2025 Puppy Bowl!</h1>
    <p>Add a new player to the roster:</p>
    <input id="playerName" placeholder="Player Name" name="playerName" type="text" required/>
    <input id="playerBreed" placeholder="Player Breed" name="playerBreed" type="text" required/>
    <input id="playerImageUrl" placeholder="Player Image" name="playerImageUrl" type="url"/>
    <select name="status" id="status">
    <option value="bench">Bench</option>
    <option value="field">Field</option>
    </select>
    <select name="team" id="team">
    <option value="4943">Fluff</option>
    <option value="4942">Ruff</option>
    <option value=null>No Team</option>
    </select>
    <button type="submit">Add New Player</button>`;

	form.addEventListener("submit", async (player) => {
		player.preventDefault();
		const nameInput = document.getElementById("playerName").value;
		const breedInput = document.getElementById("playerBreed").value;
		const imageInput = document.getElementById("playerImageUrl").value;
		const statusInput = document.getElementById("status").value;
		const teamInput = Number(document.getElementById("team").value);
		newPlayer = {
			name: nameInput,
			breed: breedInput,
			status: statusInput,
			imageUrl: imageInput,
			teamId: teamInput,
		};
    try {
      const res = await fetch(`${API_URL}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${newPlayer.name}`,
          breed: `${newPlayer.breed}`,
          status: `${newPlayer.status}`,
          imageUrl: `${newPlayer.imageUrl}`,
          teamId: newPlayer.teamId,
        }),
      });
  
      const players = await fetchAllPlayers();
	    renderAllPlayers(players);
    } catch (err) {
      console.error("Uh oh, trouble rendering the new player form!", err);
    }
	});
};

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
	const players = await fetchAllPlayers();
	renderAllPlayers(players);

	renderNewPlayerForm();
};

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
if (typeof window === "undefined") {
	module.exports = {
		fetchAllPlayers,
		fetchSinglePlayer,
		addNewPlayer,
		removePlayer,
		renderAllPlayers,
		renderSinglePlayer,
		renderNewPlayerForm,
	};
} else {
	init();
}

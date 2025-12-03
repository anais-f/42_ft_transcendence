
import { LoginPage } from "./pages/login.js"
import { HomePage } from "./pages/home.js"
import { GamePage } from "./pages/game.js"
import { LobbyPage } from "./pages/lobby.js"

document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content');
	if (!contentDiv) {
		console.error('Missing #content in index.html');
		return;
	}

	// Date of the day
	const dateDiv = document.getElementById('date');
	if (dateDiv)
	{
		dateDiv.textContent = new Date().toLocaleDateString('en-EN', {
			weekday:'long',
			day: 'numeric',
			month:'short',
			year:'numeric',

		})

	}

	const content: HTMLElement = contentDiv;

	content.innerHTML = HomePage();
})

document.addEventListener('statechange', () => {
	const contentDiv = document.getElementById('content');

	if (!contentDiv) {
		console.error('Missing #content in index.html');
		return;
	}
	const content: HTMLElement = contentDiv;
	console.log('State changed, rendering game page');
	content.innerHTML = GamePage();
})


import '../style.css'
import { LoginPage } from "./pages/old_pages/old_login.js"
import { HomePage } from "./pages/old_pages/old_home.js"
import { GamePage } from "./pages/old_pages/old_game.js"
import { LobbyPage } from "./pages/old_pages/old_lobby.js"

document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content');

	if (!contentDiv) {
		console.error('Missing #content in index.html');
		return;
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


import { HomePage } from "./pages/home.js"
import { GamePage } from "./pages/game.js"
import { LobbyPage } from "./pages/lobby.js"
import { bindRegisterForm, LoginPage } from "./pages/login.js"
import { ProfilePage } from "./pages/profile.js"
import { SettingsPage } from "./pages/settings.js"

type Pages = 'home' | 'game' | 'lobby' | 'login' | 'profile' | 'settings'

type Route = {
	id: string,
	url: string,
	page: () => string
	binds?: Array<() => void>
}

const router: Record<Pages,Route> = {
	home: {
		id: 'home',
		url: '/',
		page: HomePage
	},
	
	game: {
		id: 'game',
		url: '/game',
		page: GamePage
	},

	lobby: {
		id: 'lobby',
		url: '/lobby',
		page: LobbyPage
	},

	login: {
		id: 'login',
		url: '/login',
		page: LoginPage,
		binds: [bindRegisterForm]

	},

	profile: {
		id: 'profile',
		url: '/profile',
		page: ProfilePage
	},

	settings: {
		id: 'settings',
		url: '/settings',
		page: SettingsPage
	}
};

// Date of the day display
const dateDiv = document.getElementById('date')
if (dateDiv) {
	dateDiv.textContent = new Date().toLocaleDateString('en-EN', {
		weekday: 'long',
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	})
}

function overloadPushState() {
  const pushState = history.pushState;
  history.pushState = function(state, title, url) {
    const result = pushState.apply(this, arguments);
    window.dispatchEvent(new Event("popstate"));
    return result;
  };
};

console.log(history.pushState)
overloadPushState();
console.log(history.pushState)

function getRoute(url: string): Route {
	const routes = Object.values(router)
	const route = routes.find((route) => {
		return route.url === url
	})
	return route || router.home
}

function render(route: Route) {
	const contentDiv = document.getElementById('content')
	if (!contentDiv)
		return

	contentDiv.innerHTML = route.page()
	console.log('render')
}

function handleNav() {
	const url = window.location.pathname
	const route = getRoute(url)
	render(route)
	if (route.binds)
		route.binds.forEach(bind => {
			bind()
		});

}

function navigate(url: string) {
	history.pushState(null, '', url)
}



window.navigate = navigate

window.addEventListener('popstate', (e) => {
	console.log('popstate')
	console.log(e)
	handleNav()
})

window.addEventListener('DOMContentLoaded', () => {

	console.log('DOM OK !')
	handleNav()
})

// const formLobbyDiv = document.getElementById('join_lobby_form')
// if (!formLobbyDiv)
// 	return
// const formLob = formLobbyDiv as HTMLFormElement
// formLob.get


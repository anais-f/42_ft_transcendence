import { HomePage, bindLogOutButton } from "./pages/home.js"
import { GamePage } from "./pages/game.js"
import { LobbyPage } from "./pages/lobby.js"
import { bindRegisterForm, LoginPage } from "./pages/login.js"
import { ProfilePage } from "./pages/profile.js"
import { SettingsPage } from "./pages/settings.js"
import { checkAuth } from "./auth/authService.js"
import { currentUser, setCurrentUser } from "./store/userStore.js"

declare global {
	interface Window {
		navigate: (url: string) => void
	}
}

type Pages = 'home' | 'game' | 'lobby' | 'login' | 'profile' | 'settings'

type Route = {
	id: string,
	url: string,
	page: () => string
	binds?: Array<() => void>
	protected?: boolean
}

const router: Record<Pages,Route> = {
	home: {
		id: 'home',
		url: '/',
		page: HomePage,
		binds: [bindLogOutButton],
		protected: true
	},

	game: {
		id: 'game',
		url: '/game',
		page: GamePage,
		protected: true
	},

	lobby: {
		id: 'lobby',
		url: '/lobby',
		page: LobbyPage,
		protected: true
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
		page: ProfilePage,
		protected: true
	},

	settings: {
		id: 'settings',
		url: '/settings',
		page: SettingsPage,
		protected: true
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

async function handleNav() {
	const url = window.location.pathname
	const route = getRoute(url)

	// ALWAYS check authentication status first (not just for protected routes)
	const user = await checkAuth()
	setCurrentUser(user)

	// If authenticated and trying to access login page → redirect home
	if (url === '/login' && user) {
		console.log('Already authenticated, redirecting to /')
		navigate('/')
		return
	}

	// If route is protected and user is NOT authenticated → redirect login
	if (route.protected && !user) {
		console.log('Not authenticated, redirecting to /login')
		navigate('/login')
		return
	}

	if (user) {
		console.log('Authenticated as:', user.username)
	}

	render(route)
	if (route.binds) {
		route.binds.forEach(bind => {
			bind()
		})
	}
}

function navigate(url: string) {
	history.pushState(null, '', url)
}


window.navigate = navigate

window.addEventListener('popstate', async (e) => {
	console.log('popstate')
	console.log(e)
	await handleNav()
})

window.addEventListener('DOMContentLoaded', async () => {
	console.log('DOM OK !')
	await handleNav()
})

// const formLobbyDiv = document.getElementById('join_lobby_form')
// if (!formLobbyDiv)
// 	return
// const formLob = formLobbyDiv as HTMLFormElement
// formLob.get

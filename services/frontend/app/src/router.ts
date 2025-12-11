import { HomePage, bindLogOutButton, unbindLogOutButton } from './pages/home.js'
import { GamePage } from './pages/game.js'
import { LobbyPage } from './pages/lobby.js'
import {
	bindRegisterForm,
	unbindRegisterForm,
	bindLoginForm,
	unbindLoginForm,
	LoginPage
} from './pages/login.js'
import { ProfilePage } from './pages/profile.js'
import { SettingsPage } from './pages/settings.js'
import { checkAuth } from './auth/authService.js'
import { setCurrentUser } from './store/userStore.js'

declare global {
	interface Window {
		navigate: (url: string) => void
	}
}

type Pages = 'home' | 'game' | 'lobby' | 'login' | 'profile' | 'settings'

type Route = {
	id: string
	url: string
	page: () => string
	binds?: Array<() => void>
	unbinds?: Array<() => void>
	public?: boolean
}

const router: Record<Pages, Route> = {
	home: {
		id: 'home',
		url: '/',
		page: HomePage,
		binds: [bindLogOutButton],
		unbinds: [unbindLogOutButton]
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
		binds: [bindRegisterForm, bindLoginForm],
		unbinds: [unbindRegisterForm, unbindLoginForm],
		public: true
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
}

// Date display
const dateDiv = document.getElementById('date')
if (dateDiv) {
	dateDiv.textContent = new Date().toLocaleDateString('en-EN', {
		weekday: 'long',
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	})
}

let isNavigating = false
let currentRoute: Route | null = null

function getRoute(url: string): Route {
	const routes = Object.values(router)
	const route = routes.find((route) => route.url === url)
	return route || router.home
}

function render(route: Route) {
	const contentDiv = document.getElementById('content')
	if (!contentDiv) return

	if (currentRoute?.unbinds) {
		currentRoute.unbinds.forEach((unbind) => unbind())
	}

	contentDiv.innerHTML = route.page()
	currentRoute = route

	if (route.binds) {
		route.binds.forEach((bind) => bind())
	}

	console.log('Rendered:', route.id)
}

async function handleNav() {
	if (isNavigating) {
		console.log('Navigation already in progress')
		return
	}

	isNavigating = true
	const url = window.location.pathname
	const route = getRoute(url)

	try {
		if (route.public) {
			const user = await checkAuth()

			if (user && url === '/login') {
				console.log('Already authenticated, redirecting to home')
				setCurrentUser(user)
				isNavigating = false
				navigate('/')
				return
			}

			render(route)
			return
		}

		const user = await checkAuth()
		setCurrentUser(user)

		if (!user) {
			console.log('Not authenticated, redirecting to /login')
			isNavigating = false
			navigate('/login')
			return
		}

		console.log('Authenticated as:', user.username)
		render(route)
	} catch (error) {
		console.error('Navigation error:', error)
		if (!route.public) {
			isNavigating = false
			navigate('/login')
			return
		}
		render(route)
	} finally {
		isNavigating = false
	}
}

function navigate(url: string) {
	if (window.location.pathname === url) {
		console.log('Already at', url)
		return
	}

	history.pushState(null, '', url)
	handleNav()
}

window.navigate = navigate

window.addEventListener('popstate', () => {
	console.log('Browser back/forward')
	handleNav()
})

window.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded')
	handleNav()
})

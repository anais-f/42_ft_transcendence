import { HomePage, bindLogOutButton, unbindLogOutButton } from "./pages/home.js"
import { GamePage } from "./pages/game.js"
import { LobbyPage } from "./pages/lobby.js"
import { bindRegisterForm, unbindRegisterForm, LoginPage } from "./pages/login.js"
import { ProfilePage } from "./pages/profile.js"
import { SettingsPage } from "./pages/settings.js"
import { checkAuth } from "./auth/authService.js"
import { setCurrentUser } from "./store/userStore.js"

declare global {
	interface Window {
		navigate: (url: string, skipAuth?: boolean) => void
	}
}

type Pages = 'home' | 'game' | 'lobby' | 'login' | 'profile' | 'settings'

type Route = {
	id: string,
	url: string,
	page: () => string
	binds?: Array<() => void> // attache les listeners et call les fonctions necessaires
  unbinds?: Array<() => void> //cleanup les listeners si besoin
	protected?: boolean
}

const router: Record<Pages, Route> = {
	home: {
		id: 'home',
		url: '/',
		page: HomePage,
		binds: [bindLogOutButton],
    unbinds: [unbindLogOutButton],
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
		binds: [bindRegisterForm],
		unbinds: [unbindRegisterForm]
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
}

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

// ============================================
// STATE
// ============================================
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

	// Cleanup previous page bindings
	if (currentRoute?.unbinds) {
		currentRoute.unbinds.forEach(unbind => unbind())
	}

	// Render new page
	contentDiv.innerHTML = route.page()
	currentRoute = route

	// Setup new page bindings
	if (route.binds) {
		route.binds.forEach(bind => bind())
	}

	console.log('Rendered:', route.id)
}

// ============================================
// NAVIGATION
// ============================================
async function handleNav(skipAuth = false) {
	// Guard: prevent concurrent navigations
	if (isNavigating) {
		console.log('Navigation already in progress, skipping')
		return
	}

	isNavigating = true
	const url = window.location.pathname
	const route = getRoute(url)

	try {
		// Check authentication (skip after logout to avoid 401)
		let user = null
		if (!skipAuth) {
			user = await checkAuth()
			setCurrentUser(user)
		} else {
			console.log('Skipping auth check (logout flow)')
		}

		// Redirect authenticated users away from login page
		if (url === '/login' && user) {
			console.log('Already authenticated, redirecting to /')
			isNavigating = false
			navigate('/')
			return
		}

		// Redirect unauthenticated users to login for protected routes
		if (route.protected && !user) {
			console.log('Not authenticated, redirecting to /login')
			isNavigating = false
			navigate('/login', true)
			return
		}

		if (user) {
			console.log('Authenticated as:', user.username)
		}

		render(route)

	} catch (error) {
		console.error('Navigation error:', error)
	} finally {
		isNavigating = false
	}
}

function navigate(url: string, skipAuth = false) {
	// Guard: avoid navigating to the same URL
	if (window.location.pathname === url) {
		console.log('Already at', url)
		return
	}

	history.pushState(null, '', url)
	handleNav(skipAuth)
}

window.navigate = navigate

// ============================================
// EVENT LISTENERS
// ============================================

// Browser back/forward buttons
window.addEventListener('popstate', () => {
	console.log('Browser back/forward')
	handleNav()
})

// Initial page load
window.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded')
	handleNav()
})
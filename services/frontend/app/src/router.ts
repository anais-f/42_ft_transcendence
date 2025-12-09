import { HomePage, bindLogOutButton, unbindLogOutButton } from "./pages/home.js"
import { GamePage } from "./pages/game.js"
import { LobbyPage } from "./pages/lobby.js"
import { bindRegisterForm, unbindRegisterForm, bindLoginForm, unbindLoginForm, LoginPage } from "./pages/login.js"
import { ProfilePage } from "./pages/profile.js"
import { SettingsPage } from "./pages/settings.js"
import { checkAuth } from "./auth/authService.js"
import { setCurrentUser } from "./store/userStore.js"

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

	// 1. Cleanup previous page bindings
	if (currentRoute?.unbinds) {
		currentRoute.unbinds.forEach(unbind => unbind())
	}

	// 2. Render new page content
	contentDiv.innerHTML = route.page()
	currentRoute = route

	// 3. Setup new page bindings
	if (route.binds) {
		route.binds.forEach(bind => bind())
	}

	console.log('Rendered:', route.id)
}

// ============================================
// NAVIGATION
// ============================================
async function handleNav() {
	// Guard: prevent concurrent navigations
	if (isNavigating) {
		console.log('Navigation already in progress')
		return
	}

	isNavigating = true
	const url = window.location.pathname
	const route = getRoute(url)

	try {
		// Pour les pages publiques, vérifier si l'utilisateur est déjà connecté
		if (route.public) {
			const user = await checkAuth()

			// Si connecté et sur /login, rediriger vers home
			if (user && url === '/login') {
				console.log('Already authenticated, redirecting to home')
				setCurrentUser(user)
				isNavigating = false
				navigate('/')
				return
			}

			// Sinon, render la page publique
			render(route)
			return
		}

		// Pour les pages protégées, vérifier l'authentification
		const user = await checkAuth()
		setCurrentUser(user)

		// Si pas authentifié, rediriger vers login
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
		// En cas d'erreur sur une page protégée, rediriger vers login
		if (!route.public) {
			isNavigating = false
			navigate('/login')
			return
		}
		// Si erreur sur page publique, essayer de la rendre quand même
		render(route)
	} finally {
		isNavigating = false
	}
}

function navigate(url: string) {
	// Guard: avoid navigating to the same URL
	if (window.location.pathname === url) {
		console.log('Already at', url)
		return
	}

	history.pushState(null, '', url)
	handleNav()
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
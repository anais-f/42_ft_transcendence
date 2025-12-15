import { routerMap, Route, Pages } from './routerMap.js'
import { checkAuth } from '../usecases/userSession.js'
import { setCurrentUser, currentUser } from '../usecases/userStore.js'
import { IPrivateUser } from '@ft_transcendence/common'

export class Router {
	private isNavigating = false
	private currentRoute: Route | null = null

	private readonly HOME_ROUTE = routerMap.home
	private readonly rootElementId = 'content'

	constructor() {
		this.initEventListeners()
	}

	// Find route by URL
	private getRoute(url: string): Route {
		return (
			Object.values(routerMap).find((route) => route.url === url) ||
			this.HOME_ROUTE
		)
	}

	// Render the page content and manage binds/unbinds
	private renderPage(route: Route): void {
		const contentDiv = document.getElementById(this.rootElementId)
		if (!contentDiv) return

		// cleanup old page (unbind)
		if (this.currentRoute?.unbinds) {
			this.currentRoute.unbinds.forEach((unbind) => {
				try {
					unbind()
				} catch (e: unknown) {
					console.warn('Error during unbind:', e)
				}
			})
		}

		// render new page

		contentDiv.innerHTML = route.page()
		this.currentRoute = route

		// setup new page (bind)
		if (route.binds) {
			setTimeout(() => {
				route.binds?.forEach((bind) => {
					try {
						bind()
					} catch (e: unknown) {
						console.warn('Error during bind:', e)
					}
				})
				console.log('Rendered:', route.id)
			}, 0)
		} else {
			console.log('Rendered:', route.id)
		}
	}

	// Main navigation handler
	// manages auth checks and redirects
	private async handleNav(skipAuth: boolean = false): Promise<void> {
		if (this.isNavigating) {
			console.log('Navigation already in progress, skipping')
			return
		}

		this.isNavigating = true
		const url = window.location.pathname
		const route = this.getRoute(url)

		try {
			let user: IPrivateUser | null = currentUser // Start with current user from store

			// 1. --- AUTHENTICATION CHECK API ---
			console.log('🔍 Navigation:', {
				url,
				skipAuth,
				'route.public': route.public,
				currentUser: currentUser?.username || null
			})

			if (!skipAuth) {
				console.log('Calling checkAuth()...')
				const authCheckResult = await checkAuth()
				setCurrentUser(authCheckResult)
				user = authCheckResult
			} else {
				console.log('Skipping checkAuth()')
				user = currentUser
			}

			// --- REDIRECTION GUARDS ---

			// GUARD 1: Authenticated on /login
			// skipAuth=true because we just checked and user is authenticated
			if (url === '/login' && user !== null) {
				console.log('Authenticated, redirecting from /login to /')
				this.isNavigating = false
				await this.navigate('/', true)
				return
			}

			// GUARD 2: Non-authenticated on protected route
			// skipAuth=true because we just checked and user is not authenticated
			if (!route.public && !user) {
				console.log('Not authenticated, redirecting to /login')
				this.isNavigating = false
				await this.navigate('/login', true)
				return
			}

			// 3. RENDER PAGE
			if (user) console.log('Authenticated as: ', user.username)
			this.renderPage(route)
		} catch (e: unknown) {
			// ... (Error handlering)
			if (!route.public) {
				this.isNavigating = false // to new navigation
				await this.navigate('/login', true)
				return
			}
		} finally {
			// if rendering happened WITHOUT redirection, reset state
			if (this.isNavigating === true) {
				this.isNavigating = false
			}
		}
	}

	// Public method to navigate to a URL
	// updates browser history and triggers navigation handling
	public navigate = async (
		url: string,
		skipAuth: boolean = false
	): Promise<void> => {
		if (window.location.pathname === url) {
			console.log('Already at', url)
			return
		}
		history.pushState(null, '', url)
		await this.handleNav(skipAuth)
	}

	// Setup event listeners for popstate (back/forward navigation)
	private initEventListeners(): void {
		window.addEventListener('popstate', async () => {
			console.log('Browser back/forward')
			await this.handleNav()
		})
	}

	// Start the router
	public async start(): Promise<void> {
		// Expose navigate on window for inline onclicks
		window.navigate = (url: string, skipAuth?: boolean) =>
			this.navigate(url, skipAuth ?? false)

		await this.handleNav()
	}
}

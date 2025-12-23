import { routerMap, Route, Pages } from './routerMap.js'
import { checkAuth } from '../usecases/userSession.js'
import { setCurrentUser, currentUser } from '../usecases/userStore.js'
import { IPrivateUser } from '@ft_transcendence/common'
import { socialStore } from '../usecases/socialStore.js'
import {
	createSocialTokenApi,
	createSocialWebSocketApi
} from '../api/homeWsApi.js'
import { handleSocialDispatcher } from '../events/home/socialDispatcher.js'

export let routeParams: Record<string, string> = {}

/**
 * Router class to manage client-side routing,
 * including authentication checks and page rendering.
 */
export class Router {
	private isNavigating = false
	private currentRoute: Route | null = null

	private readonly HOME_ROUTE = routerMap.home
	private readonly rootElementId = 'content'

	constructor() {
		this.initEventListeners()
	}

	/**
	 * Get the route object for a given URL
	 * @param url
	 * @private
	 */
	private getRoute(url: string): Route {
		routeParams = {}

		// exact match first
		const exactMatch = Object.values(routerMap).find(
			(route) => route.url === url
		)
		if (exactMatch) return exactMatch

		// dynamic match
		for (const route of Object.values(routerMap)) {
			const match = this.matchDynamicRoute(route.url, url)
			if (match) {
				routeParams = match
				return route
			}
		}

		return this.HOME_ROUTE
	}

	/**
	 * Match dynamic route patterns like /user/:id
	 * @param pattern
	 * @param url
	 * @private
	 */
	private matchDynamicRoute(
		pattern: string,
		url: string
	): Record<string, string> | null {
		const patternParts = pattern.split('/')
		const urlParts = url.split('/')

		if (patternParts.length !== urlParts.length) return null

		const params: Record<string, string> = {}

		for (let i = 0; i < patternParts.length; i++) {
			const patternPart = patternParts[i]
			const urlPart = urlParts[i]

			if (patternPart.startsWith(':')) {
				// dynamic segment
				params[patternPart.slice(1)] = urlPart
			} else if (patternPart !== urlPart) {
				// static segment doesn't match
				return null
			}
		}

		return params
	}

	/**
	 * Render the page for a given route
	 * and manage binds/unbinds
	 * @param route
	 * @private
	 */
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

	/**
	 * Handle navigation logic
	 * manages authentication checks, WebSocket setup, and page rendering
	 * @param skipAuth
	 * @private
	 */
	private async handleNav(skipAuth: boolean = false): Promise<void> {
		if (this.isNavigating) {
			console.log('Navigation already in progress, skipping')
			return
		}

		this.isNavigating = true
		const url = window.location.pathname
		const route = this.getRoute(url)

		try {
			let user: IPrivateUser | null = currentUser

			// 1. --- AUTHENTICATION CHECK API ---
			if (!skipAuth) {
				const authCheckResult = await checkAuth()
				setCurrentUser(authCheckResult)
				user = authCheckResult
			} else {
				user = currentUser
			}

			// 2. --- SOCIAL WEBSOCKET MANAGEMENT ---
			// Create WebSocket if user is authenticated and socket doesn't exist
			if (user && !socialStore.socialSocket) {
				const token = await createSocialTokenApi()
				if (token) {
					const ws = createSocialWebSocketApi(token.data.wsToken)

					socialStore.socialSocket = ws

					ws.onopen = () => {}
					ws.onmessage = handleSocialDispatcher
					ws.onerror = (error) => {
						console.error('Social WS error:', error)
					}
					ws.onclose = () => {
						socialStore.socialSocket = null
					}
				}
			}

			// --- REDIRECTION GUARDS ---

			// GUARD 1: Authenticated on /login
			// skipAuth=true because we just checked and user is authenticated
			if (url === '/login' && user !== null) {
				this.isNavigating = false
				await this.navigate('/', true)
				return
			}

			// GUARD 2: Non-authenticated on protected route
			// skipAuth=true because we just checked and user is not authenticated
			if (!route.public && !user) {
				this.isNavigating = false
				await this.navigate('/login', true)
				return
			}

			// 3. RENDER PAGE
			this.renderPage(route)
		} catch (e: unknown) {
			console.error('Error during navigation:', e)
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
	/**
	 * Navigate to a given URL
	 * @param url
	 * @param skipAuth
	 */
	public navigate = async (
		url: string,
		skipAuth: boolean = false
	): Promise<void> => {
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

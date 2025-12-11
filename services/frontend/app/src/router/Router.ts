import { routerMap, Route } from './routerMap.js'
import { checkAuth } from '../api/authService.js'
import { setCurrentUser } from '../usecases/userStore.js'

declare global {
	interface Window {
		navigate: (url: string, skipAuth?: boolean) => void
	}
}

export let routeParams: Record<string, string> = {}

export class Router {
	private isNavigating = false
	private currentRoute: Route | null = null

	private readonly HOME_ROUTE = routerMap.home
	private readonly rootElementId = 'content'

	constructor() {
		this.initEventListeners()
	}

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

	// match a route pattern against a URL and extract params
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
			let user: any = null

			if (!skipAuth) {
				const authCheckResult = await checkAuth()
				setCurrentUser(authCheckResult)
				user = authCheckResult
			}

			if (url === '/login' && user) {
				console.log('Already authenticated, redirecting to home')
				this.navigate('/')
				return
			}

			if (!route.public && !user) {
				console.log('Not authenticated, redirecting to /login')
				this.navigate('/login')
				return
			}

			if (user) console.log('Authenticated as: ', user.username)

			this.renderPage(route)
		} catch (e: unknown) {
			console.error('Navigation error: ', e)
			if (!route.public) {
				this.navigate('/login')
				return
			} else {
				this.renderPage(route)
			}
		} finally {
			this.isNavigating = false
		}
	}

	// Public method to navigate to a URL
	// updates browser history and triggers navigation handling
	public navigate = async (url: string, skipAuth: boolean = false): Promise<void> => {
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
		// @ts-ignore
		window.navigate = (url: string, skipAuth?: boolean) =>
			this.navigate(url, skipAuth ?? false)
		await this.handleNav()
	}
}

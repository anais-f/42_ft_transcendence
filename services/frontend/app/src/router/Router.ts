import { routerMap, Route, Pages } from './routerMap.js'
import { checkAuth } from '../usecases/userSession.js'
import { setCurrentUser, currentUser } from '../usecases/userStore.js'
import { IPrivateUser } from '@ft_transcendence/common'
import { socialStore } from '../usecases/socialStore.js'
import {
	createSocialTokenAPI,
	createSocialWebSocketAPI
} from '../api/homeWsApi.js'
import { handleSocialDispatcher } from '../events/home/socialDispatcher.js'
import { NavigateOptions } from '../types/google-type.js'

export let routeParams: Record<string, string> = {}

let pendingNavigationTimeout: ReturnType<typeof setTimeout> | null = null

export function cancelPendingNavigation(): void {
	if (pendingNavigationTimeout) {
		clearTimeout(pendingNavigationTimeout)
		pendingNavigationTimeout = null
	}
}

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

		const exactMatch = Object.values(routerMap).find(
			(route) => route.url === url
		)
		if (exactMatch) return exactMatch

		for (const route of Object.values(routerMap)) {
			const match = this.matchDynamicRoute(route.url, url)
			if (match) {
				routeParams = match
				return route
			}
		}

		return this.HOME_ROUTE
	}

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
				params[patternPart.slice(1)] = urlPart
			} else if (patternPart !== urlPart) {
				return null
			}
		}

		return params
	}

	private updatePageNumber(route: Route): void {
		const pageNumberElement = document.getElementById('page-number')
		if (pageNumberElement) {
			pageNumberElement.textContent = `Page ${route.index}`
		}
	}

	private renderPage(route: Route): void {
		const contentDiv = document.getElementById(this.rootElementId)
		if (!contentDiv) return

		if (this.currentRoute?.unbinds) {
			this.currentRoute.unbinds.forEach((unbind) => {
				try {
					unbind()
				} catch (e) {}
			})
		}

		contentDiv.innerHTML = route.page()
		this.currentRoute = route
		this.updatePageNumber(route)

		if (route.binds) {
			setTimeout(() => {
				route.binds?.forEach((bind) => {
					try {
						bind()
					} catch (e) {}
				})
				console.log('Rendered:', route.id)
			}, 0)
		} else {
			console.log('Rendered:', route.id)
		}
	}

	private async handleNav(skipAuth: boolean = false): Promise<void> {
		if (this.isNavigating) {
			return
		}

		this.isNavigating = true
		const url = window.location.pathname
		const route = this.getRoute(url)

		try {
			let user: IPrivateUser | null = currentUser

			if (!skipAuth) {
				const authCheckResult = await checkAuth()
				setCurrentUser(authCheckResult)
				user = authCheckResult
			} else {
				user = currentUser
			}

			// 2. --- SOCIAL WEBSOCKET MANAGEMENT ---
			if (user && !socialStore.socialSocket) {
				const token = await createSocialTokenAPI()
				if (token) {
					const ws = createSocialWebSocketAPI(token.data.wsToken)

					socialStore.socialSocket = ws

					ws.onopen = () => {}
					ws.onmessage = handleSocialDispatcher
					ws.onerror = () => {}
					ws.onclose = () => {
						socialStore.socialSocket = null
					}
				}
			}

			if (url === '/login' && user !== null) {
				this.isNavigating = false
				await this.navigate('/', { skipAuth: true })
				return
			}

			if (!route.public && !user) {
				this.isNavigating = false
				await this.navigate('/login', { skipAuth: true })
				return
			}

			this.renderPage(route)
		} catch (e) {
			if (!route.public) {
				this.isNavigating = false
				await this.navigate('/login', { skipAuth: true })
				return
			}
		} finally {
			this.isNavigating = false
		}
	}

	public navigate = async (
		url: string,
		options: NavigateOptions = {}
	): Promise<void> => {
		const { skipAuth = false, delay } = options

		if (delay) {
			pendingNavigationTimeout = setTimeout(() => {
				pendingNavigationTimeout = null
				history.pushState(null, '', url)
				this.handleNav(skipAuth)
			}, delay)
			return
		}

		history.pushState(null, '', url)
		await this.handleNav(skipAuth)
	}

	private initEventListeners(): void {
		window.addEventListener('popstate', async () => {
			await this.handleNav()
		})
	}

	public async start(): Promise<void> {
		window.navigate = (url: string, options?: NavigateOptions) =>
			this.navigate(url, options ?? {})
		window.cancelPendingNavigation = cancelPendingNavigation

		await this.handleNav()
	}
}

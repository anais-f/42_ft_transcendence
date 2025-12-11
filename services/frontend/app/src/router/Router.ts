import { routerMap, Route, Pages } from './routerMap'
import { checkAuth } from '../api/authService'
import { setCurrentUser, currentUser } from '../usecases/userStore'
import { IPrivateUser } from '@ft_transcendence/common'

declare global {
  interface Window {
    navigate: (url: string, skipAuth?: boolean) => void
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
      let user: IPrivateUser | null = currentUser // Commence avec l'état du store

      // 1. --- AUTHENTICATION CHECK API ---
      // Simplification: On appelle checkAuth() si on ne skip pas l'auth, pour garantir l'état le plus à jour.
      const shouldCallAPI = !skipAuth;

      console.log('🔍 Navigation:', {
        url,
        skipAuth,
        'route.public': route.public,
        currentUser: currentUser?.username || null,
        shouldCallAPI
      })

      if (shouldCallAPI) {
        console.log('📞 Calling checkAuth()...')
        const authCheckResult = await checkAuth()
        setCurrentUser(authCheckResult)
        user = authCheckResult
      } else {
        // Pas d'appel API, on utilise l'état actuel du store
        console.log('⏭️  Skipping checkAuth()')
        user = currentUser
      }

      // --- REDIRECTION GUARDS ---

      // GUARD 1: Authentifié sur la page de Login
      // Si l'utilisateur a réussi la vérification (user existe) et est sur /login, on le renvoie à /
      // skipAuth=true car on vient de vérifier, pas besoin de re-vérifier
      if (url === '/login' && user !== null) {
        console.log('Authenticated, redirecting from /login to /')
        this.isNavigating = false
        await this.navigate('/', true)
        return
      }

      // GUARD 2: Non Authentifié sur une page Protégée
      // Si la route est protégée et que l'utilisateur n'est pas dans l'état (après API check ou store)
      // skipAuth=true car on vient de vérifier, l'utilisateur n'est pas authentifié
      if (!route.public && !user) {
        console.log('Not authenticated, redirecting to /login')
        this.isNavigating = false
        await this.navigate('/login', true)
        return
      }

      // 3. RENDU
      if (user) console.log('Authenticated as: ', user.username)
      this.renderPage(route)

    } catch (e: unknown) {
      // ... (Gestion des erreurs)
      if (!route.public) {
        this.isNavigating = false // permet à la nouvelle nav de s'exécuter
        await this.navigate('/login', true)
        return
      }
    } finally {
      // Si le rendu a été fait SANS redirection, on réinitialise l'état
      if (this.isNavigating === true) {
        this.isNavigating = false
      }
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

    // Pas de vérification au démarrage : handleNav() s'en charge
    await this.handleNav()
  }
}
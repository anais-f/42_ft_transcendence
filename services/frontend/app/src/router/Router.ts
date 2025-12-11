import { routerMap, Route, Pages } from "./routerMap";

declare global {
  interface Window {
    navigate: (url: string, skipAuth?: boolean = false) => void
  }
}

export class Router {
  private isNavigating = false // To prevent multiple simultaneous navigations
  private currentRoute: Route | null = null // Track the current route

  private readonly HOME_ROUTE = routerMap.home // Default route
  private readonly rootElementId = 'content' // ID of the root div in index.html

  constructor() {
    this.initEventListeners()
  }

  // get Route object from URL
  private getRoute(url: string): Route {
    return Object.values(routerMap).find(route => route.url === url) || this.HOME_ROUTE
  }

  // manage page lifecycle (unbind -> render -> bind)
  private renderPage(route: Route) {
    const contentDiv = document.getElementById(this.rootElementId)
    if (!contentDiv) return

    // cleanup old page (unbind)
    if (this.currentRoute?.unbinds) {
      this.currentRoute.unbinds.forEach(unbind => {
        try {
          unbind()
        }
        catch (e: unknown) {
          console.warn('Error during unbind:', e)
        }
      })
    }

    // render new page
    contentDiv.innerHTML = route.page()
    this.currentRoute = route

    // setup new page (bind)
    // setTimeout (0) is added to ensure the DOM is fully updated and that the elements 'bind' tries to find actually exist
    if (route.binds) {
      setTimeout(() => {
        route.binds?.forEach(bind => {
          try {
            bind()
          }
          catch (e: unknown) {
            console.warn('Error during bind:', e)
          }
        })
      }, 0)

    console.log('Rendered:', route.id)
  }

  // main navigation handle
  // function to manage navigation flow, auth, and redirections
  private async handleNav(skipAuth: boolean = false) {
    if (this.isNavigating) {
      console.log('Navigation already in progress, skipping')
      return
    }

    this.isNavigating = true // Mark navigation as in progress
    const url = window.location.pathname // Get current URL path
    const route = this.getRoute(url)

    try {
      let user = null

      // 1. Vérification d'authentification et mise à jour du store
      if (!skipAuth) {
        const authCheckResult = await checkAuth()
        setCurrentUser(authCheckResult)
        user = authCheckResult
      }
    }

  }


}

/********
  try {
    let user = null

    // 1. Vérification d'authentification et mise à jour du store
    const authCheckResult = await checkAuth()
    setCurrentUser(authCheckResult)
    user = authCheckResult

    // 2. Gérer les redirections (similaire à votre logique originale)

    // Redirection 1 : Authentifié sur la page de Login
    if (url === '/login' && user) {
      console.log('Already authenticated, redirecting to home')
      this.navigate('/')
      return
    }

    // Redirection 2 : Non Authentifié sur une page non-publique
    if (!route.public && !user) {
      console.log('Not authenticated, redirecting to /login')
      this.navigate('/login')
      return
    }

    if (user) console.log('Authenticated as:', user.username)

    // 3. Rendu de la page
    this.render(route)

  } catch (error) {
    console.error('Navigation error:', error)

    // Si une erreur d'authentification se produit et que la page est protégée, rediriger vers login
    if (!route.public) {
      this.navigate('/login')
      return
    }
    this.render(route) // Tenter le rendu même en cas d'erreur sur une page publique
  } finally {
    this.isNavigating = false
  }
}

/**
 * 🚀 Méthode publique pour lancer la navigation (remplace la fonction globale 'navigate').
 * @param url L'URL cible.
 */
public navigate = (url: string) => {
  if (window.location.pathname === url) {
    console.log('Already at', url)
    return
  }

  history.pushState(null, '', url)
  this.handleNav()
}

/**
 * 👂 Configure les écouteurs de l'application.
 */
private initEventListeners() {
  // Écouteur pour les boutons "Retour/Avancer"
  window.addEventListener('popstate', () => {
    console.log('Browser back/forward')
    this.handleNav()
  })

  // Note: L'interception des clics sur les <a> est gérée par des onclick="navigate(...)"
  // dans votre HTML/Pages. Si ce n'était pas le cas, il faudrait ajouter une délégation ici.
}

/**
 * 🏁 Démarre le routeur.
 */
public start() {
  // Exposer la méthode navigate sur la fenêtre globale (nécessaire pour les onclick="..." de vos pages)
  window.navigate = this.navigate

  // Lancer le routage initial
  this.handleNav()
}
}
 */
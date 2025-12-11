
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

///****
import { Router } from './Router.js'

// --- Logique d'affichage de la date (Gardée de l'ancien fichier) ---
const dateDiv = document.getElementById('date')
if (dateDiv) {
  dateDiv.textContent = new Date().toLocaleDateString('en-EN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
// ---------------------------------------------------------------------

// Démarrer l'application après le chargement complet du DOM
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded')

  // 1. Créer une instance du routeur
  const appRouter = new Router()

  // 2. Démarrer le routage. (Ceci appelle le handleNav initial et expose window.navigate)
  appRouter.start()
})
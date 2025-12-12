// type EventHandler = (event: Event, target: HTMLElement) => void | Promise<void>
//
// class EventDelegator {
//   private handlers = new Map<string, EventHandler>();
//   private isListening = false;
//
//   start() {
//     if (this.isListening) return;
//
//     // listeners pour les clics de bouton
//     document.addEventListener('click', (event) => {
//       const target = event.target as HTMLElement;
//
//       //chercher quel clic on veut gérer avec le data-action
//       const actionElement =
//     }
//
//     //
//   }
//
// }

/*
// Exemple de fonction de délégation
function globalDelegator(e: Event) {
    const target = e.target as HTMLElement;

    // 1. Délégation des Clics de Navigation (simplifie le HTML)
    const navLink = target.closest('[data-navigate-to]');
    if (navLink) {
        e.preventDefault();
        const url = navLink.getAttribute('data-navigate-to');
        if (url) {
            window.navigate(url);
        }
        return;
    }

    // 2. Délégation des Soumissions de Formulaires (par exemple, pour le login)
    // Au lieu d'écouter par ID, on écoute par data-action
    const form = target.closest('form[data-action]');
    if (form) {
        // e.preventDefault();
        const action = form.getAttribute('data-action');
        // if (action === 'register') handleRegisterForm(e);
        // if (action === 'login') handleLoginForm(e);
        // ... (Appeler une fonction globale qui contient la logique actuelle de bindLoginForm)
        return;
    }

    // 3. Délégation des Boutons (par exemple, pour le logout)
    const actionButton = target.closest('[data-action-type]');
    if (actionButton) {
        const action = actionButton.getAttribute('data-action-type');
        if (action === 'logout') {
            // e.preventDefault();
            // Appeler la fonction de logout directement
            // handleLogoutClick();
        }
    }
}
 */
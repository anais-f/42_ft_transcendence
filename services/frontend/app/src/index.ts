import { Router } from './router/Router.js'

// Display the current date in the specified format
const dateDiv = document.getElementById('date')
if (dateDiv) {
	dateDiv.textContent = new Date().toLocaleDateString('en-EN', {
		weekday: 'long',
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	})
}

// Start the application when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded')

	// Create the main application router
	const appRouter = new Router()

	// Start the router to handle navigation and rendering
	appRouter.start()
})

/* TODO FRONTEND IMPROVEMENTS LIST
*
*
* - review QRcode and sanitization data before innerHTML
* - sanitize HTML before rendering user-controlled data
* - review all alert() usage and replace with better UX (toasts/modals) -> see Notyf
* - review error handling and add more specific messages
* - review form validation and improve user feedback
* - remove inline event handlers to comply with CSP -> see to replace onclick with addEventListener ?
* - centralize event attachment/detachment to reduce duplication
* - centralize error handling logic
* - validation data in front before sending to backend
 */


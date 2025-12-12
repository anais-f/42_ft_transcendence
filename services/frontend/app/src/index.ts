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

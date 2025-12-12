import { Router } from './router/Router.js'

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
window.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded')
	const appRouter = new Router()
	appRouter.start()
})

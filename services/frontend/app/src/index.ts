import { Router } from './router/Router.js'

const dateDiv = document.getElementById('date')
if (dateDiv) {
	dateDiv.textContent = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'Europe/Paris'
	})
}

window.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded')

	const appRouter = new Router()

	appRouter.start()
})

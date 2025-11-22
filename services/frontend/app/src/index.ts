import '../style.css'
import { renderHomePage } from './pages/home.js'
import { renderProfile } from './pages/profil.js'

document.addEventListener('DOMContentLoaded', () => {
	const content: HTMLElement =
		document.getElementById('content') ?? document.body
		renderHomePage()
		renderProfile()
})

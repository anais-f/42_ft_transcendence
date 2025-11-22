import '../style.css'
import { renderHomePage } from './pages/home.js'

document.addEventListener('DOMContentLoaded', () => {
	const content: HTMLElement =
		document.getElementById('content') ?? document.body
	renderHomePage()
})

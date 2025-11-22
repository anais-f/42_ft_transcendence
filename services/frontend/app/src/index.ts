import '../style.css'
import { renderHomePage } from './pages/homePage.js'

document.addEventListener('DOMContentLoaded', () => {

    const content: HTMLElement = document.getElementById('content') ?? document.body
    renderHomePage()
}) 

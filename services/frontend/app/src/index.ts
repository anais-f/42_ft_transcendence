import '../style.css'
import { renderHomePage } from './pages/home.js'
import { renderProfile } from './pages/profile.js'
import { renderGame } from './pages/game.js'
import { createButton } from './components/button.js'
import { HomePage } from './pages/old_pages/old_home.js'

export let user = {
	username: 'UserName',
	wins: 42,
	losses: 27,
	lastLogin: '27-04-1994',
	login: true
}

let pages: Record<string, () => string | HTMLElement> = {}

document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content')
	const dynamicMenu = document.getElementById('menu')

	if (!contentDiv || !dynamicMenu) {
		console.error('Missing #content or #menu in index.html')
		return
	}
	const content: HTMLElement = contentDiv
	const menu: HTMLElement = dynamicMenu

	if (user.login === true) {
		pages = {
			game: renderGame,
			profile: renderProfile,
			home: renderHomePage
		}
	} else {
		pages = {
			home: renderHomePage
		}
	}

	for (const key in pages) {
		const li = document.createElement('li')
		li.innerHTML = `<a href="#${key}">${key}</a>`
		menu.prepend(li)
	}
	if (user.login === true) {
		const logout =
			document.getElementById('logout') ?? document.createElement('div')
		const loBtn = createButton({
			name: 'Logout',
			className:
				'bg-red-500 px-3 py-1 rounded-md border border-red-400 hover:bg-red-400',
			onClick: () => {
				user.login = false
				renderHomePage()
			}
		})
		logout.prepend(loBtn)
	}

	function render(hash: string) {
		const key: string = hash.replace(/^#/, '') || 'home'
		const pageToRender = pages[key] ?? pages['home']

		const res = pageToRender()
		if (typeof res === 'string') {
			content.innerHTML = res
		} else {
			content.append(res)
		}
	}

	window.addEventListener('hashchange', () => render(location.hash))
	render(location.hash)
})

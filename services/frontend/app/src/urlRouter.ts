import '../style.css'
import { WalerPage } from './pages/old_wale.js'
import { HomePage } from './pages/old_home.js'
import { AboutUsPage } from './pages/old_aboutUs.js'
import { RegisterPage } from './pages/old_register.js'
import { MyPage } from './pages/old_mypage.js'
import { GamePage } from "./pages/old_gameP.js"


document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content')
	const dynamicMenu = document.getElementById('menu')

	if (!contentDiv || !dynamicMenu) {
		console.error('Missing #content or #menu in index.html')
		return
	}

	const content = contentDiv as HTMLElement
	const menu = dynamicMenu as HTMLElement

	const pages = {
		home: HomePage(),
		about: AboutUsPage(),
		register: RegisterPage(),
		wales: WalerPage(),
		me: MyPage(),
		game: GamePage(),
	} satisfies Record<string, string>

	// Build menu
	for (const key in pages) {
		const li = document.createElement('li')
		li.innerHTML = `<a href="#${key}">${key}</a>`
		menu.appendChild(li)
	}

	function render(hash: string) {
		const key = (hash.replace(/^#/, '') || 'home') as keyof typeof pages
		content.innerHTML = pages[key] ?? pages.home
	}

	window.addEventListener('hashchange', () => render(location.hash))
	render(location.hash)

	// Submit handler (register)
	content.addEventListener('submit', async (e: Event) => {
		const form = e.target as HTMLFormElement
		if (!form || form.id !== 'register-form') return
		e.preventDefault()

		const login =
			(
				document.getElementById('reg-login') as HTMLInputElement
			)?.value?.trim() ?? ''
		const password =
			(document.getElementById('reg-password') as HTMLInputElement)?.value ?? ''
		const msg = document.getElementById('register-msg') as HTMLElement | null

		if (!login || !password) {
			if (msg) msg.textContent = 'Missing login or password'
			return
		}

		try {
			const res = await fetch('/auth/api/register', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ login, password })
			})
			if (!res.ok) {
				const text = await res.text().catch(() => '')
				if (msg)
					msg.textContent = `Register failed (${res.status}): ${text || 'error'}`
				return
			}
			if (msg) msg.textContent = 'Account created!'
		} catch {
			if (msg) msg.textContent = 'Network error'
		}
	})
})

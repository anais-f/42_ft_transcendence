document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content')
	const dynamicMenu = document.getElementById('menu')

	if (!contentDiv || !dynamicMenu) {
		console.error('Missing #content or #menu in DOM')
		return
	}

	const content = contentDiv as HTMLElement
	const menu = dynamicMenu as HTMLElement

	const pages = {
		home: `
      <h1>Welcome to Transcendence</h1>
      <p>This is a single-page application example.</p>
    `,
		about: `
      <h1>About Us</h1>
      <p>We are dedicated to providing the best service.</p>
    `,
		register: `
      <h1>Create account</h1>
      <form id="register-form">
        <label>
          Username
          <input id="reg-username" name="username" required minlength="4" maxlength="16" pattern="[A-Za-z0-9_-]{4,16}">
        </label>
        <label>
          Password
          <input id="reg-password" name="password" type="password" required minlength="8" maxlength="128">
        </label>
        <button type="submit">Register</button>
      </form>
      <p id="register-msg"></p>
    `
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

		const username =
			(
				document.getElementById('reg-username') as HTMLInputElement
			)?.value?.trim() ?? ''
		const password =
			(document.getElementById('reg-password') as HTMLInputElement)?.value ?? ''
		const msg = document.getElementById('register-msg') as HTMLElement | null

		if (!username || !password) {
			if (msg) msg.textContent = 'Missing username or password'
			return
		}

		try {
			const res = await fetch('/auth/api/register', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username, password })
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

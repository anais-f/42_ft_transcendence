document.addEventListener('DOMContentLoaded', (event) => {
	const contentDiv = document.getElementById('content');
	const dynamicMenu = document.getElementById('menu');

	const pages = {
		home: `
			<h1>Welcome to Transcendence</h1>
            <p>This is a single-page application example.</p>
            `,
		about: `
			<h1>About Us</h1>
			<p>We are dedicated to providing the best service.</p>
			`,
	}

	window.addEventListener('load', function () {
		let i = 0;
		for (let key in pages) {
			let li = document.createElement('li')
			li.innerHTML = `<a href="#${key}">${key}</a>`
			dynamicMenu.appendChild(li);
		}
	})

	window.addEventListener('hashchange', () => {
		loadPage(window.location.hash);
	})

	function loadPage(hash) {
		const page = hash ? hash.replace('#', '') : 'home';
		contentDiv.innerHTML = pages[page] || pages.home
	}

	loadPage(window.location.hash)
})

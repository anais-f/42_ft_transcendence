/** @type {import('tailwindcss').Config} */
	export default {
			content: ['./index.html', './src/**/*.{html,js,ts}'],
			theme: {
					extend: {
							fontFamily: {
									HoldMoney: ['HoldMoney', 'sans-serif'],
									birthstone: ['"Birthstone"', 'cursive'],
									newsreader: ['"Newsreader"', 'serif'],
									rye: ['"Rye"', 'cursive'],
									special: ['"Special Elite"', 'cursive'],
							},
					},
			},
			plugins: [],
	};
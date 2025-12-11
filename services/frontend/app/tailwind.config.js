/** @type {import('tailwindcss').Config} */
	export default {
			content: ['./oldindex.html', './src/**/*.{html,js,ts}'],
			theme: {
					extend: {
							fontFamily: {
									HoldMoney: ['HoldMoney', 'sans-serif'],
							},
					},
			},
			plugins: [],
	};
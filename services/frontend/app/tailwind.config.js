/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{html,js,ts}'],
	theme: { extend: {} },
	plugins: [],
};


module.exports = {
  theme: {
    extend: {
      fontFamily: {
        amado: ['Amado', 'sans-serif'],
      },
    },
  },
};

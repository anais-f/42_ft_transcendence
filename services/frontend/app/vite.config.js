import { defineConfig } from 'vite'


export default defineConfig({
	base: './',
	build: { outDir: 'dist', emptyOutDir: true },
	server: {
		host: true,
		port: 3000,
		historyApiFallback: true
	}
})
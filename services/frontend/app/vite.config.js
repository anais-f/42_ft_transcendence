import { defineConfig } from 'vite'


export default defineConfig({
	base: './',
	build: { outDir: 'dist', emptyOutDir: true },
	server: {
		host: '0.0.0.0',
		allowedHosts: true,
		port: 3000,
		historyApiFallback: true
	}
})

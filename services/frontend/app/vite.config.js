import { defineConfig } from 'vite'
import path from 'path'


export default defineConfig({
	base: './',
	envDir: '../../../',
	build: { outDir: 'dist', emptyOutDir: true },
	server: {
		host: '0.0.0.0',
		allowedHosts: true,
		port: 3000,
		historyApiFallback: true
	},
  resolve: {
	  alias: {
		  '@common': path.resolve(__dirname, '../../../packages/common/dist'),
		  '@pong-shared': path.resolve(__dirname, '../../../packages/pong-shared/dist')
	  }
  }
})

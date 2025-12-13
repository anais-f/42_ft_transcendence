import { defineConfig } from 'vite'
import path from 'path'


export default defineConfig({
	base: './',
	envDir: '../../../',
	build: { outDir: 'dist', emptyOutDir: true },
	server: {
		host: true,
		port: 3000,
		historyApiFallback: true
	},
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, '../../../packages/common/dist')
    }
  }
})
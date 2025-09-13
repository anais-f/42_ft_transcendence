import Fastify from 'fastify'

const app = Fastify({
	logger: false,
})

const start = async () => {
	try {
		await app.listen({ port: 3000, host: '0.0.0.0' })
		console.log('Listening on port 3000')
	} catch (err) {
		console.error('Error strating server: ', err)
		process.exit(1)
	}
}

start()

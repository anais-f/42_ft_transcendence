import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export const socialRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()


	server.get('/api/ws', { websocket: true }, (socket: any) => {

		// Message de bienvenue
		socket.send(JSON.stringify({
			type: 'connected',
			message: 'Connected to social ws (no auth)'
		}))

		socket.on('message', (message: any) => {
      // Echo du message reçu
      console.log('Received message:', message)
      socket.send('hello from my fucking websocket server')

	  })
  })
}

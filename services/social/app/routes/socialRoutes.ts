import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { z } from 'zod'
import { createTokenController } from '../controllers/websocketControllers.js'

export const socialRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/create-token - Create temporary WS token (JWT required)
	server.post(
		'/api/create-token',
		{
			preHandler: jwtAuthMiddleware
		},
		createTokenController
	)

	// WebSocket route - client must connect with: ws://<host>/api/ws?token=<wsToken>
	const wsQuerySchema = z.object({
		token: z.string()
	})

	server.get(
		'/api/ws',
		{
			websocket: true,
			schema: {
				querystring: wsQuerySchema
			}
		},
		(
			socket: any,
			request: FastifyRequest<{ Querystring: { token: string } }>
		) => {
			// Étape 1 : Extraire le token depuis l'URL query parameter
			const token = request.query.token

			// Étape 2 : Vérifier qu'un token est présent
			if (!token) {
				socket.send(
					JSON.stringify({
						type: 'error',
						message: 'Authentication required: no token provided'
					})
				)
				socket.close()
				return
			}

			// Étape 3 : Vérifier et décoder le token JWT
      let payload: any
      try {
        payload = fastify.jwt.verify(token)
      }
      catch (err) {
        socket.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid or expired token'
          })
        )
        socket.close()
        return
      }

			// // Étape 4 : Extraire user_id et login du payload
      const userId = payload.user_id
      const userLogin = payload.login


      // Étape 5 : Gérer la connexion WebSocket avec l'utilisateur authentifié
      console.log(`✅ User ${userLogin} (ID: ${userId}) connected to WebSocket`)

      // Message de bienvenue avec les infos utilisateur
      socket.send(JSON.stringify({
        type: 'connected',
        message: 'Successfully connected to social WebSocket',
        user: {
          id: userId,
          login: userLogin
        }
      }))

      socket.on('message', (message: any) => {
        // Echo du message avec l'identité de l'utilisateur
        console.log(`📨 Message from user ${userLogin} (${userId}):`, message.toString())
        socket.send(JSON.stringify({
          type: 'echo',
          from_user_id: userId,
          from_login: userLogin,
          message: message.toString()
        }))
      })

      socket.on('close', () => {
        console.log(`❌ User ${userLogin} (ID: ${userId}) disconnected from WebSocket`)
      })
		})
}

import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { z } from 'zod'
import { createTokenController } from '../controllers/websocketControllers.js'
import * as wsMap from '../usescases/connectionManager.js'

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
			} catch (err) {
				socket.send(
					JSON.stringify({
						type: 'error',
						message: 'Invalid or expired token'
					})
				)
				socket.close()
				return
			}

			// Étape 4 : Extraire user_id et login du payload
			const userId = payload.user_id.toString() // 👈 Convertir en string pour la map
			const userLogin = payload.login

			// 👇 NOUVEAU : Ajouter la connexion à la map
			const isFirstConnection = wsMap.addConnection(userId, socket)
			console.log(`✅ User ${userLogin} (ID: ${userId}) connected to WebSocket`)
			console.log(
				`   First connection: ${isFirstConnection} | Total connections: ${wsMap.getTotalConnections()}`
			)

			// Si première connexion → user passe OFFLINE → ONLINE
			if (isFirstConnection) {
				console.log(`🟢 User ${userLogin} is now ONLINE (first connection)`)
				// 🔔 TODO : Appeler user service pour marquer online
			}

			// Message de bienvenue avec les infos utilisateur
			socket.send(
				JSON.stringify({
					type: 'connected',
					message: 'Successfully connected to social WebSocket',
					user: {
						id: userId,
						login: userLogin
					},
					connectionCount: wsMap.getConnectionCount(userId)
				})
			)

			socket.on('message', (message: any) => {
				// Echo du message avec l'identité de l'utilisateur
				console.log(
					`📨 Message from user ${userLogin} (${userId}):`,
					message.toString()
				)
				socket.send(
					JSON.stringify({
						type: 'echo',
						from_user_id: userId,
						from_login: userLogin,
						message: message.toString()
					})
				)
			})

			socket.on('close', () => {
				// 👇 NOUVEAU : Retirer la connexion de la map
				const isLastConnection = wsMap.removeConnection(userId, socket)
				console.log(
					`❌ User ${userLogin} (ID: ${userId}) disconnected from WebSocket`
				)
				console.log(
					`   Last connection: ${isLastConnection} | Total connections: ${wsMap.getTotalConnections()}`
				)

				// Si dernière connexion → user passe ONLINE → OFFLINE
				if (isLastConnection) {
					console.log(
						`🔴 User ${userLogin} is now OFFLINE (last connection closed)`
					)
					// 🔔 TODO : Appeler user service pour marquer offline
				}
			})

			// 👇 NOUVEAU : Gérer les erreurs de socket
			socket.on('error', (err: any) => {})
		}
	)
}

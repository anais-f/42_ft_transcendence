import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { googleCallBackController } from '../controllers/oauthController.js'

export async function oauthRoutes(app: FastifyInstance) {
	app.get('/login/google/callback', googleCallBackController)
}

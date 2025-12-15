import { FastifyRequest, FastifyReply } from 'fastify'
import { createWsToken } from './createWsToken.js'
import createHttpError from 'http-errors'

export async function createTokenController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }
	if (!user) throw createHttpError.Unauthorized('User not authenticated')

	reply.code(201).send(createWsToken(request.server, user))
}

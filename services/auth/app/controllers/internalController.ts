import { FastifyReply, FastifyRequest } from 'fastify'
import { ValidateSessionSchema } from '@ft_transcendence/common'
import { getSessionId } from '../repositories/userRepository.js'
import createHttpError from 'http-errors'

export function validateSessionController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = ValidateSessionSchema.safeParse(request.body)
	if (!parsed.success)
		throw createHttpError.BadRequest('Invalid session validation payload')

	const { user_id, session_id } = parsed.data
	const currentSessionId = getSessionId(user_id)

	if (currentSessionId === undefined)
		throw createHttpError.NotFound('User not found')
	console.log(
		`Validating session for user ${user_id}: current ${currentSessionId}, provided ${session_id}`
	)
	if (currentSessionId === session_id) {
		return reply.code(200).send({ valid: true })
	} else {
		throw createHttpError.Unauthorized('Session expired or invalid')
	}
}

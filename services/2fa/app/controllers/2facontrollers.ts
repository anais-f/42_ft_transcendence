import { FastifyReply, FastifyRequest } from 'fastify'
import {
	verify2FASchema,
	setup2FASchema,
	disable2FASchema,
	status2FASchema
} from '@ft_transcendence/common'
import {
	setup2FA,
	verify2FA,
	disable2FA,
	status2FA
} from '../usecases/twofaUsecases.js'
import createHttpError from 'http-errors'

export async function setup2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = setup2FASchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { user_id, issuer, label } = parsed.data
	const result = await setup2FA(user_id, issuer, label)

	return reply.code(200).send(result)
}

export async function verify2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = verify2FASchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { user_id, twofa_code } = parsed.data
	const result = verify2FA(user_id, twofa_code)

	return reply.code(200).send(result)
}

export async function disable2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = disable2FASchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { user_id } = parsed.data
	const result = disable2FA(user_id)

	return reply.code(200).send(result)
}

export async function status2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = status2FASchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { user_id } = parsed.data
	const result = status2FA(user_id)

	return reply.code(200).send(result)
}

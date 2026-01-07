import type { FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import { verifyToken } from '../utils/jwt.js'
import {
	Enable2FAResponseDTO,
	Status2FAResponseDTO,
	twofaCodeSchema,
	Verify2FALoginResponseDTO,
	InternalGoogleUserStatusResponseDTO
} from '@ft_transcendence/common'
import {
	enable2FA,
	verify2FASetup,
	verify2FALogin,
	disable2FA,
	status2FA
} from '../usecases/twofa.js'
import { isGoogleUser } from '../repositories/userRepository.js'

export async function enable2faController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<Enable2FAResponseDTO> {
	const cookieToken = req.cookies.auth_token
	if (!cookieToken) throw createHttpError.Unauthorized('Missing cookieToken')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const result: Enable2FAResponseDTO = await enable2FA(
		payload.user_id,
		payload.login
	)

	return reply.code(200).send(result)
}

export async function verify2faSetupController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const cookieToken = req.cookies.auth_token
	if (!cookieToken)
		throw createHttpError.Unauthorized('Missing cookieToken (setup)')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const parsed = twofaCodeSchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid request body')

	const { twofa_code } = parsed.data
	await verify2FASetup(payload.user_id, twofa_code)

	return reply.code(200).send()
}

export async function verify2faLoginController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<Verify2FALoginResponseDTO> {
	const cookieToken = req.cookies.twofa_token
	if (!cookieToken) throw createHttpError.Unauthorized('Missing cookieToken')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const parsed = twofaCodeSchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid request body')

	const { twofa_code } = parsed.data
	const result: Verify2FALoginResponseDTO = await verify2FALogin(
		payload.user_id,
		payload.login,
		payload.is_admin,
		twofa_code
	)

	reply.setCookie('auth_token', result.auth_token, {
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		path: '/',
		maxAge: 60 * 15
	})
	reply.clearCookie('twofa_token', { path: '/' })
	return reply.code(200).send(result)
}

export async function disable2faController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const cookieToken = req.cookies.auth_token
	if (!cookieToken) throw createHttpError.Unauthorized('Missing cookieToken')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const parsed = twofaCodeSchema.safeParse(req.body)
	if (!parsed.success)
		throw createHttpError.BadRequest(
			'Invalid request body - twofa_code required'
		)

	const { twofa_code } = parsed.data
	await disable2FA(payload.user_id, twofa_code)

	return reply.code(200).send()
}

export async function status2faController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<Status2FAResponseDTO> {
	const cookieToken = req.cookies.auth_token
	if (!cookieToken) throw createHttpError.Unauthorized('Missing cookieToken')

	const payload = verifyToken(cookieToken)
	if (!payload || !payload.user_id)
		throw createHttpError.Unauthorized('Invalid cookieToken')

	const result: Status2FAResponseDTO = await status2FA(payload.user_id)
	return reply.code(200).send(result)
}

export async function internalStatus2faController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<Status2FAResponseDTO> {
	const { id } = req.params as { id: string }
	const userId = Number(id)
	if (isNaN(userId)) throw createHttpError.BadRequest('Invalid user id')

	const result: Status2FAResponseDTO = await status2FA(userId)
	return reply.code(200).send(result)
}

export async function internalGoogleUserStatusController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<InternalGoogleUserStatusResponseDTO> {
	const { id } = req.params as { id: string }
	const userId = Number(id)
	if (isNaN(userId)) throw createHttpError.BadRequest('Invalid user id')

	const is_google_user = isGoogleUser(userId)
	return reply.code(200).send({ is_google_user })
}

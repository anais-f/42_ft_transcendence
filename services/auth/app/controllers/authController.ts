import type { FastifyReply, FastifyRequest } from 'fastify'
import {
	RegisterResponseDTO,
	LoginResponseDTO,
	ConfigResponseDTO
} from '@ft_transcendence/common'
import {
	registerUserUsecase,
	loginUserUsecase,
	validateAdminUsecase
} from '../usecases/authUsecases.js'
import createHttpError from 'http-errors'
import { env } from '../env/checkEnv.js'
import { tr } from 'zod/v4/locales'

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<RegisterResponseDTO> {
	const { login, password } = request.body as {
		login: string
		password: string
	}

	const { publicUser, token } = await registerUserUsecase(login, password)

	reply.setCookie('auth_token', token, {
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		path: '/',
		maxAge: 60 * 60
	})
	reply.code(201)
	return { message: 'User registered successfully', token }
}

export async function loginController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<LoginResponseDTO> {
	const { login, password } = request.body as {
		login: string
		password: string
	}

	const result = await loginUserUsecase(login, password)

	if (result.pre_2fa_required && result.token) {
		reply.setCookie('twofa_token', result.token, {
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			path: '/',
			maxAge: 60 * 5
		})
		return { pre_2fa_required: true }
	} else if (!result.pre_2fa_required && result.token) {
		reply.setCookie('auth_token', result.token, {
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			path: '/',
			maxAge: 60 * 60
		})
		return {
			pre_2fa_required: false,
			token: result.token
		}
	}

	throw createHttpError.InternalServerError('Login failed')
}

export async function validateAdminController(
	request: FastifyRequest,
	_reply: FastifyReply
): Promise<void> {
	const cookieToken = request.cookies?.auth_token
	const authHeader = request.headers.authorization
	let token: string | undefined = cookieToken
	if (!token && authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7)
	}
	if (!token) throw createHttpError.Unauthorized('Missing token')

	try {
		return validateAdminUsecase(token)
	} catch (e: any) {
		if (e && (e.statusCode || e.status)) {
			throw e
		}
		throw createHttpError.Unauthorized('Invalid token')
	}
}

export async function logoutController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const userId = request.user?.user_id

	if (userId === undefined) return
	try {
		await fetch(`${env.GAME_SERVICE_URL}/api/game/internal/cleanup/${userId}`, {
			method: 'POST',
			headers: {
				authorization: env.INTERNAL_API_SECRET
			},
			signal: AbortSignal.timeout(3000)
		})
	} catch (e) {
		console.error(`[Logout] Failed to cleanup user ${userId}:`, e)
	}

	reply.clearCookie('auth_token', { path: '/' })
	reply.clearCookie('twofa_token', { path: '/' })
	return reply.code(200).send()
}

export async function getConfigController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<ConfigResponseDTO> {
	return {
		googleClientId: env.GOOGLE_CLIENT_ID
	}
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import {
	registerUser,
	loginUser
} from '../usecases/register.js'
import {
	RegisterSchema,
	LoginActionSchema
} from '@ft_transcendence/common'
import {
	findPublicUserByLogin
} from '../repositories/userRepository.js'
import { deleteUserById } from '../repositories/userRepository.js'
import { signToken, verifyToken } from '../utils/jwt.js'
import createHttpError from 'http-errors'

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = RegisterSchema.safeParse(request.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { login, password } = parsed.data

	const authApiSecret = process.env.INTERNAL_API_SECRET
	if (!authApiSecret) {
		console.error('INTERNAL_API_SECRET is not defined in environment variables')
		throw createHttpError.InternalServerError('Server configuration error')
	}

	try {
		await registerUser(login, password)
		const PublicUser = findPublicUserByLogin(parsed.data.login)
		if (PublicUser == undefined)
			throw createHttpError.InternalServerError('Database error')

		const url = `${process.env.USERS_SERVICE_URL}/api/internal/users/new-user`
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: authApiSecret
			},
			body: JSON.stringify(PublicUser)
		})
		console.log('response', response)

		if (response.status === 401) {
			deleteUserById(PublicUser.user_id)
			throw createHttpError.Unauthorized(
				'Unauthorized to create user in users service'
			)
		} else if (!response.ok) {
			deleteUserById(PublicUser.user_id)
			throw createHttpError.ServiceUnavailable('Users service unavailable')
		}

		// Auto-login on successful registration
		const token = signToken(
			{
				user_id: PublicUser.user_id,
				login: PublicUser.login,
				is_admin: false,
				type: 'auth'
			},
			'1h'
		)
		reply.setCookie('auth_token', token, {
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60 * 60
		})
		return reply
			.code(201)
			.send({ message: 'User registered successfully', token })
	} catch (e: any) {
		if (
			e &&
			typeof e === 'object' &&
			'code' in e &&
			e.code === 'SQLITE_CONSTRAINT_UNIQUE'
		) {
			throw createHttpError.Conflict('Login already exists')
		}
		// Si c'est déjà une HttpError, rethrow
		if (e && (e.statusCode || e.status)) {
			throw e
		}
		throw createHttpError.InternalServerError('Database error')
	}
}

export async function loginController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = LoginActionSchema.safeParse(request.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { login, password } = parsed.data
	const res = await loginUser(login, password)
	if (!res) throw createHttpError.Unauthorized('Invalid credentials')
	else if (res.pre_2fa_token) {
		reply.setCookie('twofa_token', res.pre_2fa_token, {
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60 * 5
		})
		return reply.send({ pre_2fa_required: true })
	} else if (res.token) {
		reply.setCookie('auth_token', res.token, {
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60 * 60
		})

		// Decode minimal part to know if admin for cookie (no verification needed here)
		return reply.send({
			pre_2fa_required: false,
			token: res.token
		})
	}
}

export async function validateAdminController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const cookieToken = request.cookies?.auth_token
	const authHeader = request.headers.authorization
	let token: string | undefined = cookieToken
	if (!token && authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7)
	}
	if (!token) throw createHttpError.Unauthorized('Missing token')

	try {
		const payload = verifyToken(token)
		if (!payload.is_admin) throw createHttpError.Forbidden('Forbidden')
		return reply.code(200).send({ success: true })
	} catch (e) {
		throw createHttpError.Unauthorized('Invalid token')
	}
}

export async function logoutController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	reply.clearCookie('auth_token', { path: '/' })
	reply.clearCookie('twofa_token', { path: '/' })
	return reply.code(200).send({ success: true })
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import {
	registerUser,
	loginUser,
	registerGoogleUser
} from '../usecases/register.js'
import {
	RegisterSchema,
	LoginActionSchema,
	RegisterGoogleSchema
} from '@ft_transcendence/common'
import {
	findPublicUserByLogin,
	findUserByGoogleId
} from '../repositories/userRepository.js'
import { deleteUserById } from '../repositories/userRepository.js'
import { signToken, verifyToken } from '../utils/jwt.js'

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = RegisterSchema.safeParse(request.body)
	if (!parsed.success)
		return reply.code(400).send({ error: 'Invalid payload - register' })
	const { login, password } = parsed.data

	try {
		const authApiSecret = process.env.INTERNAL_API_SECRET
		if (!authApiSecret) {
			console.error(
				'INTERNAL_API_SECRET is not defined in environment variables'
			)
			return reply.code(500).send({ error: 'Server configuration error' })
		}
		await registerUser(login, password)
		const PublicUser = findPublicUserByLogin(parsed.data.login)
		if (PublicUser == undefined)
			return reply.code(500).send({ error: 'Database error1' })
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
			return reply
				.code(500)
				.send({ error: 'Unauthorized to create user in users service' })
		} else if (response.ok == false) {
			deleteUserById(PublicUser.user_id)
			return reply.code(400).send({ error: 'Synchronisation user db' })
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
		return reply.send({ success: true, token })
	} catch (e: any) {
		if (e.code === 'SQLITE_CONSTRAINT_UNIQUE')
			return reply.code(409).send({ error: 'Login already exists' })
		return reply.code(500).send({ error: 'Database error' })
	}
}

export async function loginController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = LoginActionSchema.safeParse(request.body)
	if (!parsed.success)
		return reply.code(400).send({ error: 'Invalid payload - login controller' })
	const { login, password } = parsed.data
	const res = await loginUser(login, password)
	if (!res) return reply.code(401).send({ error: 'Invalid credentials' })
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
	try {
		const cookieToken = request.cookies?.auth_token
		const authHeader = request.headers.authorization
		let token: string | undefined = cookieToken
		if (!token && authHeader && authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7)
		}
		if (!token) {
			return reply.code(401).send({ success: false, error: 'Missing token' })
		}
		const payload = verifyToken(token)
		if (!payload.is_admin) {
			return reply.code(403).send({ success: false, error: 'Forbidden' })
		}
		return reply.code(200).send({ success: true })
	} catch (e) {
		return reply.code(401).send({ success: false, error: 'Invalid token' })
	}
}

export async function logoutController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		reply.clearCookie('auth_token', { path: '/' })
		reply.clearCookie('twofa_token', { path: '/' })
		return reply.code(200).send({ success: true })
	} catch (e) {
		return reply.code(500).send({ success: false })
	}
}

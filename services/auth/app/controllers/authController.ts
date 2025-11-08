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
		const authApiSecret = process.env.AUTH_API_SECRET
		if (!authApiSecret) {
			console.error('AUTH_API_SECRET is not defined in environment variables')
			return reply.code(500).send({ error: 'Server configuration error' })
		}
		await registerUser(login, password)
		const PublicUser = await findPublicUserByLogin(parsed.data.login)
		console.log('Pulic user = ', PublicUser)
		if (PublicUser == undefined)
			return reply.code(500).send({ error: 'Database error1' })
		const url = `${process.env.USERS_SERVICE_URL}/api/users/new-user`
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

		return reply.send({ success: true })
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

	// Set user auth cookie
	reply.setCookie('auth_token', res.token, {
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 60 * 15
	})

	// Decode minimal part to know if admin for cookie (no verification needed here)
	try {
		const payload: any = JSON.parse(
			Buffer.from(res.token.split('.')[1], 'base64').toString()
		)
		if (payload.is_admin) {
			reply.setCookie('admin_auth', res.token, {
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				path: '/',
				maxAge: 60 * 60
			})
		}
	} catch {
		// ignore payload decoding errors
	}

	return reply.send({ token: res.token })
}

export async function registerGoogleController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	console.log('Register Google controller called')
	const parsed = RegisterGoogleSchema.safeParse(request.body)
	if (!parsed.success) {
		console.log('Invalid payload for Google registration:', parsed.error)
		return reply.code(400).send({ error: 'Invalid payload - register' })
	}
	const { google_id } = parsed.data
	console.log('Google ID received:', google_id)
	const user = findUserByGoogleId(google_id)
	console.log('Existing user with this Google ID:', user)
	if (user) {
		console.log('Google user already exists, logging in')
		return {
			token: signToken({
				user_id: user.user_id,
				login: user.login,
				is_admin: user.is_admin
			})
		}
	}
	try {
		const authApiSecret = process.env.AUTH_API_SECRET
		if (!authApiSecret) {
			console.error('AUTH_API_SECRET is not defined in environment variables')
			return reply.code(500).send({ error: 'Server configuration error' })
		}
		await registerGoogleUser(google_id)
		const PublicUser = await findPublicUserByLogin(`google-${google_id}`)
		console.log('Pulic user = ', PublicUser)
		if (PublicUser == undefined)
			return reply.code(500).send({ error: 'Database error1' })
		const url = `${process.env.USERS_SERVICE_URL}/api/users/new-user`
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: authApiSecret
			},
			body: JSON.stringify(PublicUser)
		})

		if (response.ok == false) {
			deleteUserById(PublicUser.user_id)
			return reply.code(400).send({ error: 'Synchronisation user db' })
		}
		console.log('Registered google user successfully')
		return reply.send({ success: true })
	} catch (e: any) {
		if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			console.log('Google ID already exists....')
			return reply.code(409).send({ error: 'Login already exists' })
		}
		console.log('Database error during Google registration:', e)
		return reply.code(500).send({ error: 'Database error' })
	}
}

export async function validateAdminController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const cookieToken = request.cookies?.admin_auth as string | undefined
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

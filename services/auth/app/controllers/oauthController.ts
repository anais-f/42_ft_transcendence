import type { FastifyReply, FastifyRequest } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import {
	findPublicUserByGoogleId,
	findUserByGoogleId,
	deleteUserById,
	createGoogleUser,
	incrementSessionId,
	getSessionId
} from '../repositories/userRepository.js'
import { signToken } from '../utils/jwt.js'
import createHttpError from 'http-errors'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function googleLoginController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const { credential } = request.body as { credential: string }

	if (!credential) throw createHttpError.BadRequest('Missing Google credential')

	let ticket
	try {
		ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID
		})
	} catch (error) {
		console.error('Google token verification failed:', error)
		throw createHttpError.Unauthorized('Invalid Google token')
	}

	const payload = ticket.getPayload()
	if (!payload || !payload.sub)
		throw createHttpError.Unauthorized('Invalid Google token')

	const google_id = payload.sub
	console.log('Google User Info:', {
		id: google_id,
		email: payload.email,
		name: payload.name
	})
	const user = findUserByGoogleId(google_id)
	if (user) {
		console.log('Google user already exists, logging in')
		if (!user.two_fa_enabled) {
			incrementSessionId(user.user_id)
			const newSessionId = getSessionId(user.user_id) ?? 0

			const authToken = signToken(
				{
					user_id: user.user_id,
					login: user.login,
					session_id: newSessionId,
					is_admin: user.is_admin,
					type: 'auth'
				},
				'1h'
			)
			reply.setCookie('auth_token', authToken, {
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				path: '/',
				maxAge: 60 * 60
			})
			return reply.send({
				pre_2fa_required: false,
				token: authToken
			})
		} else {
			const pre_2fa_token = signToken(
				{
					user_id: user.user_id,
					type: '2fa'
				},
				'5m'
			)
			reply.setCookie('twofa_token', pre_2fa_token, {
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				path: '/',
				maxAge: 60 * 5
			})
			return reply.send({ pre_2fa_required: true })
		}
	} else {
		const authApiSecret = process.env.INTERNAL_API_SECRET
		if (!authApiSecret) {
			console.error('INTERNAL_API_SECRET is not set')
			throw createHttpError.InternalServerError('Server configuration error')
		}

		try {
			createGoogleUser(google_id)
		} catch (e: any) {
			if (e?.code === 'SQLITE_CONSTRAINT_UNIQUE')
				throw createHttpError.Conflict('Google user already exists')
			throw createHttpError.InternalServerError('Database error')
		}

		const PublicUser = findPublicUserByGoogleId(google_id)
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

		if (response.status === 401) {
			deleteUserById(PublicUser.user_id)
			throw createHttpError.BadGateway('Failed to sync user with users service')
		} else if (!response.ok) {
			deleteUserById(PublicUser.user_id)
			throw createHttpError.ServiceUnavailable('Users service unavailable')
		}

		incrementSessionId(PublicUser.user_id)
		const newSessionId = getSessionId(PublicUser.user_id) ?? 0

		const authToken = signToken(
			{
				user_id: PublicUser.user_id,
				login: PublicUser.login,
				session_id: newSessionId,
				is_admin: false,
				type: 'auth'
			},
			'1h'
		)
		reply.setCookie('auth_token', authToken, {
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60 * 60
		})
		return reply.send({ pre_2fa_required: false, token: authToken })
	}
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import { findPublicUserByGoogleId, findUserByGoogleId, deleteUserById } from '../repositories/userRepository.js'
import { signToken } from '../utils/jwt.js'
import { createGoogleUser } from '../repositories/userRepository.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function googleLoginController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const { credential } = request.body as { credential: string }
		
		if (!credential) {
			return reply.code(400).send({ error: 'Missing Google credential' })
		}

		// Vérifier le token JWT avec Google
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID
		})
		
		const payload = ticket.getPayload()
		if (!payload || !payload.sub) {
			return reply.code(401).send({ error: 'Invalid Google token' })
		}
		
		const google_id = payload.sub
		console.log('Google User Info:', { id: google_id, email: payload.email, name: payload.name })
		const user = findUserByGoogleId(google_id)
		if (user) {
			console.log('Google user already exists, logging in')
			if (!user.two_fa_enabled) {
				const authToken = signToken(
					{
						user_id: user.user_id,
						login: user.login,
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
				return reply.send({ pre_2fa_required: true})
			}
		}
		else {
			const authApiSecret = process.env.INTERNAL_API_SECRET
			if (!authApiSecret) {
				console.error('INTERNAL_API_SECRET is not set')
				return reply.code(500).send({ error: 'Server configuration error' })
			}
			createGoogleUser(google_id)
			const PublicUser = findPublicUserByGoogleId(google_id)
			if (PublicUser == undefined) {
				return reply.code(500).send({ error: 'Database error1' })
			}
			const url = `${process.env.USERS_SERVICE_URL}/api/users/new-user`
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
				return reply
					.code(500)
					.send({ error: 'Unauthorized to create user in users service' })
			}
			else if (response.ok == false) {
				deleteUserById(PublicUser.user_id)
				return reply.code(400).send({ error: 'Synchronisation user db' })
			}

			// Auto-login on successful registration
			const authToken = signToken(
				{
					user_id: PublicUser.user_id,
					login: PublicUser.login,
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
	catch (error) {
		console.error('Error in Google login:', error)
		return reply.code(401).send({ error: 'Invalid Google token' })
	}
}

// Garder l'ancien controller pour compatibilité (peut être supprimé plus tard)
export async function googleCallBackController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	return reply.code(410).send({ 
		error: 'OAuth 2.0 flow deprecated. Please use POST /api/login-google with Google Sign-In' 
	})
}

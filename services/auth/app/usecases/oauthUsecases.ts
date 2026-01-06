import { LoginResponseDTO } from '@ft_transcendence/common'
import {
	findUserByGoogleId,
	findPublicUserByGoogleId,
	createGoogleUser,
	deleteUserById
} from '../repositories/userRepository.js'
import { signToken } from '../utils/jwt.js'
import { generateUsername } from './register.js'
import createHttpError from 'http-errors'
import { OAuth2Client } from 'google-auth-library'
import { env } from '../env/checkEnv.js'
import { status2FA } from './twofa.js'

interface SqliteError extends Error {
	code?: string
}

const getGoogleClient = () => {
	return new OAuth2Client(env.GOOGLE_CLIENT_ID || undefined)
}

export async function googleLoginUsecase(
	credential: string,
	givenName?: string
): Promise<{
	response: LoginResponseDTO
	token?: string
	pre2faToken?: string
}> {
	const client = getGoogleClient()

	let ticket
	try {
		ticket = await client.verifyIdToken({
			idToken: credential,
			audience: env.GOOGLE_CLIENT_ID || undefined
		})
	} catch {
		throw createHttpError.Unauthorized('Invalid Google token')
	}

	const payload = ticket.getPayload()
	if (!payload || !payload.sub)
		throw createHttpError.Unauthorized('Invalid Google token')

	const googleId = payload.sub

	const user = findUserByGoogleId(googleId)
	if (user) {
		const is2FAEnabled = await status2FA(user.user_id)
		if (!is2FAEnabled.enabled) {
			const authToken = signToken(
				{
					user_id: user.user_id,
					login: user.login,
					is_admin: user.is_admin,
					type: 'auth'
				},
				'1h'
			)
			return {
				response: {
					pre_2fa_required: false,
					token: authToken
				},
				token: authToken
			}
		} else {
			const pre2faToken = signToken(
				{
					user_id: user.user_id,
					is_admin: user.is_admin,
					type: '2fa'
				},
				'5m'
			)
			return {
				response: { pre_2fa_required: true },
				pre2faToken
			}
		}
	}

	const authApiSecret = env.INTERNAL_API_SECRET
	if (!authApiSecret) {
		throw createHttpError.InternalServerError('Server configuration error')
	}

	try {
		createGoogleUser(googleId)
	} catch (e) {
		const sqliteError = e as SqliteError
		if (sqliteError?.code === 'SQLITE_CONSTRAINT_UNIQUE')
			throw createHttpError.Conflict('Google user already exists')
		throw createHttpError.InternalServerError('Database error')
	}

	const publicUser = findPublicUserByGoogleId(googleId)
	if (publicUser == undefined)
		throw createHttpError.InternalServerError('Database error')

	const newLogin = generateUsername(givenName || payload.given_name || 'user')
	publicUser.login = newLogin

	const url = `${env.USERS_SERVICE_URL}/api/internal/users/new-user`
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: authApiSecret
		},
		body: JSON.stringify(publicUser)
	})

	if (response.status === 401) {
		deleteUserById(publicUser.user_id)
		throw createHttpError.BadGateway("Can't sync user with users service")
	} else if (!response.ok) {
		deleteUserById(publicUser.user_id)
		throw createHttpError.ServiceUnavailable('Users service unavailable')
	}

	const authToken = signToken(
		{
			user_id: publicUser.user_id,
			login: publicUser.login,
			is_admin: false,
			type: 'auth'
		},
		'1h'
	)

	return {
		response: {
			pre_2fa_required: false,
			token: authToken
		},
		token: authToken
	}
}

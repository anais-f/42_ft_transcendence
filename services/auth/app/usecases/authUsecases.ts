import {
	LoginResponseDTO,
	ValidateAdminResponseDTO,
	LogoutResponseDTO,
	ConfigResponseDTO
} from '@ft_transcendence/common'
import { registerUser, loginUser } from './register.js'
import {
	findPublicUserByLogin,
	deleteUserById
} from '../repositories/userRepository.js'
import { signToken, verifyToken } from '../utils/jwt.js'
import createHttpError from 'http-errors'
import { env } from '../index.js'

export async function registerUserUsecase(
	login: string,
	password: string
): Promise<{ publicUser: any; token: string }> {
	const authApiSecret = env.INTERNAL_API_SECRET

	try {
		await registerUser(login, password)
	} catch (e: any) {
		if (e?.code === 'SQLITE_CONSTRAINT_UNIQUE')
			throw createHttpError.Conflict('Login already exists')
		throw createHttpError.InternalServerError('Database error')
	}

	const publicUser = findPublicUserByLogin(login)
	if (publicUser == undefined)
		throw createHttpError.InternalServerError('Database error')

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
		throw createHttpError.BadGateway('Failed to sync user with users service')
	} else if (!response.ok) {
		deleteUserById(publicUser.user_id)
		throw createHttpError.ServiceUnavailable('Users service unavailable')
	}

	const token = signToken(
		{
			user_id: publicUser.user_id,
			login: publicUser.login,
			is_admin: false,
			type: 'auth'
		},
		'1h'
	)

	return { publicUser, token }
}

export async function loginUserUsecase(
	login: string,
	password: string
): Promise<LoginResponseDTO> {
	const res = await loginUser(login, password)

	if (!res) throw createHttpError.Unauthorized('Invalid credentials')

	if (res.pre_2fa_token) {
		return {
			pre_2fa_required: true,
			token: res.pre_2fa_token
		}
	} else if (res.token) {
		return {
			pre_2fa_required: false,
			token: res.token
		}
	}

	throw createHttpError.InternalServerError('Login failed')
}

export function validateAdminUsecase(token: string): ValidateAdminResponseDTO {
	const payload = verifyToken(token)
	if (!payload.is_admin) throw createHttpError.Forbidden('Forbidden')
	return { success: true }
}

export function logoutUsecase(): LogoutResponseDTO {
	return { success: true }
}

export function getConfigUsecase(): ConfigResponseDTO {
	return {
		googleClientId: env.GOOGLE_CLIENT_ID
	}
}

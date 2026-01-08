import type { FastifyReply, FastifyRequest } from 'fastify'
import { LoginResponseDTO } from '@ft_transcendence/common'
import { googleLoginUsecase } from '../usecases/oauthUsecases.js'

export async function googleLoginController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<LoginResponseDTO> {
	const { credential } = request.body as { credential: string }

	const { response, token, pre2faToken } = await googleLoginUsecase(credential)

	if (response.pre_2fa_required && pre2faToken) {
		reply.setCookie('twofa_token', pre2faToken, {
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			path: '/',
			maxAge: 60 * 5
		})
		return { pre_2fa_required: true }
	} else if (!response.pre_2fa_required && token) {
		reply.setCookie('auth_token', token, {
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			path: '/',
			maxAge: 60 * 60 * 4
		})
		return {
			pre_2fa_required: false,
			token
		}
	}

	return response
}

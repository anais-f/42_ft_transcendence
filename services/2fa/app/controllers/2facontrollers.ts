import { FastifyReply, FastifyRequest } from 'fastify'
import { authenticator } from 'otplib'
import {
	verify2FASchema,
	setup2FASchema,
	disable2FASchema,
	status2FASchema
} from '@ft_transcendence/common'
import { encryptSecret, decryptSecret } from '../utils/crypto.js'
import {
	upsertPendingSecret,
	getPendingSecretEnc,
	activateSecret,
	deleteSecret,
	getSecretEnc
} from '../repositories/twofaRepository.js'
import qrcode from 'qrcode'
import createHttpError from 'http-errors'

const SETUP_EXPIRATION_MS = 5 * 60 * 1000 // 5 minutes

export async function setup2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = setup2FASchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { user_id, issuer, label } = parsed.data
	const secret = authenticator.generateSecret()
	const enc = encryptSecret(secret)
	const pendingUntil = Date.now() + SETUP_EXPIRATION_MS
	upsertPendingSecret(user_id, enc, pendingUntil)
	const otpauth_url = authenticator.keyuri(label, issuer, secret)
	const qr_base64 = await qrcode.toDataURL(otpauth_url)

	return reply.code(200).send({
		otpauth_url,
		qr_base64,
		expires_at: new Date(pendingUntil).toISOString()
	})
}

export async function verify2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = verify2FASchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { user_id, twofa_code } = parsed.data
	const pending = getPendingSecretEnc(user_id)

	if (pending) {
		if (req.headers.cookie?.includes('auth_token=') === false) {
			throw createHttpError.Unauthorized('Auth token missing')
		}
		if (pending.pending_until && Date.now() > pending.pending_until) {
			deleteSecret(user_id)
			throw createHttpError.Gone('Setup expired')
		}

		const secret = decryptSecret(pending.secret_enc)
		const ok = authenticator.check(twofa_code, secret)
		if (!ok) throw createHttpError.Unauthorized('Invalid code')

		const activated = activateSecret(user_id)
		if (!activated)
			req.log.warn(`Failed to activate 2FA secret for user ${user_id}`)
		return reply.code(200).send({ success: true, activated: true })
	}

	const activeEnc = getSecretEnc(user_id)
	if (!activeEnc) throw createHttpError.NotFound('No 2FA secret')

	if (req.headers.cookie?.includes('2fa_token=') === false) {
		throw createHttpError.Unauthorized('2FA token missing')
	}

	const activeSecret = decryptSecret(activeEnc)
	const ok = authenticator.check(twofa_code, activeSecret)
	if (!ok) throw createHttpError.Unauthorized('Invalid code')

	return reply.code(200).send({ success: true, activated: false })
}

export async function disable2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = disable2FASchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { user_id } = parsed.data
	deleteSecret(user_id)

	return reply.code(200).send({ success: true })
}

export async function status2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = status2FASchema.safeParse(req.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { user_id } = parsed.data
	const enc = getSecretEnc(user_id)

	return reply.code(200).send({ enabled: !!enc })
}

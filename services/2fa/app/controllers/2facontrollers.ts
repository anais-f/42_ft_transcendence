import { FastifyReply, FastifyRequest } from 'fastify'
import { authenticator } from 'otplib'
import { twofaCodeSchema } from '@ft_transcendence/common'
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

export async function setup2FAController(
	req: FastifyRequest,
	reply: FastifyReply
) {
		try {
			const parsed = setup2FASchema.safeParse(req.body)
			if (!parsed.success)
				return reply.code(400).send({ error: 'Invalid payload' })
			const { user_id, issuer, label } = parsed.data
			const secret = authenticator.generateSecret()
			const enc = encryptSecret(secret)
			const pendingUntil = Date.now() + 5 * 60 * 1000
			upsertPendingSecret(user_id, enc, pendingUntil)
			const otpauth_url = authenticator.keyuri(label, issuer, secret)
			const qr_base64 = await qrcode.toDataURL(otpauth_url)
			return reply.code(200).send({
				otpauth_url,
				qr_base64,
				expires_at: new Date(pendingUntil).toISOString()
			})
		} catch (e) {
			req.log.error(e)
			return reply.code(500).send({ error: 'Internal error' })
		}
	}

	export async function verify2FAController(
		req: FastifyRequest,
		reply: FastifyReply
	) {
		try {
			const parsed = verify2FASchema.safeParse(req.body)
			if (!parsed.success)
				return reply.code(400).send({ error: 'Invalid payload' })
			const { user_id, twofa_code } = parsed.data
			const pending = getPendingSecretEnc(user_id)
			if (pending) {
				if (req.headers.cookie?.includes('auth_token=') === false) {
					return reply.code(401).send({ error: 'Auth token missing' })
				}
				if (pending.pending_until && Date.now() > pending.pending_until) {
					deleteSecret(user_id)
					return reply.code(410).send({ error: 'Setup expired' })
				}
				try {
					const secret = decryptSecret(pending.secret_enc)
					const ok = authenticator.check(twofa_code, secret)
					if (!ok) return reply.code(401).send({ error: 'Invalid code' })
					activateSecret(user_id)
					return reply.code(200).send({ success: true, activated: true })
				} catch (e: any) {
					req.log.error(e)
					return reply
						.code(500)
						.send({ error: '2FA secret decrypt failed - check TOTP_ENC_KEY' })
				}
			}
			const activeEnc = getSecretEnc(user_id)
			if (!activeEnc) return reply.code(404).send({ error: 'No 2FA secret' })
			try {
				if (req.headers.cookie?.includes('2fa_token=') === false) {
					return reply.code(401).send({ error: '2FA token missing' })
				}
				const activeSecret = decryptSecret(activeEnc)
				const ok = authenticator.check(twofa_code, activeSecret)
				if (!ok) return reply.code(401).send({ error: 'Invalid code' })
				return reply.code(200).send({ success: true, activated: false })
			} catch (e: any) {
				req.log.error(e)
				return reply
					.code(500)
					.send({ error: '2FA secret decrypt failed - check TOTP_ENC_KEY' })
			}
		} catch (e) {
			req.log.error(e)
			return reply.code(500).send({ error: 'Internal error' })
		}
	}

	export async function disable2FAController (req: FastifyRequest, reply: FastifyReply) {
		try {
			const parsed = disable2FASchema.safeParse(req.body)
			if (!parsed.success)
				return reply.code(400).send({ error: 'Invalid payload' })
			const { user_id } = parsed.data
			const ok = deleteSecret(user_id)
			return reply.code(200).send({ success: true })
		} catch (e) {
			req.log.error(e)
			return reply.code(500).send({ error: 'Internal error' })
		}
	}

	export async function status2FAController (req: FastifyRequest, reply: FastifyReply) {
		try {
			const parsed = status2FASchema.safeParse(req.body)
			if (!parsed.success)
				return reply.code(400).send({ error: 'Invalid payload' })
			const { user_id } = parsed.data
			const enc = getSecretEnc(user_id)
			return reply.code(200).send({ enabled: !!enc })
		} catch (e) {
			req.log.error(e)
			return reply.code(500).send({ error: 'Internal error' })
		}
	}

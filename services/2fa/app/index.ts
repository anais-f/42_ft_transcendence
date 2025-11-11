import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticator } from 'otplib'
import { runMigrations } from './database/connection.js'
import { encryptSecret, decryptSecret } from './utils/crypto.js'
import {
	upsertPendingSecret,
	getPendingSecretEnc,
	activateSecret,
	deleteSecret,
	getSecretEnc
} from './repositories/twofaRepository.js'
import qrcode from 'qrcode'
import {
	verify2FASchema,
	setup2FASchema,
	disable2FASchema,
	status2FASchema
} from '@ft_transcendence/common'

export const app: FastifyInstance = Fastify({
	logger: { level: 'info' }
})

runMigrations()

function authServiceGuard(req: FastifyRequest, reply: FastifyReply): boolean {
	const secret = req.headers['authorization']
	if (!process.env.TWOFA_API_SECRET) {
		reply.code(500).send({ error: '2FA_API_SECRET not configured' })
		return false
	}
	if (secret !== process.env.TWOFA_API_SECRET) {
		reply.code(401).send({ error: 'Unauthorized' })
		return false
	}
	return true
}

app.post('/api/2fa/setup', async (req: FastifyRequest, reply: FastifyReply) => {
	if (!authServiceGuard(req, reply)) return
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
	} catch (e: any) {
		req.log.error(e)
		return reply.code(500).send({ error: 'Internal error' })
	}
})

app.post('/api/2fa/verify', async (req, reply) => {
	if (!authServiceGuard(req, reply)) return
	try {
		const parsed = verify2FASchema.safeParse(req.body)
		if (!parsed.success)
			return reply.code(400).send({ error: 'Invalid payload' })
		const { user_id, twofa_code } = parsed.data
		const pending = getPendingSecretEnc(user_id)
		if (!pending) return reply.code(404).send({ error: 'No pending 2FA setup' })
		if (pending.pending_until && Date.now() > pending.pending_until) {
			deleteSecret(user_id)
			return reply.code(410).send({ error: 'Setup expired' })
		}
		const secret = decryptSecret(pending.secret_enc)
		const ok = authenticator.check(twofa_code, secret)
		if (!ok) return reply.code(401).send({ error: 'Invalid code' })
		activateSecret(user_id)
		return reply.code(200).send({ success: true })
	} catch (e: any) {
		req.log.error(e)
		return reply.code(500).send({ error: 'Internal error' })
	}
})

app.post('/api/2fa/disable', async (req, reply) => {
	if (!authServiceGuard(req, reply)) return
	try {
		const parsed = disable2FASchema.safeParse(req.body)
		if (!parsed.success)
			return reply.code(400).send({ error: 'Invalid payload' })
		const { user_id } = parsed.data
		const ok = deleteSecret(user_id)
		return reply.code(200).send({ success: ok })
	} catch (e: any) {
		req.log.error(e)
		return reply.code(500).send({ error: 'Internal error' })
	}
})

app.post('/api/2fa/status', async (req, reply) => {
	if (!authServiceGuard(req, reply)) return
	try {
		const parsed = status2FASchema.safeParse(req.body)
		if (!parsed.success)
			return reply.code(400).send({ error: 'Invalid payload' })
		const { user_id } = parsed.data
		const enc = getSecretEnc(user_id)
		return reply.code(200).send({ enabled: !!enc })
	} catch (e: any) {
		req.log.error(e)
		return reply.code(500).send({ error: 'Internal error' })
	}
})

const start = async () => {
	try {
		await app.listen({
			port: parseInt(process.env.PORT as string),
			host: '0.0.0.0'
		})
		app.log.info(
			`2FA Service listening on http://localhost:${process.env.PORT}`
		)
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

if (process.env.NODE_ENV !== 'test') {
	start()
}

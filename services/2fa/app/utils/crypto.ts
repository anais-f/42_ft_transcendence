import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import { env } from '../env/checkEnv.js'

export function encryptSecret(secret: string): string {
	const KEY = env.TOTP_ENC_KEY
	const iv = randomBytes(12)
	const cipher = createCipheriv('aes-256-gcm', KEY, iv)
	const ciphertext = Buffer.concat([
		cipher.update(secret, 'utf8'),
		cipher.final()
	])
	const tag = cipher.getAuthTag()

	return Buffer.concat([iv, tag, ciphertext]).toString('base64')
}

export function decryptSecret(payloadB64: string): string {
	const KEY = env.TOTP_ENC_KEY
	const buf = Buffer.from(payloadB64, 'base64')
	const iv = buf.subarray(0, 12)
	const tag = buf.subarray(12, 28)
	const ct = buf.subarray(28)
	const decipher = createDecipheriv('aes-256-gcm', KEY, iv)
	decipher.setAuthTag(tag)
	const out = Buffer.concat([decipher.update(ct), decipher.final()])

	return out.toString('utf8')
}

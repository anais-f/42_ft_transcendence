import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

// TODO: PROPOSITION: Fail-fast au startup (comme auth service)
// const keyB64 = process.env.TOTP_ENC_KEY
// if (!keyB64) {
// 	throw new Error('TOTP_ENC_KEY environment variable is required')
// }
// const KEY = Buffer.from(keyB64, 'base64')
// if (KEY.length !== 32) {
// 	throw new Error('TOTP_ENC_KEY must decode to 32 bytes (AES-256)')
// }

// VERSION ACTUELLE: Console warn (permet démarrage même si mal configuré)
const keyB64 = process.env.TOTP_ENC_KEY
if (!keyB64) {
	console.warn('TOTP_ENC_KEY not set - secret encryption will fail.')
}
const KEY = keyB64 ? Buffer.from(keyB64, 'base64') : randomBytes(32)
if (KEY.length !== 32)
	console.warn('TOTP_ENC_KEY must decode to 32 bytes (AES-256)')

export function encryptSecret(secret: string): string {
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
	const buf = Buffer.from(payloadB64, 'base64')
	const iv = buf.subarray(0, 12)
	const tag = buf.subarray(12, 28)
	const ct = buf.subarray(28)
	const decipher = createDecipheriv('aes-256-gcm', KEY, iv)
	decipher.setAuthTag(tag)
	const out = Buffer.concat([decipher.update(ct), decipher.final()])

	return out.toString('utf8')
}

import { z } from 'zod'
import { validateEnv, loadOpenAPISchema } from '@ft_transcendence/common'

const envSchema = z
	.object({
		DTO_OPENAPI_FILE: z.string().min(1),
		HOST: z.string().min(1),
		PORT: z.coerce.number().min(1).max(65535),
		JWT_SECRET: z.string().min(1),
		TWOFA_DB_PATH: z.string().min(1),
		TOTP_ENC_KEY: z
			.string()
			.min(1)
			.transform((key) => Buffer.from(key, 'base64'))
			.refine((buffer) => buffer.length === 32, {
				message: 'TOTP_ENC_KEY must decode to 32 bytes (AES-256)'
			}),
	})
	.transform((env) => ({
		HOST: env.HOST,
		PORT: env.PORT,
		JWT_SECRET: env.JWT_SECRET,
		TWOFA_DB_PATH: env.TWOFA_DB_PATH,
		TOTP_ENC_KEY: env.TOTP_ENC_KEY,
		openAPISchema: loadOpenAPISchema(env.DTO_OPENAPI_FILE)
	}))

export type I2faEnv = z.infer<typeof envSchema>

export const env = validateEnv(envSchema)

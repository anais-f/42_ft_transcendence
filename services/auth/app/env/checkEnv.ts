import { z } from 'zod'
import {
	validateEnv,
	loadOpenAPISchema,
	PasswordSchema
} from '@ft_transcendence/common'

const envSchema = z
	.object({
		DTO_OPENAPI_FILE: z.string().min(1),
		HOST: z.string().min(1),
		PORT: z.coerce.number().min(1).max(65535),
		JWT_SECRET: z.string().min(1),
		AUTH_DB_PATH: z.string().min(1),
		PASSWORD_ADMIN: PasswordSchema,
		GOOGLE_CLIENT_ID: z.string().min(1),
		TWOFA_SERVICE_URL: z.string().min(1),
		TWOFA_ISSUER: z.string().default('FtTranscendence'),
		INTERNAL_API_SECRET: z.string().min(1),
		USERS_SERVICE_URL: z.string().min(1),
		GAME_SERVICE_URL: z.string().min(1),
		SWAGGER_HOST: z.string().min(1).default('http://localhost')
	})
	.transform((env) => ({
		HOST: env.HOST,
		PORT: env.PORT,
		JWT_SECRET: env.JWT_SECRET,
		AUTH_DB_PATH: env.AUTH_DB_PATH,
		LOGIN_ADMIN: 'transcendence',
		PASSWORD_ADMIN: env.PASSWORD_ADMIN,
		GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
		TWOFA_SERVICE_URL: env.TWOFA_SERVICE_URL,
		TWOFA_ISSUER: env.TWOFA_ISSUER,
		INTERNAL_API_SECRET: env.INTERNAL_API_SECRET,
		USERS_SERVICE_URL: env.USERS_SERVICE_URL,
		GAME_SERVICE_URL: env.GAME_SERVICE_URL,
		openAPISchema: loadOpenAPISchema(env.DTO_OPENAPI_FILE),
		SWAGGER_HOST: env.SWAGGER_HOST
	}))

export type IAuthEnv = z.infer<typeof envSchema>

export const env = validateEnv(envSchema)

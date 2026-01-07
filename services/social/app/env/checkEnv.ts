import { z } from 'zod'
import { validateEnv, loadOpenAPISchema } from '@ft_transcendence/common'

const envSchema = z
	.object({
		DTO_OPENAPI_FILE: z.string().min(1),
		PORT: z.coerce.number().min(1).max(65535),
		JWT_SECRET: z.string().min(1),
		JWT_SECRET_SOCIAL: z.string().min(1),
		USERS_SERVICE_URL: z.string().min(1),
		INTERNAL_API_SECRET: z.string().min(1),
		SOCIAL_DB_PATH: z.string().min(1),
		SWAGGER_HOST: z.string().min(1).default('https://localhost')
	})
	.transform((env) => ({
		PORT: env.PORT,
		JWT_SECRET: env.JWT_SECRET,
		JWT_SECRET_SOCIAL: env.JWT_SECRET_SOCIAL,
		USERS_SERVICE_URL: env.USERS_SERVICE_URL,
		INTERNAL_API_SECRET: env.INTERNAL_API_SECRET,
		SOCIAL_DB_PATH: env.SOCIAL_DB_PATH,
		openAPISchema: loadOpenAPISchema(env.DTO_OPENAPI_FILE),
		SWAGGER_HOST: env.SWAGGER_HOST
	}))

export const env = validateEnv(envSchema)

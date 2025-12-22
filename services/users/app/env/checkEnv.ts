import { z } from 'zod'
import { validateEnv, loadOpenAPISchema } from '@ft_transcendence/common'

// TODO: Add stricter validation
const envSchema = z
	.object({
		DTO_OPENAPI_FILE: z.string().min(1),
		HOST: z.string().min(1),
		PORT: z.coerce.number().min(1).max(65535),
		JWT_SECRET: z.string().min(1),
		AUTH_SERVICE_URL: z.string().min(1),
		INTERNAL_API_SECRET: z.string().min(1)
	})
	.transform((env) => ({
		HOST: env.HOST,
		PORT: env.PORT,
		JWT_SECRET: env.JWT_SECRET,
		INTERNAL_API_SECRET: env.INTERNAL_API_SECRET,
		AUTH_URL: env.AUTH_SERVICE_URL,
		openAPISchema: loadOpenAPISchema(env.DTO_OPENAPI_FILE)
	}))

export type IUserEnv = z.infer<typeof envSchema>

export function checkEnv(): IUserEnv {
	return validateEnv(envSchema)
}

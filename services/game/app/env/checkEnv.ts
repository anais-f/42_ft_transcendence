import { z } from 'zod'
import { validateEnv, loadOpenAPISchema } from '@ft_transcendence/common'

// TODO: Add stricter validation
const envSchema = z
	.object({
		DTO_OPENAPI_FILE: z.string().min(1),
		HOST: z.string().min(1),
		PORT: z.coerce.number().min(1).max(65535),
		JWT_SECRET: z.string().min(1),
		JWT_SECRET_GAME: z.string().min(1),
		MATCHMAKING_DB_PATH: z.string().min(1)
	})
	.transform((env) => ({
		HOST: `${env.HOST}/game`,
		PORT: env.PORT,
		JWT_SECRET: env.JWT_SECRET,
		JWT_SECRET_GAME: env.JWT_SECRET_GAME,
		MATCHMAKING_DB_PATH: env.MATCHMAKING_DB_PATH,
		openAPISchema: loadOpenAPISchema(env.DTO_OPENAPI_FILE)
	}))

export type IGameEnv = z.infer<typeof envSchema>

export function checkEnv(): IGameEnv {
	return validateEnv(envSchema)
}

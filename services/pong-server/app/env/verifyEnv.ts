import { loadOpenAPISchema } from '@ft_transcendence/common'

export interface IPongServerEnv {
	HOST: string
	PORT: number
	JWT_SECRET: string
	JWT_SECRET_GAME: string
	openAPISchema?: any
}

export function checkEnv(): IPongServerEnv {
	const variables = {
		DTO_OPENAPI_FILE: process.env.DTO_OPENAPI_FILE,
		HOST: process.env.HOST,
		PORT: process.env.PORT,
		JWT_SECRET_GAME: process.env.JWT_SECRET_GAME,
		JWT_SECRET: process.env.JWT_SECRET
	}

	for (const [key, value] of Object.entries(variables)) {
		if (value === undefined || value === '') {
			throw new Error(`${key} is missing or invalid`)
		}
	}

	const openapiSwagger = loadOpenAPISchema(variables.DTO_OPENAPI_FILE as string)
	const HOST = `${variables.HOST}/pong-server`
	const PORT = parseInt(variables.PORT as string)
	const JWT_SECRET_GAME = variables.JWT_SECRET_GAME as string
	const JWT_SECRET = variables.JWT_SECRET as string

	return {
		HOST: HOST,
		PORT: PORT,
		JWT_SECRET: JWT_SECRET,
		JWT_SECRET_GAME: JWT_SECRET_GAME,
		openAPISchema: openapiSwagger
	}
}

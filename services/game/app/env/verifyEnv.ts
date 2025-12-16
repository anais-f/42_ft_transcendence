import { loadOpenAPISchema } from '@ft_transcendence/common'

export interface IGameEnv {
	HOST: string
	PORT: number
	JWT_SECRET: string
	JWT_SECRET_GAME: string
	openAPISchema?: any
}

export function checkEnv(): IGameEnv {
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

	return {
		openAPISchema: loadOpenAPISchema(variables.DTO_OPENAPI_FILE as string),
		HOST: `${variables.HOST}/game`,
		PORT: parseInt(variables.PORT as string),
		JWT_SECRET_GAME: variables.JWT_SECRET_GAME as string,
		JWT_SECRET: variables.JWT_SECRET as string
	}
}

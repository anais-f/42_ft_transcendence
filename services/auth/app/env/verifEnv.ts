import { loadOpenAPISchema } from '@ft_transcendence/common'

export interface IAuthEnv {
	HOST: string
	PORT: number
	JWT_SECRET: string
	AUTH_DB_PATH: string
	NODE_ENV: string
	LOGIN_ADMIN: string
	PASSWORD_ADMIN: string
	GOOGLE_CLIENT_ID: string
	TWOFA_SERVICE_URL: string
	TWOFA_ISSUER: string
	INTERNAL_API_SECRET: string
	USERS_SERVICE_URL: string
	openAPISchema?: any
}

export function checkEnv(): IAuthEnv {
	const variables = {
		DTO_OPENAPI_FILE: process.env.DTO_OPENAPI_FILE,
		HOST: process.env.HOST,
		PORT: process.env.PORT,
		JWT_SECRET: process.env.JWT_SECRET,
		AUTH_DB_PATH: process.env.AUTH_DB_PATH,
		NODE_ENV: process.env.NODE_ENV || 'development',
		LOGIN_ADMIN: process.env.LOGIN_ADMIN,
		PASSWORD_ADMIN: process.env.PASSWORD_ADMIN,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		TWOFA_SERVICE_URL: process.env.TWOFA_SERVICE_URL,
		TWOFA_ISSUER: process.env.TWOFA_ISSUER || 'FtTranscendence',
		INTERNAL_API_SECRET: process.env.INTERNAL_API_SECRET,
		USERS_SERVICE_URL: process.env.USERS_SERVICE_URL
	}

	const required = [
		'DTO_OPENAPI_FILE',
		'HOST',
		'PORT',
		'JWT_SECRET',
		'AUTH_DB_PATH',
		'LOGIN_ADMIN',
		'PASSWORD_ADMIN',
		'TWOFA_SERVICE_URL',
		'INTERNAL_API_SECRET',
		'USERS_SERVICE_URL',
		'GOOGLE_CLIENT_ID'
	]

	for (const key of required) {
		const value = variables[key as keyof typeof variables]
		if (value === undefined || value === '') {
			throw new Error(`${key} is missing or invalid`)
		}
	}

	const env: IAuthEnv = {
		openAPISchema: loadOpenAPISchema(variables.DTO_OPENAPI_FILE as string),
		HOST: variables.HOST as string,
		PORT: parseInt(variables.PORT as string),
		JWT_SECRET: variables.JWT_SECRET as string,
		AUTH_DB_PATH: variables.AUTH_DB_PATH as string,
		NODE_ENV: variables.NODE_ENV as string,
		LOGIN_ADMIN: variables.LOGIN_ADMIN as string,
		PASSWORD_ADMIN: variables.PASSWORD_ADMIN as string,
		GOOGLE_CLIENT_ID: variables.GOOGLE_CLIENT_ID as string,
		TWOFA_SERVICE_URL: variables.TWOFA_SERVICE_URL as string,
		TWOFA_ISSUER: variables.TWOFA_ISSUER as string,
		INTERNAL_API_SECRET: variables.INTERNAL_API_SECRET as string,
		USERS_SERVICE_URL: variables.USERS_SERVICE_URL as string
	}

	return env
}

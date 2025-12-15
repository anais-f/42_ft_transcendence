import { loadOpenAPISchema } from '@ft_transcendence/common'

export interface I2faEnv {
	HOST: string
	PORT: number
	JWT_SECRET: string
	TWOFA_DB_PATH: string
	TOTP_ENC_KEY: Buffer
	NODE_ENV: string
	openAPISchema?: any
}

export function checkEnv(): I2faEnv {
	const variables = {
		DTO_OPENAPI_FILE: process.env.DTO_OPENAPI_FILE,
		HOST: process.env.HOST,
		PORT: process.env.PORT,
		JWT_SECRET: process.env.JWT_SECRET,
		TWOFA_DB_PATH: process.env.TWOFA_DB_PATH,
		TOTP_ENC_KEY: process.env.TOTP_ENC_KEY,
		NODE_ENV: process.env.NODE_ENV || 'development'
	}

	// Check required variables
	const required = [
		'DTO_OPENAPI_FILE',
		'HOST',
		'PORT',
		'JWT_SECRET',
		'TWOFA_DB_PATH',
		'TOTP_ENC_KEY'
	]

	for (const key of required) {
		const value = variables[key as keyof typeof variables]
		if (value === undefined || value === '') {
			throw new Error(`${key} is missing or invalid`)
		}
	}

	// Validate TOTP_ENC_KEY format
	const totpKeyBuffer = Buffer.from(variables.TOTP_ENC_KEY as string, 'base64')
	if (totpKeyBuffer.length !== 32) {
		throw new Error(
			'TOTP_ENC_KEY must decode to 32 bytes (AES-256). ' +
				`Current length: ${totpKeyBuffer.length} bytes`
		)
	}

	const env: I2faEnv = {
		openAPISchema: loadOpenAPISchema(variables.DTO_OPENAPI_FILE as string),
		HOST: `${variables.HOST}/2fa`,
		PORT: parseInt(variables.PORT as string),
		JWT_SECRET: variables.JWT_SECRET as string,
		TWOFA_DB_PATH: variables.TWOFA_DB_PATH as string,
		TOTP_ENC_KEY: totpKeyBuffer,
		NODE_ENV: variables.NODE_ENV as string
	}

	return env
}

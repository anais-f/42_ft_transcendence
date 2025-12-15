import fs from 'fs'

export interface IAuthEnv {
	HOST: string
	PORT: number
	JWT_SECRET: string
	AUTH_DB_PATH: string
	NODE_ENV: 'development' | 'production' | 'test'
	LOGIN_ADMIN: string
	PASSWORD_ADMIN: string
	GOOGLE_CLIENT_ID: string | null
	TWOFA_SERVICE_URL: string
	TWOFA_ISSUER: string
	INTERNAL_API_SECRET: string
	USERS_SERVICE_URL: string
	openAPISchema: any
}

let cachedEnv: IAuthEnv | null = null

/**
 * Initialize and validate all environment variables for the Auth service
 * Should be called once at startup
 */
export function initializeEnv(): void {
	if (cachedEnv) {
		return
	}

	const HOST = process.env.HOST || '0.0.0.0'
	const PORT = parseInt(process.env.PORT || '3000', 10)
	const JWT_SECRET = process.env.JWT_SECRET
	const AUTH_DB_PATH = process.env.AUTH_DB_PATH
	const NODE_ENV = (process.env.NODE_ENV || 'development') as
		| 'development'
		| 'production'
		| 'test'
	const LOGIN_ADMIN = process.env.LOGIN_ADMIN
	const PASSWORD_ADMIN = process.env.PASSWORD_ADMIN
	const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null
	const TWOFA_SERVICE_URL = process.env.TWOFA_SERVICE_URL
	const TWOFA_ISSUER = process.env.TWOFA_ISSUER || 'FtTranscendence'
	const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET
	const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL
	const DTO_OPENAPI_FILE = process.env.DTO_OPENAPI_FILE

	// Validation
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET environment variable is required')
	}

	if (!AUTH_DB_PATH) {
		throw new Error('AUTH_DB_PATH environment variable is required')
	}

	if (!LOGIN_ADMIN || !PASSWORD_ADMIN) {
		throw new Error(
			'Admin credentials are not defined. Set LOGIN_ADMIN and PASSWORD_ADMIN in your .env or Docker secrets'
		)
	}

	if (!TWOFA_SERVICE_URL) {
		throw new Error('TWOFA_SERVICE_URL environment variable is required')
	}

	if (!INTERNAL_API_SECRET) {
		throw new Error('INTERNAL_API_SECRET environment variable is required')
	}

	if (!USERS_SERVICE_URL) {
		throw new Error('USERS_SERVICE_URL environment variable is required')
	}

	if (!DTO_OPENAPI_FILE) {
		throw new Error('DTO_OPENAPI_FILE environment variable is required')
	}

	// Load OpenAPI schema
	let openAPISchema: any
	try {
		const fileContent = fs.readFileSync(DTO_OPENAPI_FILE, 'utf-8')
		openAPISchema = JSON.parse(fileContent)
	} catch (error) {
		throw new Error(
			`Failed to load OpenAPI schema from ${DTO_OPENAPI_FILE}: ${error}`
		)
	}

	cachedEnv = {
		HOST,
		PORT,
		JWT_SECRET,
		AUTH_DB_PATH,
		NODE_ENV,
		LOGIN_ADMIN,
		PASSWORD_ADMIN,
		GOOGLE_CLIENT_ID,
		TWOFA_SERVICE_URL,
		TWOFA_ISSUER,
		INTERNAL_API_SECRET,
		USERS_SERVICE_URL,
		openAPISchema
	}

	console.log('✅ Auth service environment variables validated')
}

/**
 * Get the cached environment variables
 * Must call initializeEnv() first
 */
export function getEnv(): IAuthEnv {
	if (!cachedEnv) {
		throw new Error(
			'Environment not initialized. Call initializeEnv() first at application startup'
		)
	}
	return cachedEnv
}

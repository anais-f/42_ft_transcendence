import 'dotenv/config'

export const ENV = {
	PORT: parseInt(process.env.PORT ?? '3001'),
	DB_PATH: process.env.DB_PATH ?? './db-auth.sqlite',
	USERS_SERVICE_URL: process.env.USERS_SERVICE_URL ?? 'http://localhost:3002',
	OPEN_API_FILE:
		process.env.OPEN_API_FILE ?? '../../../packages/common/openapiDTO.json'
}

import 'dotenv/config'

export const ENV = {
  PORT: parseInt(process.env.PORT ?? '3002'),
  DB_PATH: process.env.DB_PATH ?? './db-users.sqlite',
  AUTH_API_BASE_URL: process.env.AUTH_API_BASE_URL ?? 'http://localhost:3001',
  OPEN_API_FILE: process.env.OPEN_API_FILE ?? '../../../packages/common/openapiDTO.json'
}

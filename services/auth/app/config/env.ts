import 'dotenv/config'

export const ENV = {
  PORT: parseInt(process.env.PORT ?? '3001'),
  DB_PATH: process.env.DB_PATH ?? './db-auth.sqlite',
  USERS_SERVICE_URL: process.env.USERS_SERVICE_URL ?? 'http://localhost:3002'
}

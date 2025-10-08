export const ENV = {
	PORT: parseInt(process.env.PORT || '3001', 10),
	HOST: process.env.HOST || '0.0.0.0',
	JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret',
	DB_PATH: process.env.DB_PATH || './db-auth.sqlite',
}

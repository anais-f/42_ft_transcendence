import Fastify from 'fastify'
import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

const db: Database = new DatabaseConstructor('db.sqlite')

db.exec(
	'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT UNIQUE, name TEXT, password TEXT)'
)

const app = Fastify({
	logger: false
})

const start = async () => {
	try {
		await app.listen({ port: 3000, host: '0.0.0.0' })
		console.log('Listening on port 3000')
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

start()

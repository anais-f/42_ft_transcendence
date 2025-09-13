import Fastify from 'fastify'
import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

// On annote explicitement le type de 'db' pour résoudre l'erreur TS4023.
// L'export reste 'db', donc 'index.ts' n'est pas impacté.
const db: Database = new DatabaseConstructor('auth.sqlite')

db.exec(
	'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login VARCHAR(10) UNIQUE, name VARCHAR(10), password TEXT)'
)
const stmt = db.prepare(
	'INSERT OR IGNORE INTO users (login, name, password) VALUES (?, ?, ?)'
)

stmt.run('anfichet', 'anais fichet', 'passwd')
stmt.run('acancel', 'adrien cancel', 'passwd')
stmt.run('lrio', 'loic rio', 'passwd')
stmt.run('mjuffard', 'michel juffard', 'passwd')

// créer le serveur
const app = Fastify({
	logger: false,
})

// variable pour lancer le serveur
const start = async () => {
	try {
		await app.listen({ port: 3000, host: '0.0.0.0' })
		console.log('Listening on port 3000 auth')
	} catch (err) {
		console.error('Error strating server: ', err)
		process.exit(1)
	}
}

// lancer le serveur
start()

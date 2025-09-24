import Fastify from 'fastify'
import BetterSqlite3 from 'better-sqlite3'
import type { Database as BetterSqlite3Database } from 'better-sqlite3'

const fastify = Fastify({ logger: true })

// Initialisation de la base SQLite
let db!: BetterSqlite3Database

function setupDb() {
    db = new BetterSqlite3('./auth.db')
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `)
}

// Route d'inscription
fastify.post('/register', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string }
    if (!username || !password) {
        return reply.status(400).send({ error: 'Missing username or password' })
    }
    try {
        const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
        stmt.run(username, password)
        return { success: true }
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return reply.status(409).send({ error: 'Username already exists' })
        }
        return reply.status(500).send({ error: 'Database error' })
    }
})

// Route de connexion
fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string }
    if (!username || !password) {
        return reply.status(400).send({ error: 'Missing username or password' })
    }
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
    const user = stmt.get(username, password)
    if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' })
    }
    return { success: true }
})

// Démarrage du serveur
const start = async () => {
    setupDb()
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' })
        console.log('Auth service running on http://localhost:3001')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
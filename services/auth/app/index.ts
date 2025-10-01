import Fastify from 'fastify'
import argon2, { argon2id } from 'argon2'
import BetterSqlite3 from 'better-sqlite3'
import jwt from 'jsonwebtoken'
import type { Database as BetterSqlite3Database } from 'better-sqlite3'

const fastify = Fastify({ logger: true })

let db!: BetterSqlite3Database

type UserRow = {
  id: number
  username: string
  password: string
}

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

async function hashPassword(password: string): Promise<string> {
  const hash = await argon2.hash(password, {
    type: argon2id,
    memoryCost: 65536,
    timeCost: 2,
    parallelism: 1,
  });
  return hash;
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return await argon2.verify(hash, password);
}

fastify.post('/register', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string }
    if (!username || !password) {
        return reply.status(400).send({ error: 'Missing username or password' })
    }
    const hashedPassword = await hashPassword(password)
    try {
        const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
        stmt.run(username, hashedPassword)
        return { success: true }
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return reply.status(409).send({ error: 'Username already exists' })
        }
        return reply.status(500).send({ error: 'Database error' })
    }
})

fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string }
    if (!username || !password) {
        return reply.status(400).send({ error: 'Missing username or password' })
    }
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    const user = stmt.get(username) as UserRow | undefined
    if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' })
    }
    const validPassword = await verifyPassword(user.password, password)
    if (!validPassword) {
        return reply.status(401).send({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ userId: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' })
    return { token }
})

fastify.get('/health', async (request, reply) => {
    if (db) {
        return { status: 'ok' }
    }
    else {
        return reply.status(500).send({ status: 'error', message: 'Database not initialized' })
    }
})

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

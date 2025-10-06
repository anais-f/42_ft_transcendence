import type { FastifyReply, FastifyRequest } from 'fastify'
import { registerUser, loginUser } from '../services/authService.js'

export async function registerController(request: FastifyRequest, reply: FastifyReply) {
  const { username, password } = request.body as { username?: string; password?: string }
  if (!username || !password) {
    return reply.code(400).send({ error: 'Missing username or password' })
  }
  try {
    await registerUser(username, password)
    return reply.send({ success: true })
  } catch (e: any) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return reply.code(409).send({ error: 'Username already exists' })
    }
    return reply.code(500).send({ error: 'Database error' })
  }
}

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  const { username, password } = request.body as { username?: string; password?: string }
  if (!username || !password) {
    return reply.code(400).send({ error: 'Missing username or password' })
  }
  const res = await loginUser(username, password)
  if (!res) return reply.code(401).send({ error: 'Invalid credentials' })
  return reply.send(res)
}
import type { FastifyReply, FastifyRequest } from 'fastify'
import { registerUser, loginUser } from '../usecases/register.js'
import { RegisterSchema, LoginSchema } from '../models/authDTO.js'

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = RegisterSchema.safeParse(request.body)
	if (!parsed.success) return reply.code(400).send({ error: 'Invalid payload' })
	const { username, password } = parsed.data
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

export async function loginController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = LoginSchema.safeParse(request.body)
	if (!parsed.success) return reply.code(400).send({ error: 'Invalid payload' })
	const { username, password } = parsed.data
	if (!username || !password) {
		return reply.code(400).send({ error: 'Missing username or password' })
	}
	const res = await loginUser(username, password)
	if (!res) return reply.code(401).send({ error: 'Invalid credentials' })
	return reply.send(res)
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import { registerUser, loginUser } from '../usecases/register.js'
import { RegisterSchema, LoginSchema } from '../models/authDTO.js'
import { findPublicUserByUsername } from '../repositories/userRepository.js'
import { deleteUserById } from '../repositories/userRepository.js'
import { ENV } from '../config/env.js'

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = RegisterSchema.safeParse(request.body)
	if (!parsed.success) return reply.code(400).send({ error: 'Invalid payload' })
	const { username, password } = parsed.data
	try {
		await registerUser(username, password)
		const PublicUser = findPublicUserByUsername(parsed.data.username)
		if (PublicUser == undefined)
			return reply.code(500).send({ error: 'Database error1' })
		console.log('PublicUser', PublicUser)
		const url = `${ENV.USERS_SERVICE_URL}/users/webhookNewUser`
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(PublicUser)
		})
		if (response.ok == false) {
			deleteUserById(PublicUser.id)
			return reply.code(400).send({ error: 'Synchronisation user db' })
		}
		return reply.send({ success: true })
	} catch (e: any) {
		if (e.code === 'SQLITE_CONSTRAINT_UNIQUE')
			return reply.code(409).send({ error: 'Username already exists' })
		return reply.code(500).send({ error: 'Database error2', message: e.message } )
	}
}

export async function loginController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = LoginSchema.safeParse(request.body)
	if (!parsed.success) return reply.code(400).send({ error: 'Invalid payload' })
	const { username, password } = parsed.data
	const res = await loginUser(username, password)
	if (!res) return reply.code(401).send({ error: 'Invalid credentials' })
	return reply.send(res)
}

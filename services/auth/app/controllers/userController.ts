import type { FastifyReply, FastifyRequest } from 'fastify'
import { getUsers, getUser } from '../usecases/user.js'
import { PublicUserSchema, PublicUserListSchema } from '../models/usersDTO.js'

export async function listUsersController(
	_req: FastifyRequest,
	reply: FastifyReply
) {
	const users = getUsers()
	return reply.send(PublicUserListSchema.parse({ users }))
}

export async function getUserController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const { id } = request.params as { id?: string }
	if (!id) return reply.code(400).send({ error: 'Missing id' })
	const idNum = Number(id)
	if (!Number.isInteger(idNum) || idNum <= 0) {
		return reply.code(400).send({ error: 'Invalid id' })
	}
	const user = getUser(idNum)
	if (!user) return reply.code(404).send({ error: 'User not found' })
	return reply.send(PublicUserSchema.parse(user))
}

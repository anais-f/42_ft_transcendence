import type { FastifyReply, FastifyRequest } from 'fastify'
import { registerUser, loginUser } from '../usecases/register.js'
import {
	RegisterSchema,
	LoginActionSchema,
	PublicUserAuthDTO
} from '@ft_transcendence/common'
import { findPublicUserByLogin } from '../repositories/userRepository.js'
import { deleteUserById } from '../repositories/userRepository.js'

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = RegisterSchema.safeParse(request.body)
	if (!parsed.success)
		return reply.code(400).send({ error: 'Invalid payload - regidster' })
	const { login, password } = parsed.data

	try {
		await registerUser(login, password)
		const PublicUser = (await findPublicUserByLogin(parsed.data.login)) as
			| PublicUserAuthDTO
			| undefined
		console.log('Pulic user = ', PublicUser)
		if (PublicUser == undefined)
			return reply.code(500).send({ error: 'Database error1' })
		const url = `${process.env.USERS_SERVICE_URL}/api/users/new-user`
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: process.env.AUTH_API_SECRET as string
			},
			body: JSON.stringify(PublicUser)
		})
    console.log("response", response)

    if (response.status === 401) {
      deleteUserById(PublicUser.user_id)
      return reply.code(500).send({ error: 'Unauthorized to create user in users service' })
    }
    else if (response.ok == false) {
      deleteUserById(PublicUser.user_id)
      return reply.code(400).send({ error: 'Synchronisation user db' })
    }

		return reply.send({ success: true })
	} catch (e: any) {
		if (e.code === 'SQLITE_CONSTRAINT_UNIQUE')
			return reply.code(409).send({ error: 'Login already exists' })
		return reply.code(500).send({ error: 'Database error' })
	}
}

export async function loginController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = LoginActionSchema.safeParse(request.body)
	if (!parsed.success)
		return reply.code(400).send({ error: 'Invalid payload - login controller' })
	const { login, password } = parsed.data
	const res = await loginUser(login, password)
	if (!res) return reply.code(401).send({ error: 'Invalid credentials' })
	return reply.send(res)
}

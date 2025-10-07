import type { FastifyReply, FastifyRequest } from 'fastify'
import { registerUser, loginUser } from '../usecases/register.js'
import { RegisterSchema, LoginSchema } from '../models/authDTO.js'
import {findPublicUserByUsername} from "../repositories/userRepository.js";

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = RegisterSchema.safeParse(request.body)
	if (!parsed.success) return reply.code(400).send({ error: 'Invalid payload' })
	const { username, password } = parsed.data
	try {
		await registerUser(username, password)
    const newUser = findPublicUserByUsername(parsed.data.username)

    // Webhook SYNCHRONE - doit réussir pour valider la création -> donc pas de onResponse de fastify, ni de preHandler à cause du id_user généré à la création
    const webhookUrl = 'http://localhost:3000/users/webhookNewUser';
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    if (!webhookResponse.ok) {
      // Si le webhook échoue, on annule la création en supprimant l'utilisateur
      // AuthRepository.deleteUser(userId.id_user);
      reply.status(400).send({
        error: `Erreur synchronisation users-account: ${webhookResponse.statusText}`
      });
      return;
    }

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
	const res = await loginUser(username, password)
	if (!res) return reply.code(401).send({ error: 'Invalid credentials' })
	return reply.send(res)
}

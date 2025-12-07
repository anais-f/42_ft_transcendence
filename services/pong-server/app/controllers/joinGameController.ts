import { FastifyRequest, FastifyReply } from 'fastify'
import { createWsToken } from '@ft_transcendence/security'
import { addPlayerToGame } from '../game/gameManager/addPlayerToGame'

// TODO: error handling
export async function joinGameController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id: number; login: string }
	const param = request.params

	console.log('pause')
	console.log(JSON.stringify(param))

	if (!user) {
		reply.code(401).send({ sucess: false, error: 'Unautorized' })
		return
	}

	try {
		addPlayerToGame(param as string, user.user_id)
	} catch (e) {
		reply.code(401).send({ sucess: false, error: 'Unautorized' })
		return
	}
	const token = createWsToken(request.server, user)
	reply.code(201).send(token)
}

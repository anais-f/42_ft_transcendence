import { FastifyRequest, FastifyReply } from 'fastify'
import { requestGame } from '../game/gameManager.js'
import { ERROR_MESSAGES } from '@ft_transcendence/common'

export async function createNewGameController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
	const user = request.user as { user_id: number; login: string };
	if (!user) {
		console.log('user undefined')
		reply
		.code(401)
		.send({ success: false, error: ERROR_MESSAGES.UNAUTHORIZED });
		return;
	}

	let gameId: string;
	try {
		gameId = requestGame({
			code: null,
			pID: user.user_id
		});
	} catch (e) {
		reply.code(401).send({ success: false, error: `error: ${e}` });
		return;
	}

	console.log('youpi')
	reply.code(201).send({ gameID: gameId });
}

import '@fastify/jwt'
import '../fastify.js'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import createHttpError from 'http-errors'

export function jwtAuthMiddleware(
	request: FastifyRequest,
	reply: FastifyReply,
	done: HookHandlerDoneFunction
): void {
	request
		.jwtVerify()
		.then(() => {
			done()
		})
		.catch((err: Error) => {
			console.error('JWT verification failed:', err.message)
			done(createHttpError.Unauthorized('Unauthorized from jwtCheck'))
		})
}

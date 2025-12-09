import {
	FastifyInstance,
	FastifyError,
	FastifyRequest,
	FastifyReply
} from 'fastify'
import { ZodError } from 'zod'

export function setupErrorHandler(app: FastifyInstance): void {
	app.setErrorHandler(
		(error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
			console.error({
				timestamp: new Date().toISOString(),
				method: request.method,
				url: request.url,
				error: {
					name: error.name,
					message: error.message,
					statusCode: error.statusCode
				}
			})

			if (error.statusCode) {
				return reply.code(error.statusCode).send({
					error: error.message
				})
			}

			if (error instanceof ZodError) {
				return reply.code(400).send({
					error: 'Validation error',
					details: error.issues[0]?.message
				})
			}

			return reply.code(500).send({
				error: 'Internal server error'
			})
		}
	)
}

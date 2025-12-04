// Fastify request augmentation for custom properties
import 'fastify'

declare module 'fastify' {
	interface FastifyRequest {
		startTime: [number, number] | null
	}
}

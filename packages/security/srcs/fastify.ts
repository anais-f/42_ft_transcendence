// Runtime shim to ensure a `dist/fastify.js` is emitted so other compiled modules that
// import '../fastify.js' (for typings/augmentations) can resolve at runtime.
import '@fastify/jwt'

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: { user_id: number, login: string }
		user: { user_id: number, login: string }
	}
}

// Make this an explicit module
export {}

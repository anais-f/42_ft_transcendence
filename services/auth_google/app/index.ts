import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fastifyOauth2, {
	OAuth2Namespace,
	FastifyOAuth2Options
} from '@fastify/oauth2'
import {
	httpRequestCounter,
	responseTimeHistogram
} from '@ft_transcendence/common'
import metricPlugin from 'fastify-metrics'
import { getGoogleCredentials } from './secrets.js'

declare module 'fastify' {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace
	}
}

const { clientId, clientSecret } = getGoogleCredentials()

if (!clientId || !clientSecret) {
	console.error(
		'Missing Google OAuth credentials. Provide via env (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET) or Docker secrets (google_client_id/google_client_secret).'
	)
	process.exit(1)
}

const fastify: FastifyInstance = Fastify({
	logger: { level: 'trace' }
})

fastify.addHook('onRequest', (request, reply, done) => {
	;(request as any).startTime = process.hrtime()
	done()
})

fastify.addHook('onResponse', (request, reply) => {
	httpRequestCounter.inc({
		method: request.method,
		route: request.url,
		status_code: reply.statusCode
	})
	const startTime = (request as any).startTime
	if (startTime) {
		const diff = process.hrtime(startTime)
		const responseTimeInSeconds = diff[0] + diff[1] / 1e9
		responseTimeHistogram.observe(
			{
				method: request.method,
				route: request.url,
				status_code: reply.statusCode
			},
			responseTimeInSeconds
		)
	}
})

export const oauth2Options: FastifyOAuth2Options = {
	name: 'googleOAuth2',
	credentials: {
		client: {
			id: clientId,
			secret: clientSecret
		},
		auth: {
			authorizeHost: 'https://accounts.google.com',
			authorizePath: '/o/oauth2/v2/auth',
			tokenHost: 'https://www.googleapis.com',
			tokenPath: '/oauth2/v4/token'
		}
	},
	startRedirectPath: '/login/google',
	callbackUri: 'http://localhost:8080/auth-google/login/google/callback',
	scope: ['email', 'profile']
}

await fastify.register(fastifyOauth2, oauth2Options)

fastify.get(
	'/login/google/callback',
	async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const { token } =
				await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
					request
				)
			const userInfoResponse = await fetch(
				'https://www.googleapis.com/oauth2/v2/userinfo',
				{
					headers: {
						Authorization: `Bearer ${token.access_token}`
					}
				}
			)

			const googleUser = await userInfoResponse.json()
			console.log('Google User Info:', googleUser)
			const authResponse = await fetch('http://auth:3000/api/register-google', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					google_id: googleUser.id
				})
			})
			const { token: myJWT, user } = await authResponse.json()

			return reply.send({ token: myJWT, user })
		} catch (error) {
			fastify.log.error(error)
			return reply.status(500).send({ error: 'OAuth2 authentication failed' })
		}
	}
)

export const app = fastify

const start = async () => {
	try {
		await fastify.register(metricPlugin.default, { endpoint: '/metrics' })
		await fastify.listen({
			port: parseInt(process.env.PORT as string),
			host: '0.0.0.0'
		})
		fastify.log.info('Server listening on http://localhost:3000')
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

if (process.env.NODE_ENV !== 'test') {
	start()
}

export default fastify

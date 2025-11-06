import './database/usersDatabase.js'
import Fastify, { FastifyInstance } from 'fastify'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fs from 'fs'
import { writeFileSync } from 'node:fs'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { usersRoutes } from './routes/usersRoutes.js'
import { UsersServices } from './usecases/usersServices.js'

const OPENAPI_FILE = process.env.DTO_OPENAPI_FILE as string
const HOST = process.env.HOST || 'http://localhost:8080'

function createApp(): FastifyInstance {
	const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)

	const jwtSecret = process.env.JWT_SECRET
	if (!jwtSecret) {
		throw new Error('JWT_SECRET environment variable is required')
	}
	app.register(fastifyJwt, {
		secret: jwtSecret
	})
	app.register(fastifyMultipart)

	const openapiSwagger = loadOpenAPISchema()
	app.register(Swagger as any, {
		openapi: {
			info: {
				title: 'API for Users Service',
				version: '1.0.0'
			},
			servers: [{ url: `${HOST}/users`, description: 'Local server' }],
			components: openapiSwagger.components
		},
		transform: jsonSchemaTransform
	})
	app.register(SwaggerUI as any, {
		routePrefix: '/docs'
	})
	app.register(usersRoutes)
	return app
}

async function dumpOpenAPISchema(app: FastifyInstance): Promise<void> {
	const openapiDoc = app.swagger()
	writeFileSync('./openapi.json', JSON.stringify(openapiDoc, null, 2))
	console.log('Documentation OpenAPI writen in openapi.json')
}

async function initializeUsers(): Promise<void> {
	try {
		console.log('Initializing users from auth service...')
		await UsersServices.syncAllUsersFromAuth()
		console.log('User initialization complete.')
	} catch (error) {
		console.error('Error initializing users:', error)
		throw error
	}
}

export async function start(): Promise<void> {
	const app = createApp()
	try {
		await app.ready()
		await dumpOpenAPISchema(app)
		await initializeUsers()
		await app.listen({
			port: parseInt(process.env.PORT as string),
			host: '0.0.0.0'
		})
		console.log('Listening on port ', process.env.PORT)
		console.log(`Swagger UI available at ${HOST}/users/docs`)
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

function loadOpenAPISchema() {
	try {
		if (!fs.existsSync(OPENAPI_FILE)) {
			console.warn(
				`OpenAPI DTO file not found at ${OPENAPI_FILE} - continuing without OpenAPI components`
			)
			return { components: {} }
		}

		const schemaData = fs.readFileSync(OPENAPI_FILE, 'utf-8')
		return JSON.parse(schemaData)
	} catch (error) {
		console.error('Error loading OpenAPI schema:', error)
		return { components: {} }
	}
}

start()

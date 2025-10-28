import './database/usersDatabase.js'
import Fastify, { FastifyInstance } from 'fastify'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fs from 'fs'
import path from 'path'
import { writeFileSync } from 'node:fs'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { usersRoutes } from './routes/usersRoutes.js'
import { UsersServices } from './usecases/usersServices.js'

const OPENAPI_FILE = path.join(
	process.cwd(),
	process.env.DTO_OPEN_API_FILE as string
)
const HOST = process.env.HOST || 'http://localhost:8080'
const SWAGGER_TITTLE = 'API for Users Service'
const SWAGGER_SERVER_URL = `${HOST}/users`

function createApp(): FastifyInstance {
	const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)
	const openapiSwagger = loadOpenAPISchema()
	app.register(Swagger as any, {
		openapi: {
			info: {
				title: SWAGGER_TITTLE,
				version: '1.0.0'
			},
			servers: [{ url: SWAGGER_SERVER_URL, description: 'Local server' }],
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
		console.log(`Swagger UI available at ${SWAGGER_SERVER_URL}/docs`)
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

function loadOpenAPISchema() {
	try {
		const schemaData = fs.readFileSync(OPENAPI_FILE, 'utf-8')
		return JSON.parse(schemaData)
	} catch (error) {
		console.error('Error loading OpenAPI schema:', error)
		return null
	}
}

start()

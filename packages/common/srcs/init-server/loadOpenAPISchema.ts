import fs from 'fs'
import { FastifyRequest, FastifyReply } from 'fastify'
import { FastifyInstance } from 'fastify'

export function loadOpenAPISchema(OPENAPI_FILE: string) {
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

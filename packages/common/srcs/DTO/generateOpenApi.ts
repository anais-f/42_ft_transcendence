import { createDocument } from 'zod-openapi'
import * as usersSchemas from './usersSchema.js'
import * as authSchemas from './authSchema.js'
import { writeFileSync } from 'node:fs'

const schemas = {
	...usersSchemas,
	...authSchemas
}

const openApiDoc = createDocument({
	openapi: '3.1.0',
	info: {
		title: 'ft_transcendence API',
		version: '1.0.0',
		description: 'API documentation'
	},
	components: {
		schemas
	}
})

writeFileSync('./openapiDTO.json', JSON.stringify(openApiDoc, null, 2))
console.log('OpenAPI Swagger doc generated.')

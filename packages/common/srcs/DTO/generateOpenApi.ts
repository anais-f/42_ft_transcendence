import { createDocument } from 'zod-openapi'
import * as usersSchemas from './usersSchema.js'
import * as authSchemas from './authSchema.js'
import * as twoFaSchemas from './2faSchema.js'
import * as gameSchemas from './gameSchema.js'
import * as matchHistorySchemas from './matchHistorySchema.js'
import * as paramsSchemas from './paramsSchema.js'
import * as socialSchemas from './socialSchema.js'
import * as tournamentSchemas from './tournamentSchema.js'
import * as websocketSchemas from './websocketSchema.js'
import { writeFileSync } from 'node:fs'

const schemas = {
	...usersSchemas,
	...authSchemas,
	...twoFaSchemas,
	...gameSchemas,
	...matchHistorySchemas,
	...paramsSchemas,
	...socialSchemas,
	...tournamentSchemas,
	...websocketSchemas
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

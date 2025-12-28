import { z } from 'zod'

export const MapOptionsSchema = z
	.object({
		paddleShape: z.enum(['classic', 'v']).default('classic'),
		obstacle: z.enum(['none', 'diamonds']).default('none')
	})
	.strict()

export const CreateGameSchema = z
	.object({
		mapOptions: MapOptionsSchema.optional()
	})
	.strict()

export type MapOptionsDTO = z.infer<typeof MapOptionsSchema>
export type CreateGameDTO = z.infer<typeof CreateGameSchema>

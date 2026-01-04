import { z } from 'zod'

export const MapOptionsSchema = z
	.object({
		paddleShape: z
			.enum(['classic', 'v'])
			.default('classic')
			.meta({ description: 'paddle shape' }),
		obstacle: z
			.enum(['none', 'diamonds', 'hexagons'])
			.default('none')
			.meta({ description: 'obstacle shape' })
	})
	.meta({ description: 'game parameter' })
	.strict()

export const CreateGameSchema = z
	.object({
		mapOptions: MapOptionsSchema.optional()
	})
	.strict()

export type MapOptionsDTO = z.infer<typeof MapOptionsSchema>
export type CreateGameDTO = z.infer<typeof CreateGameSchema>

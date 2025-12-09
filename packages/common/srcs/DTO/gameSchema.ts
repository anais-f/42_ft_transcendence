import { z } from 'zod'

export const gameCodeSchema = z.object({
	gameID: z.string().length(9).toUpperCase().meta({ description: 'game code' })
})

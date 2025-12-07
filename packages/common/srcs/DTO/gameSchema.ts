import { z } from 'zod'

export const NewGameSchema = z.object({
	gameID: z.string().length(9).toUpperCase().meta({ description: 'game code' })
})

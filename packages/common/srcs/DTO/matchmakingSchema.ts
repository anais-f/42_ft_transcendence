import { number, z } from 'zod'

export const CreateTournamentSchema = z
	.object({
		numberOfPlayers: z.literal(4)
	})
	.strict()

export const RemoveFromTournamentSchema = z
	.object({
		userId: number().positive()
	})
	.strict()

export type CreateTournamentDTO = z.infer<typeof CreateTournamentSchema>
export type RemoveFromTournamentDTO = z.infer<typeof RemoveFromTournamentSchema>

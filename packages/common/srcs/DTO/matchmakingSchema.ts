import { number, z } from 'zod'

export const CreateTournamentSchema = z
	.object({
		numberOfPlayers: number().refine((val) => [2, 4, 8, 16].includes(val), {
			message:
				'numberOfPlayers must be one of the following values: 2, 4, 8, 16'
		}),
		creatorId: number().positive()
	})
	.strict()

export const RemoveTournamentSchema = z
	.object({
		userId: number().positive()
	})
	.strict()

export type CreateTournamentDTO = z.infer<typeof CreateTournamentSchema>
export type RemoveTournamentDTO = z.infer<typeof RemoveTournamentSchema>

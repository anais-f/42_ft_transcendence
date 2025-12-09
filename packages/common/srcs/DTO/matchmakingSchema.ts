import { number, z } from 'zod'

export const CreateTournamentSchema = z
	.object({
		numberOfPlayers: number().refine((val) => [2, 4, 8, 16].includes(val), {
			message:
				'numberOfPlayers must be one of the following values: 2, 4, 8, 16'
		})
	})
	.strict()

export const RemoveTournamentSchema = z
	.object({
		userId: number().positive()
	})
	.strict()

export const saveMatchShema = z
	.object({
		player1Id: number().positive(),
		player2Id: number().positive(),
		scorePlayer1: number().nonnegative(),
		scorePlayer2: number().nonnegative(),
		idTournament: number(), //-1 if no tournament
		round: number() //-1 no tournament
	})
	.strict()

export type CreateTournamentDTO = z.infer<typeof CreateTournamentSchema>
export type RemoveTournamentDTO = z.infer<typeof RemoveTournamentSchema>

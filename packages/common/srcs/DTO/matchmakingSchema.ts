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
export type RemoveFromTournamentDTO = z.infer<typeof RemoveFromTournamentSchema>
export type saveMatchDTO = z.infer<typeof saveMatchShema>

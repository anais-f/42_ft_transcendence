import { z, number } from 'zod'

export const MatchStatusSchema = z.enum([
	'ongoing',
	'completed',
	'waiting_for_players'
])

export const TournamentStatusSchema = z.enum([
	'pending',
	'ongoing',
	'completed'
])

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

export const MatchTournamentSchema = z.object({
	previousMatchId1: z.number().optional(),
	previousMatchId2: z.number().optional(),
	round: z.number(),
	matchNumber: z.number(),
	player1Id: z.number().optional(),
	player2Id: z.number().optional(),
	winnerId: z.number().optional(),
	status: MatchStatusSchema,
	scorePlayer1: z.number().optional(),
	scorePlayer2: z.number().optional(),
	gameCode: z
		.string()
		.regex(/^G-[A-Z0-9]{5}$/, 'Invalid game code')
		.optional()
})

export const TournamentSchema = z.object({
	status: TournamentStatusSchema,
	maxParticipants: z.number(),
	participants: z.array(z.number()),
	matches: z.array(MatchTournamentSchema)
})

export const GetTournamentResponseSchema = z.object({
	tournament: TournamentSchema
})

export const CreateTournamentResponseSchema = z.object({
	code: z.string(),
	tournament: TournamentSchema
})

export const JoinTournamentResponseSchema = z.object({
	tournament: TournamentSchema
})

export const CreateTournamentRequestSchema = z.object({
	numberOfPlayers: z.number().int().positive()
})

export const TournamentCodeParamSchema = z.object({
	code: z.string()
})

export type MatchStatus = z.infer<typeof MatchStatusSchema>
export type TournamentStatus = z.infer<typeof TournamentStatusSchema>
export type MatchTournamentDTO = z.infer<typeof MatchTournamentSchema>
export type TournamentDTO = z.infer<typeof TournamentSchema>
export type GetTournamentResponseDTO = z.infer<
	typeof GetTournamentResponseSchema
>
export type CreateTournamentResponseDTO = z.infer<
	typeof CreateTournamentResponseSchema
>
export type JoinTournamentResponseDTO = z.infer<
	typeof JoinTournamentResponseSchema
>
export type CreateTournamentRequestDTO = z.infer<
	typeof CreateTournamentRequestSchema
>
export type TournamentCodeParamDTO = z.infer<typeof TournamentCodeParamSchema>

export type CreateTournamentDTO = z.infer<typeof CreateTournamentSchema>
export type RemoveFromTournamentDTO = z.infer<typeof RemoveFromTournamentSchema>

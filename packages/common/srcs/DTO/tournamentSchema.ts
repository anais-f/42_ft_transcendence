import { z, number } from 'zod'

export const MatchStatusSchema = z
	.enum(['ongoing', 'completed', 'waiting_for_players'])
	.meta({ description: 'Status of a match in a tournament' })

export const TournamentStatusSchema = z
	.enum(['pending', 'ongoing', 'completed'])
	.meta({ description: 'Status of a tournament' })

export const CreateTournamentSchema = z
	.object({
		numberOfPlayers: z.literal(4)
	})
	.strict()
	.meta({ description: 'Create a tournament with 4 players' })

export const RemoveFromTournamentSchema = z
	.object({
		userId: number().positive()
	})
	.strict()
	.meta({ description: 'Remove a user from a tournament' })

export const MatchTournamentSchema = z
	.object({
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
	.meta({ description: 'Match details within a tournament bracket' })

export const TournamentSchema = z
	.object({
		status: TournamentStatusSchema,
		maxParticipants: z.number(),
		participants: z.array(z.number()),
		matches: z.array(MatchTournamentSchema)
	})
	.meta({ description: 'Tournament with participants and bracket matches' })

export const GetTournamentResponseSchema = z
	.object({
		tournament: TournamentSchema
	})
	.meta({ description: 'Response containing tournament details' })

export const CreateTournamentResponseSchema = z
	.object({
		code: z.string(),
		tournament: TournamentSchema
	})
	.meta({
		description: 'Response after creating a tournament with code and details'
	})

export const JoinTournamentResponseSchema = z
	.object({
		tournament: TournamentSchema
	})
	.meta({ description: 'Response after joining a tournament' })

export const CreateTournamentRequestSchema = z
	.object({
		numberOfPlayers: z.number().int().positive()
	})
	.meta({
		description:
			'Request to create a tournament with specified number of players'
	})

export const TournamentCodeParamSchema = z
	.object({
		code: z.string()
	})
	.meta({ description: 'Tournament code parameter for joining or retrieving' })

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

import { z } from 'zod'

export const MatchHistoryItemSchema = z
	.object({
		id_match: z.number().int().positive(),
		winner_id: z.number().int().positive(),
		played_at: z.string(), // ISO timestamp from SQLite
		tournament_code: z.string().nullable(), // null if not a tournament match
		round: z.number().int(), // -1 if not a tournament match
		match_number: z.number().int(), // -1 if not a tournament match
		player1_id: z.number().int().positive(),
		player1_score: z.number().int().nonnegative(),
		player2_id: z.number().int().positive(),
		player2_score: z.number().int().nonnegative()
	})
	.strict()

export const MatchHistoryResponseSchema = z
	.object({
		matches: z.array(MatchHistoryItemSchema)
	})
	.strict()

export const PlayerStatsSchema = z
	.object({
		totalGames: z.number().int().nonnegative(),
		totalWins: z.number().int().nonnegative(),
		totalLosses: z.number().int().nonnegative(),
		winRate: z.number().min(0).max(100),
		averageScoreFor: z.number().nonnegative(),
		averageScoreAgainst: z.number().nonnegative()
	})
	.strict()

export const SaveMatchSchema = z
	.object({
		player1Id: z.number().int().positive(),
		player2Id: z.number().int().positive(),
		scorePlayer1: z.number().int().nonnegative(),
		scorePlayer2: z.number().int().nonnegative(),
		tournamentCode: z.string().nullable().optional().default(null),
		round: z.number().int().optional().default(-1),
		matchNumber: z.number().int().optional().default(-1)
	})
	.strict()

export const SaveMatchResponseSchema = z
	.object({
		success: z.boolean(),
		matchId: z.number().int().positive()
	})
	.strict()

export type MatchHistoryItemDTO = z.infer<typeof MatchHistoryItemSchema>
export type MatchHistoryResponseDTO = z.infer<typeof MatchHistoryResponseSchema>
export type PlayerStatsDTO = z.infer<typeof PlayerStatsSchema>
export type SaveMatchDTO = z.infer<typeof SaveMatchSchema>
export type SaveMatchResponseDTO = z.infer<typeof SaveMatchResponseSchema>

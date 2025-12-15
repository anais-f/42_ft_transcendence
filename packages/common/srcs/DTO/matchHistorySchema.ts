import { z } from 'zod'

export const MatchHistoryItemSchema = z.object({
	id_match: z.number().int().positive(),
	winner_id: z.number().int().positive(),
	played_at: z.string(), // ISO timestamp from SQLite
	id_tournament: z.number().int(), // -1 if not a tournament match
	round: z.number().int(), // -1 if not a tournament match
	match_number: z.number().int(), // -1 if not a tournament match
	player1_id: z.number().int().positive(),
	player1_score: z.number().int().nonnegative(),
	player2_id: z.number().int().positive(),
	player2_score: z.number().int().nonnegative()
})

export const MatchHistoryResponseSchema = z.object({
	matches: z.array(MatchHistoryItemSchema)
})

export const SaveMatchSchema = z.object({
	player1Id: z.number().int().positive(),
	player2Id: z.number().int().positive(),
	scorePlayer1: z.number().int().nonnegative(),
	scorePlayer2: z.number().int().nonnegative(),
	tournamentId: z.number().int().optional().default(-1),
	round: z.number().int().optional().default(-1),
	matchNumber: z.number().int().optional().default(-1)
})

export const SaveMatchResponseSchema = z.object({
	success: z.boolean(),
	matchId: z.number().int().positive()
})

export type MatchHistoryItemDTO = z.infer<typeof MatchHistoryItemSchema>
export type MatchHistoryResponseDTO = z.infer<typeof MatchHistoryResponseSchema>
export type SaveMatchDTO = z.infer<typeof SaveMatchSchema>
export type SaveMatchResponseDTO = z.infer<typeof SaveMatchResponseSchema>

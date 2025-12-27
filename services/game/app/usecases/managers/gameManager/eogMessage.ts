export type EogReason = 'score' | 'forfeit'

export interface EogData {
	winnerId: number
	loserId: number
	p1Score: number
	p2Score: number
	reason: EogReason
}

export function createEogMessage(
	winnerId: number,
	loserId: number,
	p1Score: number,
	p2Score: number,
	reason: EogReason
): string {
	const data: EogData = {
		winnerId,
		loserId,
		p1Score,
		p2Score,
		reason
	}
	return JSON.stringify({ type: 'EOG', data })
}

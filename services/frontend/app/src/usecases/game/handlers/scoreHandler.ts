import { S07Score } from '@ft_transcendence/pong-shared/network/Packet/Server/S07.js'
import { gameStore } from '../../gameStore.js'

export function scoreHandler(packet: S07Score) {
	const myScoreEl = document.getElementById('my-score')
	const opponentScoreEl = document.getElementById('opponent-score')

	const isP1 = gameStore.playerSlot === 'p1'
	const myScore = isP1 ? packet.p1Score : packet.p2Score
	const opponentScore = isP1 ? packet.p2Score : packet.p1Score

	if (myScoreEl) {
		myScoreEl.textContent = myScore.toString()
	}
	if (opponentScoreEl) {
		opponentScoreEl.textContent = opponentScore.toString()
	}
}

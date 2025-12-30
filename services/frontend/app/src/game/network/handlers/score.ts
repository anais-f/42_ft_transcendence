import { S07Score } from '@pong-shared/index.js'
import { gameStore } from '../../../usecases/gameStore.js'
import { updateLives } from '../../../components/game/Lives.js'
import { renderer } from '../../core/Renderer.js'

export function scoreHandler(packet: S07Score) {
	const isP1 = gameStore.playerSlot === 'p1'
	const myLives = isP1 ? packet.p1Score : packet.p2Score
	const opponentLives = isP1 ? packet.p2Score : packet.p1Score

	if (packet.maxLives > 0) {
		gameStore.maxLives = packet.maxLives
	}
	const maxLives = gameStore.maxLives
	updateLives('my-lives', myLives, maxLives, 5)
	updateLives('opponent-lives', opponentLives, maxLives, 5)

	if (myLives <= 0 || opponentLives <= 0) {
		const didWin = myLives > opponentLives
		renderer.setGameResult(didWin ? 'win' : 'lose')
	}
}

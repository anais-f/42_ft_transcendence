import { S07Score } from '@ft_transcendence/pong-shared/network/Packet/Server/S07.js'
import { gameStore } from '../../../usecases/gameStore.js'
import { updateLives } from '../../../components/game/Lives.js'

export function scoreHandler(packet: S07Score) {
	const isP1 = gameStore.playerSlot === 'p1'
	const myLives = isP1 ? packet.p1Score : packet.p2Score
	const opponentLives = isP1 ? packet.p2Score : packet.p1Score

	const maxLives = gameStore.maxLives || 10
	updateLives('my-lives', myLives, maxLives)
	updateLives('opponent-lives', opponentLives, maxLives)
}

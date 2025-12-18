import { gameStore } from '../usecases/gameStore.js'
import {
	handleBindGameCanvas,
	handleUnbindGameCanvas
} from '../events/game/bindGameCanvasHandler.js'
import { PlayerComp } from '../components/game/Player.js'
import { handleResizeCanvas } from '../events/game/resizeCanvasHandler.js'

const DEFAULT_AVATAR = '/assets/images/rhino.png'

export const GamePage = (): string => {
	const isP1 = gameStore.playerSlot === 'p1'
	const me = (isP1 ? gameStore.p1 : gameStore.p2) ?? {
		username: 'Me',
		avatar: DEFAULT_AVATAR
	}
	const opponent = (isP1 ? gameStore.p2 : gameStore.p1) ?? {
		username: 'Opponent',
		avatar: DEFAULT_AVATAR
	}

	return `
<div class="min-h-[80vh] w-full flex items-center justify-center p-4">
	<div class="grid gap-8 w-full h-full max-h-[80vh] grid-cols-[1fr_5fr_1fr]">
		${PlayerComp({ username: me.username, avatar: me.avatar, livesID: 'my-lives', maxLives: 10, currentLives: 10 })}
		<div class="flex items-center justify-center max-h-full">
			<div class="w-full aspect-[2/1] bg-transparent border-4 border-black rounded flex items-center justify-center max-h-full">
				<canvas
					id="pong"
					class="w-full h-full"
					style="background: transparent; display: block;">
				</canvas>
			</div>
		</div>
		${PlayerComp({ username: opponent.username, avatar: opponent.avatar, livesID: 'opponent-lives', maxLives: 10, currentLives: 10 })}
	</div>
</div>
	`
}

let resizeHandler: (() => Promise<void>) | null = null

export function attachGameEvents() {
	const canvas = document.getElementById('pong') as HTMLCanvasElement
	if (!canvas) {
		return
	}

	resizeHandler = async () => {
		await handleResizeCanvas()
	}

	resizeHandler()

	window.addEventListener('resize', resizeHandler)

	handleBindGameCanvas()
	console.log('Game page events attached')
}

export function detachGameEvents() {
	if (resizeHandler) {
		window.removeEventListener('resize', resizeHandler)
		resizeHandler = null
	}

	handleUnbindGameCanvas()
}

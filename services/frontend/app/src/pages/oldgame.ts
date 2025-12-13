import { gameStore } from '../usecases/gameStore.js'
import { gameRenderer } from '../usecases/game/gameRenderer.js'
import {
	bindInputHandler,
	unbindInputHandler
} from '../usecases/game/inputHandler.js'

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

	return /*html*/ `
<div class="min-h-[80vh] w-full flex items-center justify-center">

	<div class="grid grid-cols-[0.8fr_1fr_1fr_0.8fr] gap-12 py-4 flex-auto">
		<div class="col-span-1">
				<h1 class="text-2xl text-center underline">${me.username}</h1>
				<h1 id="my-score" class="text-4xl py-8 text-center">0</h1>
				<img src="${me.avatar}" alt="Me" class="w-[80%] object-cover aspect-square object-center select-none mx-auto border-solid border-2 border-black">
		</div>

		<div class="col-span-2 text-center flex-1 my-auto">
			<canvas
			id="pong"
			width="950"
			height="550"
			style="background: transparent; border: solid 4px black; display: block; margin: auto">
			</canvas>
		</div>

		<div class="col-span-1">
				<h1 class="text-2xl text-center underline">${opponent.username}</h1>
				<h1 id="opponent-score" class="text-4xl py-8 text-center">0</h1>
				<img src="${opponent.avatar}" alt="Opponent" class="w-[80%] object-cover aspect-square object-center select-none mx-auto border-solid border-2 border-black">
		</div>

	</div>
</div>
`
}

export function bindGamePage() {
	gameStore.navigatingToGame = false

	const canvas = document.getElementById('pong') as HTMLCanvasElement | null
	if (canvas) {
		gameRenderer.setCanvas(canvas)
	}

	bindInputHandler()
}

export function unbindGamePage() {
	unbindInputHandler()
	gameRenderer.clear()

	const ws = gameStore.getGameSocket()
	if (ws) {
		ws.close()
		gameStore.setGameSocket(null)
	}
}

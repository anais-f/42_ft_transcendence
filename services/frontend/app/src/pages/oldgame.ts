import { gameStore } from '../usecases/gameStore.js'
import { gameRenderer } from '../usecases/game/gameRenderer.js'
import {
	bindInputHandler,
	unbindInputHandler
} from '../usecases/game/inputHandler.js'

const DEFAULT_AVATAR = '/assets/images/rhino.png'

export const GamePage = (): string => {
	const p1 = gameStore.p1 ?? { username: 'Player 1', avatar: DEFAULT_AVATAR }
	const p2 = gameStore.p2 ?? { username: 'Player 2', avatar: DEFAULT_AVATAR }

	return /*html*/ `
<div class="min-h-[80vh] w-full flex items-center justify-center">

	<div class="grid grid-cols-[0.8fr_1fr_1fr_0.8fr] gap-12 py-4 flex-auto">
		<div class="col-span-1">
				<h1 class="text-2xl text-center underline">${p1.username}</h1>
				<h1 id="p1-score" class="text-4xl py-8 text-center">0</h1>
				<img src="${p1.avatar}" alt="Player_1" class="w-[80%] object-cover aspect-square object-center select-none mx-auto border-solid border-2 border-black">
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
				<h1 class="text-2xl text-center underline">${p2.username}</h1>
				<h1 id="p2-score" class="text-4xl py-8 text-center">0</h1>
				<img src="${p2.avatar}" alt="Player_2" class="w-[80%] object-cover aspect-square object-center select-none mx-auto border-solid border-2 border-black">
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

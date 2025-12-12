import { createGameWebSocket } from '../api/game/createGame.js'
import { routeParams } from '../router/Router.js'
import { gameStore } from '../usecases/gameStore.js'
import { wsDispatcher } from '../usecases/game/wsDispatcher.js'
import { currentUser } from '../usecases/userStore.js'

export const LobbyPage = (): string => {
	const code = routeParams.code || gameStore.getGameCode() || 'G-XXXXX'
	const player = currentUser

	return /*html*/ `
<section class="grid grid-cols-4 gap-11">
	<div class="col-span-1 flex flex-col items-start">
		<div class="flex flex-row justify-between pt-10 pb-5 w-full">
			<h1 class="text-2xl select-none ">GAME-TAG:</h1>
			<span id="lobby-code" class="text-2xl ">${code}</span>
		</div>
		<button id="btn-copy" class="generic_btn mb-4">
			Copy Lobby Code
		</button>
		<div class="text-xl py-4 text-justify select-none">
			Dear reader,<br>
			We cordially invit e you to share the code above with a friend so that you can invite them to play.
		</div>
		<div class="news_paragraph">
			<h1 class="text-lg pt-4">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt.</p>
		</div>
	</div>

	<div class="col-span-1 flex flex-col items-start">
		<div class="news_paragraph">
			<p class="text-sm pt-6 pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat.</p>
		</div>
		<h1 class="text-2xl pt-4 pb-1">PLAYER 1</h1>
		<img src="${player?.avatar ?? ''}" alt="Player_1" class="w-[90%] object-cover aspect-square object-center select-none">
		<span class="text-xl pt-2 pb-4">${player?.username ?? ''}</span>
		<div class="news_paragraph">
			<h1 class="text-lg pt-4">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. </p>
		</div>
	</div>

	<div class="col-span-1 flex flex-col items-start">
		<div class="news_paragraph">
			<p class="text-sm pt-6 pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia.</p>
		</div>
		<img src="/assets/images/swords.png" alt="Player_1" class="w-[100%] object-cover aspect-square object-center select-none opacity-30 py-8">
		<button id="btn-ready" class="generic_btn mt-4">
			Ready
		</button>
		<div class="news_paragraph">
			<h1 class="text-lg pt-8">Title</h1>
			<p class="text-sm py-2">Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem.</p>
		</div>
	</div>

	</div>
		<div class="col-span-1 flex flex-col items-start">
			<div class="news_paragraph">
				<p class="text-sm pt-6 pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat.</p>
			</div>
			<h1 class="text-2xl pt-4 pb-1">PLAYER 2</h1>
			<img id="opponent-avatar" src="" alt="Player_2" class="w-[90%] object-cover aspect-square object-center select-none">
			<span id="opponent-username" class="text-xl pt-2 pb-6">Waiting...</span>
			<div class="news_paragraph">
				<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus.</p>
			</div>
		</div>
	</div>
</section>
`
}

let copyHandler: (() => void) | null = null

export function bindLobbyPage() {
	const copyBtn = document.getElementById('btn-copy')
	const codeSpan = document.getElementById('lobby-code')

	if (copyBtn && codeSpan) {
		copyHandler = () => {
			navigator.clipboard.writeText(codeSpan.textContent || '')
			copyBtn.textContent = 'Copied!'
			setTimeout(() => {
				copyBtn.textContent = 'Copy Lobby Code'
			}, 2000)
		}
		copyBtn.addEventListener('click', copyHandler)
	}

	// Connect WebSocket
	const token = gameStore.getSessionToken()
	if (token) {
		const ws = createGameWebSocket(token)
		ws.binaryType = 'arraybuffer'
		gameStore.setGameSocket(ws)

		ws.onopen = () => {
			console.log('WS connected')
		}

		ws.onmessage = wsDispatcher

		ws.onerror = (error) => {
			console.error('WS error:', error)
		}

		ws.onclose = () => {
			window.navigate('/home')
			console.log('WS closed')
		}
	} else {
		window.navigate('/home')
	}
}

export function unbindLobbyPage() {
	const copyBtn = document.getElementById('btn-copy')
	if (copyBtn && copyHandler) {
		copyBtn.removeEventListener('click', copyHandler)
		copyHandler = null
	}

	// close WS only if not navigating to /game
	if (!gameStore.navigatingToGame) {
		const ws = gameStore.getGameSocket()
		if (ws) {
			ws.close()
			gameStore.setGameSocket(null)
		}
	}
}

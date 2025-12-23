import { Button } from '../components/Button.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { createGameWebSocket } from '../api/game/createGame.js'
import { routeParams } from '../router/Router.js'
import { gameStore } from '../usecases/gameStore.js'
import { dispatcher } from '../game/network/dispatcher.js'
import { currentUser } from '../usecases/userStore.js'
import { handleCopyCode } from '../events/lobby/copyCodeHandler.js'
import { oppenentJoinHandler } from '../events/lobby/opponentJoinHandler.js'

export const LobbyPage = (): string => {
	const code = routeParams.code || gameStore.gameCode || 'G-XXXXX'
	const player = currentUser

	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

    <div class="col-4-span-flex">
      <h1 class="title_bloc mb-4">YOU WANNA PLAY ?</h1>
      ${LoremSection({
				variant: 'xs',
				additionalClasses: 'mb-4'
			})}
      <div class="flex flex-row justify-between w-full mb-6">
        <h1 class="text-2xl select-none">GAME-TAG:</h1>
        <span id="lobby-code" class="text-2xl">${code}</span>
      </div>
      ${Button({
				id: 'btn-copy',
				text: 'Copy Lobby Code',
				type: 'button',
				action: 'copy-code',
				additionalClasses: 'mb-4'
			})}
      <p class="text-md text-justify select-none font-special py-4">
        Dear reader,<br>
        We cordially invite you to share the code above with a friend so that you can invite them to play.
      </p>
      ${LoremSection({
				title: 'Invite your friend now !',
				variant: 'fill'
			})}
    </div>

    <div class="col-4-span-flex">
      ${LoremSection({
				variant: 'medium'
			})}
      <div class="flex flex-col justify-between w-full mb-4">
        <h1 class="lobby_font">YOU - <span>${player?.username ?? ''}</span></h1>
        <img id="you_avatar" src="${player?.avatar ?? ''}" alt="You" class="avatar_style">
      </div>
      ${LoremSection({
				title: 'Get ready to play !',
				variant: 'fill'
			})}
    </div>


    <div class="col-4-span-flex">
      ${LoremSection({
				title: 'Welcome to the Lobby',
				variant: 'short'
			})}
      <img src="/assets/images/swords.png" alt="VS" class="img_style">
      ${Button({
				id: 'btn-ready',
				text: 'Waiting...',
				type: 'button',
				action: 'ready-btn',
				additionalClasses: 'mt-4 mb-6'
			})}
      ${LoremSection({
				variant: 'fill'
			})}
    </div>
    
    <div class="col-4-span-flex">
      ${LoremSection({
				variant: 'medium'
			})}
      <div class="flex flex-col justify-between w-full mb-4">
        <h1 class="lobby_font">OPPONENT - <span id="opponent-username">Waiting...</span></h1>
        <img id="opponent-avatar" src="" alt="Opponent" class="avatar_style">
      </div>
      ${LoremSection({
				title: 'Get ready to play !',
				variant: 'fill'
			})}
    </div>

  </section>
`
}

let clickHandler: ((e: Event) => void) | null = null

export async function attachLobbyEvents() {
	const content = document.getElementById('content')
	if (!content) return

	clickHandler = async (e: Event) => {
		const target = e.target as HTMLElement
		const actionButton = target.closest('[data-action]')

		if (actionButton) {
			const action = actionButton.getAttribute('data-action')

			if (action === 'copy-code') {
				handleCopyCode(actionButton as HTMLElement)
			}
		}
	}

	content.addEventListener('click', clickHandler)

	gameStore.setOnOpponentJoin(oppenentJoinHandler)

	// TODO: move this
	const token = gameStore.sessionToken
	if (token) {
		const ws = createGameWebSocket(token)
		ws.binaryType = 'arraybuffer'
		gameStore.gameSocket = ws

		ws.onopen = () => {
			console.log('WS connected')
		}

		ws.onmessage = dispatcher

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

	console.log('Lobby page events attached')
}

export function detachLobbyEvents() {
	const content = document.getElementById('content')
	if (!content) {
		return
	}

	gameStore.setOnOpponentJoin(null)

	if (clickHandler) {
		content.removeEventListener('click', clickHandler)
		clickHandler = null
	}

	// close WS only if not navigating to /game
	if (!gameStore.navigatingToGame) {
		const ws = gameStore.gameSocket
		if (ws) {
			ws.close()
			gameStore.gameSocket = null
		}
	}

	console.log('Lobby page events cleaned up')
}

import { Button } from '../components/Button.js'
import { LoremSection } from '../components/LoremIpsum.js'
import { currentUser } from '../usecases/userStore.js'
import { routeParams } from '../router/Router.js'
import { gameStore } from '../usecases/gameStore.js'

export const TestPage = (): string => {
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
        <h1 class="lobby_font">YOU - ${player?.username ?? ''}</h1>
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
        <h1 id="opponent-username" class="lobby_font">OPPONENT - Waiting...</h1>
        <img id="opponent_avatar" src="" alt="Opponent" class="avatar_style">
      </div>
      ${LoremSection({
				title: 'Get ready to play !',
				variant: 'fill'
			})}
    </div>

  </section>
`
}

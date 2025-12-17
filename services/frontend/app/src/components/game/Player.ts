interface PlayerProps {
	username: string
	avatar: string
	scoreID: string
	position: 'left' | 'right'
	additionalClasses?: string
}

export const PlayerComp = (props: PlayerProps): string => {
	const { username, avatar, scoreID, position, additionalClasses = '' } = props

	const baseClasses =
		'col-span-1 flex flex-col items-center justify-center'

	const classes = `${baseClasses} ${additionalClasses}`.trim()

	return /*html*/ `
    <div class="${classes}">
      <h1 class="text-2xl text-center mb-4">${username}</h1>
      <h1 id="${scoreID}" class="text-5xl text-center mb-4">?</h1>
      <img
        src="${avatar}"
        alt="${username}"
        class="w-[90%] max-w-[150px] object-cover aspect-square object-center select-none mx-auto border-solid border-2 border-black rounded"
      >
    </div>
  `
}

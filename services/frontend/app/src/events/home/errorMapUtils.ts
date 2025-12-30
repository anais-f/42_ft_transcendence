import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'

const remapError: Record<string, string> = {
	'player is already in a game': 'You are already in a game!',
	'a player is already in a game': 'You are already in a game!',
	'player not allowed in this game': 'You are not authorized to join this game',
	'unknow game code': 'Invalid game code!'
}

export function sendGameError(error: string, status: number) {
	if (status === 400) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Invalid game code!'
		})
	} else {
		console.log(error)
		const errorMessage = remapError[error] || error
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: errorMessage
		})
	}
}

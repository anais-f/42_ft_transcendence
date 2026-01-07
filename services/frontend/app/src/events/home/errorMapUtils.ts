import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'

const remapError: Record<string, string> = {
	'player is already in a game': "You're already in a game!",
	'a player is already in a game': "You're already in a game!",
	'player already in a tournament': "You're already in a tournament!",
	'player not allowed in this game': "You're not authorized to join this game.",
	'unknow game code': 'Invalid game code!',
	'User is already in a match': "You're already in a game!",
	'User is already in another tournament': "You're already in a tournament!"
}

export function sendGameError(error: string, status: number) {
	if (status === 400) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Invalid code!'
		})
	} else {
		const errorMessage = remapError[error] || error
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: errorMessage
		})
	}
}

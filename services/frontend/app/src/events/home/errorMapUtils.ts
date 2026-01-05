import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'

const remapError: Record<string, string> = {
	'player is already in a game': 'You are already in a game!',
	'a player is already in a game': 'You are already in a game!',
	'player already in a tournament': 'You are already in a tournament!',
	'player not allowed in this game':
		'You are not authorized to join this game.',
	'unknow game code': 'Invalid game code!',
	'User is already in a match': 'You are already in a game!',
	'User is already in another tournament': 'You are already in a tournament!'
}

export function sendGameError(error: string, status: number) {
	if (status === 400) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Invalid code!'
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

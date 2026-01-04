import { UserByUsernameAPI } from '../../api/usersApi.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { validateUsername } from '../../usecases/userValidation.js'
import { ToastActionType } from '../../types/toast.js'

export async function handleSearchUser(e: Event): Promise<void> {
	e.preventDefault()
	const input = document.getElementById('search-user') as HTMLInputElement

	const username = validateUsername(input?.value)
	if (!username.success) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: username.error
		})
		return
	}

	const user = await UserByUsernameAPI(username.data)
	if (!user) {
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'User not found'
		})
		return
	}

	window.navigate(`/profile/${user.user_id}`)
}

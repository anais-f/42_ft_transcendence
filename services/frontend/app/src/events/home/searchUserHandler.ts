import { fetchUserByUsername } from '../../api/usersService.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { validateUsername } from '../../utils/userValidation.js'

export async function handleSearchUser(e: Event): Promise<void> {
	e.preventDefault()
	const input = document.getElementById('search-user') as HTMLInputElement

	const username = validateUsername(input?.value)
	if (!username.success) {
		notyf.error(username.error)
		return
	}

	const user = await fetchUserByUsername(username.data)
	if (!user) {
		notyf.error('User not found')
		return
	}

	window.navigate(`/profile/${user.user_id}`)
}

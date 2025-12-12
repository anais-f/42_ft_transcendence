import { IPublicProfileUser } from '@ft_transcendence/common'

export async function fetchUserById(userId: number): Promise<IPublicProfileUser | null> {
	try {
		const response = await fetch(`/users/api/users/profile/${userId}`, {
			method: 'GET',
			credentials: 'include'
		})

		if (!response.ok) return null

		return (await response.json()) as IPublicProfileUser
	} catch (error) {
		console.error('Failed to fetch user:', error)
		return null
	}
}

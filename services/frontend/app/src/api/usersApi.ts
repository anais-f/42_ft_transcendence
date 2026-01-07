import { IPublicProfileUser } from '@ft_transcendence/common'
import { IApiResponse } from '../types/api.js'

export async function userByIdAPI(userId: number): Promise<IApiResponse> {
	try {
		const response = await fetch(`/users/api/users/profile/${userId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		})

		if (!response.ok) {
			const errorData = await response.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Failed to fetch user',
				status: errorData.statusCode || response.status
			}
		}

		const data = await response.json()
		return { data, error: null, status: response.status }
	} catch (error) {
		console.error('Failed to fetch user:', error)
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function userByUsernameAPI(
	username: string
): Promise<IPublicProfileUser | null> {
	try {
		const response = await fetch(
			`/users/api/users/search-by-username?username=${username}`,
			{
				method: 'GET',
				credentials: 'include'
			}
		)

		if (!response.ok) return null

		return (await response.json()) as IPublicProfileUser
	} catch (error) {
		console.error('Failed to fetch user:', error)
		return null
	}
}

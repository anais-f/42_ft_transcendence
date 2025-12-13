import { IPrivateUser } from '@ft_transcendence/common'

// Global variable to usecases current authenticated user
export let currentUser: IPrivateUser | null = null

export function setCurrentUser(user: IPrivateUser | null): void {
	currentUser = user
}

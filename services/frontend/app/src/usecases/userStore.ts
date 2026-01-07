import { IPrivateUser } from '@ft_transcendence/common'

export let currentUser: IPrivateUser | null = null

export function setCurrentUser(user: IPrivateUser | null): void {
	currentUser = user
}

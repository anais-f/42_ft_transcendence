import type { UserProfile } from '../auth/old_authService.js'

// Global variable to store current authenticated user
export let currentUser: UserProfile | null = null

export function setCurrentUser(user: UserProfile | null): void {
	currentUser = user
}

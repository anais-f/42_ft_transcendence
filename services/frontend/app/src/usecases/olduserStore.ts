import type { UserProfile } from '../api/old_authService.js'

// Global variable to usecases current authenticated user
export let currentUser: UserProfile | null = null

export function setCurrentUser(user: UserProfile | null): void {
	currentUser = user
}

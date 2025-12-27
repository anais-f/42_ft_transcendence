import { totalRegisteredUsersGauge } from '@ft_transcendence/monitoring'
import { UsersRepository } from '../repositories/usersRepository.js'

/**
 * Update user-related Prometheus metrics
 */
export function updateUserMetrics(): void {
	const totalUsers = UsersRepository.getTotalUsersCount()
	totalRegisteredUsersGauge.set(totalUsers)

	console.log(`[Metrics] Total registered users: ${totalUsers}`)
}

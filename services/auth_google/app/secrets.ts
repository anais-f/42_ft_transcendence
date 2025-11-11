import { readSecret } from '@ft_transcendence/common'

export function getGoogleCredentials(): {
	clientId?: string
	clientSecret?: string
} {
	const clientId = process.env.GOOGLE_CLIENT_ID
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET
	return { clientId, clientSecret }
}

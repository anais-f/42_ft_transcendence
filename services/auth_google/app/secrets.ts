import { readSecret } from '@ft_transcendence/common'

export function getGoogleCredentials(): {
	clientId?: string
	clientSecret?: string
} {
	const clientId =
		process.env.GOOGLE_CLIENT_ID || readSecret('google_client_id')
	const clientSecret =
		process.env.GOOGLE_CLIENT_SECRET || readSecret('google_client_secret')
	return { clientId, clientSecret }
}

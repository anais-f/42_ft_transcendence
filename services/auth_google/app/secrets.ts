import { readSecret } from '@ft_transcendence/common'

export function getGoogleCredentials(): {
	clientId?: string
	clientSecret?: string
} {
	const clientId =
		readSecret('google_client_id') || process.env.GOOGLE_CLIENT_ID
	const clientSecret =
		readSecret('google_client_secret') || process.env.GOOGLE_CLIENT_SECRET
	return { clientId, clientSecret }
}

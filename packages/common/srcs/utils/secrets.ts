import { readFileSync } from 'fs'

/**
 * Reads a docker secret mounted at /run/secrets/<name> or an environment variable.
 * Environment variable name is derived from the secret name by uppercasing and
 * replacing non-alphanumeric characters with underscores (e.g. google_client_id -> GOOGLE_CLIENT_ID).
 * Returns undefined if neither is present.
 */
export function readSecret(name: string): string | undefined {
	const envName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
	if (process.env[envName]) return process.env[envName]
	try {
		return readFileSync(`/run/secrets/${name}`, 'utf8').trim()
	} catch {
		return undefined
	}
}

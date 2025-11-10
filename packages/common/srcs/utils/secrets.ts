import { readFileSync } from 'fs'

/**
 * Reads a docker secret mounted at /run/secrets/<name>.
 * Returns undefined if the file does not exist or cannot be read.
 */
export function readSecret(name: string): string | undefined {
	try {
		return readFileSync(`/run/secrets/${name}`, 'utf8').trim()
	} catch {
		return undefined
	}
}

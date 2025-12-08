import createError from 'http-errors'
import { gameErrorMap } from './errorMap.js'

export function withGameError<T>(fn: () => T): T {
	try {
		return fn()
	} catch (e) {
		if (e instanceof Error && e.message in gameErrorMap) {
			throw createError(gameErrorMap[e.message], e.message)
		}
		throw createError(500, 'Internal server error')
	}
}

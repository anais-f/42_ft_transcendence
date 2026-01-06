import createError from 'http-errors'
import { gameErrorMap } from './errorMap.js'
import createHttpError from 'http-errors'

export function withGameError<T>(fn: () => T): T {
	try {
		return fn()
	} catch (e) {
		if (e instanceof Error && e.message in gameErrorMap) {
			throw createError(gameErrorMap[e.message], e.message)
		}
		throw createHttpError.InternalServerError()
	}
}

import { describe, test, expect } from '@jest/globals'
import AppError, { ERROR_MESSAGES, SUCCESS_MESSAGES } from './errorsMap.js'

describe('errorsMap', () => {
	test('AppError stores message and status', () => {
		const e = new AppError('Boom', 418)
		expect(e.message).toBe('Boom')
		expect(e.status).toBe(418)
		expect(e).toBeInstanceOf(Error)
	})

	test('ERROR_MESSAGES contains expected keys', () => {
		const keys = Object.keys(ERROR_MESSAGES)
		expect(keys).toEqual(
			expect.arrayContaining([
				'USER_NOT_FOUND',
				'USER_ALREADY_EXISTS',
				'INVALID_USER_DATA',
				'INTERNAL_ERROR',
				'UNAUTHORIZED',
				'FORBIDDEN'
			])
		)
	})

	test('SUCCESS_MESSAGES contains expected keys', () => {
		const keys = Object.keys(SUCCESS_MESSAGES)
		expect(keys).toEqual(
			expect.arrayContaining(['USER_CREATED', 'USER_UPDATED'])
		)
	})
})

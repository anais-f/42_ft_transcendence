/**
 * @file updateUsersControllers.test.ts
 * @description Tests for Update Users Controllers
 *
 * Test Suite Summary:
 * 1. updateUsername - Update username (JWT protected)
 * 2. updateAvatar - Update avatar (JWT protected)
 */

import { jest } from '@jest/globals'
import type { FastifyRequest, FastifyReply } from 'fastify'

let updateUsername: any
let updateAvatar: any
let UpdateUsersServices: any
let ERROR_MESSAGES: any
let SUCCESS_MESSAGES: any

beforeAll(async () => {
	await jest.unstable_mockModule('../usecases/updateUsersServices.js', () => ({
		UpdateUsersServices: {
			updateUsernameProfile: jest.fn(),
			checkUserAvatar: jest.fn()
		}
	}))

	const common = await import('@ft_transcendence/common')
	ERROR_MESSAGES = common.ERROR_MESSAGES
	SUCCESS_MESSAGES = common.SUCCESS_MESSAGES
	;({ UpdateUsersServices } =
		await import('../usecases/updateUsersServices.js'))
	;({ updateUsername, updateAvatar } =
		await import('./updateUsersControllers.js'))
})

const createMockRequest = (
	body?: any,
	user?: any,
	headers?: any,
	file?: any
): FastifyRequest =>
	({
		body,
		user,
		headers: headers || {},
		file: file ? jest.fn().mockResolvedValue(file) : undefined
	}) as any

const createMockReply = (): FastifyReply => {
	const reply: any = {
		code: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis()
	}
	return reply
}

describe('Update Users Controllers', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	// ===========================================
	// 1. UPDATE USERNAME - SUCCESS
	// ===========================================
	describe('updateUsername - Success', () => {
		it('should update username successfully', async () => {
			const req = createMockRequest({ username: 'newusername' }, { user_id: 1 })
			const reply = createMockReply()

			UpdateUsersServices.updateUsernameProfile.mockResolvedValueOnce(undefined)

			await updateUsername(req, reply)

			expect(UpdateUsersServices.updateUsernameProfile).toHaveBeenCalledWith(
				{ user_id: 1 },
				'newusername'
			)
			expect(reply.code).toHaveBeenCalledWith(200)
			expect(reply.send).toHaveBeenCalledWith({
				success: true,
				message: SUCCESS_MESSAGES.USER_UPDATED
			})
		})
	})

	// ===========================================
	// 1. UPDATE USERNAME - ERRORS
	// ===========================================
	describe('updateUsername - Errors', () => {
		it('should return 400 for invalid user_id', async () => {
			const req = createMockRequest({ username: 'test' }, { user_id: 0 })
			const reply = createMockReply()

			await updateUsername(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.INVALID_USER_ID
			})
		})

		it('should return 400 for missing user_id', async () => {
			const req = createMockRequest({ username: 'test' }, {})
			const reply = createMockReply()

			await updateUsername(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
		})

		it('should return 400 for invalid username format', async () => {
			const req = createMockRequest({ username: '' }, { user_id: 1 })
			const reply = createMockReply()

			await updateUsername(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
		})

		it('should return 409 when username already taken', async () => {
			const req = createMockRequest(
				{ username: 'existinguser' },
				{ user_id: 1 }
			)
			const reply = createMockReply()

			const AppError = (await import('@ft_transcendence/common')).AppError
			UpdateUsersServices.updateUsernameProfile.mockRejectedValueOnce(
				new AppError(ERROR_MESSAGES.USERNAME_ALREADY_TAKEN, 409)
			)

			await updateUsername(req, reply)

			expect(reply.code).toHaveBeenCalledWith(409)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.USERNAME_ALREADY_TAKEN
			})
		})

		it('should return 404 when user not found', async () => {
			const req = createMockRequest({ username: 'newname' }, { user_id: 999 })
			const reply = createMockReply()

			const AppError = (await import('@ft_transcendence/common')).AppError
			UpdateUsersServices.updateUsernameProfile.mockRejectedValueOnce(
				new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
			)

			await updateUsername(req, reply)

			expect(reply.code).toHaveBeenCalledWith(404)
		})
	})

	// ===========================================
	// 2. UPDATE AVATAR - SUCCESS
	// ===========================================
	describe('updateAvatar - Success', () => {
		it('should upload avatar successfully (multipart)', async () => {
			const mockFile = {
				file: (async function* () {
					yield Buffer.from('fake-image-data')
				})(),
				filename: 'avatar.png',
				mimetype: 'image/png'
			}

			const req = createMockRequest(
				null,
				{ user_id: 1 },
				{ 'content-type': 'multipart/form-data; boundary=---' },
				mockFile
			)
			const reply = createMockReply()

			UpdateUsersServices.checkUserAvatar.mockResolvedValueOnce(true)

			await updateAvatar(req, reply)

			expect(UpdateUsersServices.checkUserAvatar).toHaveBeenCalled()
			expect(reply.code).toHaveBeenCalledWith(200)
			expect(reply.send).toHaveBeenCalledWith({
				success: true,
				message: SUCCESS_MESSAGES.USER_UPDATED
			})
		})

		it('should upload avatar successfully (binary)', async () => {
			const imageBuffer = Buffer.from('fake-image-data')
			const req = createMockRequest(
				imageBuffer,
				{ user_id: 1 },
				{ 'content-type': 'image/png' }
			)
			const reply = createMockReply()

			UpdateUsersServices.checkUserAvatar.mockResolvedValueOnce(true)

			await updateAvatar(req, reply)

			expect(UpdateUsersServices.checkUserAvatar).toHaveBeenCalled()
			expect(reply.code).toHaveBeenCalledWith(200)
		})
	})

	// ===========================================
	// 2. UPDATE AVATAR - ERRORS
	// ===========================================
	describe('updateAvatar - Errors', () => {
		it('should return 400 for invalid user_id', async () => {
			const req = createMockRequest(
				Buffer.from('data'),
				{ user_id: 0 },
				{ 'content-type': 'image/png' }
			)
			const reply = createMockReply()

			await updateAvatar(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.INVALID_USER_ID
			})
		})

		it('should return 400 for missing file (multipart)', async () => {
			const req = {
				user: { user_id: 1 },
				headers: { 'content-type': 'multipart/form-data; boundary=---' },
				file: jest.fn().mockResolvedValue(null)
			} as any
			const reply = createMockReply()

			await updateAvatar(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.MISSING_FILE
			})
		})

		it('should return 400 for missing file (binary)', async () => {
			const req = createMockRequest(
				'not a buffer',
				{ user_id: 1 },
				{ 'content-type': 'image/png' }
			)
			const reply = createMockReply()

			await updateAvatar(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.MISSING_FILE
			})
		})

		it('should return 400 for empty buffer', async () => {
			const emptyBuffer = Buffer.alloc(0)
			const req = createMockRequest(
				emptyBuffer,
				{ user_id: 1 },
				{ 'content-type': 'image/png' }
			)
			const reply = createMockReply()

			await updateAvatar(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.MISSING_FILE
			})
		})

		it('should return 400 for invalid image type', async () => {
			const imageBuffer = Buffer.from('fake-image-data')
			const req = createMockRequest(
				imageBuffer,
				{ user_id: 1 },
				{ 'content-type': 'image/png' }
			)
			const reply = createMockReply()

			const AppError = (await import('@ft_transcendence/common')).AppError
			UpdateUsersServices.checkUserAvatar.mockRejectedValueOnce(
				new AppError('Invalid image type', 400)
			)

			await updateAvatar(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: 'Invalid image type'
			})
		})

		it('should return 500 for unexpected errors', async () => {
			const imageBuffer = Buffer.from('fake-image-data')
			const req = createMockRequest(
				imageBuffer,
				{ user_id: 1 },
				{ 'content-type': 'image/png' }
			)
			const reply = createMockReply()

			UpdateUsersServices.checkUserAvatar.mockRejectedValueOnce(
				new Error('File system error')
			)

			await updateAvatar(req, reply)

			expect(reply.code).toHaveBeenCalledWith(500)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.INTERNAL_ERROR
			})
		})
	})
})

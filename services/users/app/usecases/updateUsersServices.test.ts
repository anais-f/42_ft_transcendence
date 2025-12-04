// /**
//  * @file updateUsersServices.test.ts
//  * @description Tests for UpdateUsersServices
//  *
//  * Test Suite Summary:
//  * 1. updateUsernameProfile - Update username with validation
//  * 2. checkUserAvatar - Validate and save avatar
//  */
//
// import { jest } from '@jest/globals'
//
// let UpdateUsersServices: any
// let UsersRepository: any
// let AppError: any
// let ERROR_MESSAGES: any
//
// beforeAll(async () => {
// 	await jest.unstable_mockModule('../repositories/usersRepository.js', () => ({
// 		UsersRepository: {
// 			updateUsername: jest.fn(),
// 			updateUserAvatar: jest.fn()
// 		}
// 	}))
//
// 	await jest.unstable_mockModule('fs/promises', () => ({
// 		default: {
// 			mkdir: jest.fn(),
// 			writeFile: jest.fn(),
// 			rename: jest.fn(),
// 			unlink: jest.fn(),
// 			readdir: jest.fn()
// 		}
// 	}))
//
// 	// Mock file-type to return expected MIME types
// 	await jest.unstable_mockModule('file-type', () => ({
// 		fileTypeFromBuffer: jest.fn()
// 	}))
//
// 	const common = await import('@ft_transcendence/common')
// 	AppError = common.AppError
// 	ERROR_MESSAGES = common.ERROR_MESSAGES
// 	;({ UsersRepository } = await import('../repositories/usersRepository.js'))
// 	;({ UpdateUsersServices } = await import('./updateUsersServices.js'))
// })
//
// describe('UpdateUsersServices', () => {
// 	beforeEach(() => {
// 		jest.clearAllMocks()
// 	})
//
// 	// ===========================================
// 	// 1. UPDATE USERNAME - SUCCESS
// 	// ===========================================
// 	describe('updateUsernameProfile - Success', () => {
// 		it('should update username successfully', async () => {
// 			UsersRepository.updateUsername.mockResolvedValueOnce(undefined)
//
// 			await UpdateUsersServices.updateUsernameProfile(
// 				{ user_id: 1 },
// 				'newusername'
// 			)
//
// 			expect(UsersRepository.updateUsername).toHaveBeenCalledWith({
// 				user_id: 1,
// 				username: 'newusername'
// 			})
// 		})
// 	})
//
// 	// ===========================================
// 	// 1. UPDATE USERNAME - ERRORS
// 	// ===========================================
// 	describe('updateUsernameProfile - Errors', () => {
// 		it('should throw 400 error for invalid user_id (0)', async () => {
// 			await expect(
// 				UpdateUsersServices.updateUsernameProfile({ user_id: 0 }, 'test')
// 			).rejects.toThrow(ERROR_MESSAGES.INVALID_USER_ID)
//
// 			expect(UsersRepository.updateUsername).not.toHaveBeenCalled()
// 		})
//
// 		it('should throw 400 error for invalid user_id (negative)', async () => {
// 			await expect(
// 				UpdateUsersServices.updateUsernameProfile({ user_id: -1 }, 'test')
// 			).rejects.toThrow(ERROR_MESSAGES.INVALID_USER_ID)
//
// 			expect(UsersRepository.updateUsername).not.toHaveBeenCalled()
// 		})
//
// 		it('should throw 400 error for missing user_id', async () => {
// 			await expect(
// 				UpdateUsersServices.updateUsernameProfile(
// 					{ user_id: undefined },
// 					'test'
// 				)
// 			).rejects.toThrow(ERROR_MESSAGES.INVALID_USER_ID)
//
// 			expect(UsersRepository.updateUsername).not.toHaveBeenCalled()
// 		})
//
// 		it('should throw 409 error when username already taken', async () => {
// 			UsersRepository.updateUsername.mockRejectedValueOnce(
// 				new AppError(ERROR_MESSAGES.USERNAME_ALREADY_TAKEN, 409)
// 			)
//
// 			await expect(
// 				UpdateUsersServices.updateUsernameProfile(
// 					{ user_id: 1 },
// 					'existinguser'
// 				)
// 			).rejects.toThrow(ERROR_MESSAGES.USERNAME_ALREADY_TAKEN)
// 		})
//
// 		it('should throw 404 error when user not found', async () => {
// 			UsersRepository.updateUsername.mockRejectedValueOnce(
// 				new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
// 			)
//
// 			await expect(
// 				UpdateUsersServices.updateUsernameProfile({ user_id: 999 }, 'newname')
// 			).rejects.toThrow(ERROR_MESSAGES.USER_NOT_FOUND)
// 		})
// 	})
//
// 	// ===========================================
// 	// 2. CHECK USER AVATAR - SUCCESS
// 	// ===========================================
// 	describe('checkUserAvatar - Success', () => {
// 		it('should accept valid PNG image', async () => {
// 			const fs = await import('fs/promises')
// 			const fileType = await import('file-type')
// 			const mockBuffer = Buffer.from('fake-png-data')
//
// 			// Mock file-type to recognize this as PNG
// 			fileType.fileTypeFromBuffer.mockResolvedValueOnce({
// 				ext: 'png',
// 				mime: 'image/png'
// 			})
//
// 			fs.default.mkdir.mockResolvedValueOnce(undefined)
// 			fs.default.writeFile.mockResolvedValueOnce(undefined)
// 			fs.default.rename.mockResolvedValueOnce(undefined)
// 			fs.default.readdir.mockResolvedValueOnce([])
// 			UsersRepository.updateUserAvatar.mockReturnValueOnce(undefined)
//
// 			const result = await UpdateUsersServices.checkUserAvatar({
// 				user_id: 1,
// 				avatarBuffer: mockBuffer,
// 				originalName: 'avatar.png',
// 				mimeType: 'image/png'
// 			})
//
// 			expect(result).toBe(true)
// 		})
//
// 		it('should accept valid JPEG image', async () => {
// 			const fs = await import('fs/promises')
// 			const fileType = await import('file-type')
// 			const mockBuffer = Buffer.from('fake-jpeg-data')
//
// 			// Mock file-type to recognize this as JPEG
// 			fileType.fileTypeFromBuffer.mockResolvedValueOnce({
// 				ext: 'jpg',
// 				mime: 'image/jpeg'
// 			})
//
// 			fs.default.mkdir.mockResolvedValueOnce(undefined)
// 			fs.default.writeFile.mockResolvedValueOnce(undefined)
// 			fs.default.rename.mockResolvedValueOnce(undefined)
// 			fs.default.readdir.mockResolvedValueOnce([])
// 			UsersRepository.updateUserAvatar.mockReturnValueOnce(undefined)
//
// 			const result = await UpdateUsersServices.checkUserAvatar({
// 				user_id: 1,
// 				avatarBuffer: mockBuffer,
// 				originalName: 'avatar.jpg',
// 				mimeType: 'image/jpeg'
// 			})
//
// 			expect(result).toBe(true)
// 		})
// 	})
//
// 	// ===========================================
// 	// 2. CHECK USER AVATAR - ERRORS
// 	// ===========================================
// 	describe('checkUserAvatar - Errors', () => {
// 		it('should throw 400 error for invalid user_id', async () => {
// 			await expect(
// 				UpdateUsersServices.checkUserAvatar({
// 					user_id: 0,
// 					avatarBuffer: Buffer.from('data'),
// 					originalName: 'avatar.png',
// 					mimeType: 'image/png'
// 				})
// 			).rejects.toThrow(ERROR_MESSAGES.INVALID_USER_ID)
// 		})
//
// 		it('should throw error for file too large (>5MB)', async () => {
// 			const largeBuffer = Buffer.alloc(6 * 1024 * 1024) // 6MB
//
// 			await expect(
// 				UpdateUsersServices.checkUserAvatar({
// 					user_id: 1,
// 					avatarBuffer: largeBuffer,
// 					originalName: 'avatar.png',
// 					mimeType: 'image/png'
// 				})
// 			).rejects.toThrow('File too large')
// 		})
//
// 		it('should throw error for invalid file type (PDF)', async () => {
// 			const fileType = await import('file-type')
// 			const mockBuffer = Buffer.from('fake-pdf-data')
//
// 			// Mock file-type to recognize this as PDF (not allowed)
// 			fileType.fileTypeFromBuffer.mockResolvedValueOnce({
// 				ext: 'pdf',
// 				mime: 'application/pdf'
// 			})
//
// 			await expect(
// 				UpdateUsersServices.checkUserAvatar({
// 					user_id: 1,
// 					avatarBuffer: mockBuffer,
// 					originalName: 'file.pdf',
// 					mimeType: 'application/pdf'
// 				})
// 			).rejects.toThrow('Invalid image type')
// 		})
//
// 		it('should throw error for invalid file type (SVG)', async () => {
// 			const fileType = await import('file-type')
// 			const mockBuffer = Buffer.from('<svg></svg>')
//
// 			// Mock file-type to recognize this as SVG (not allowed)
// 			fileType.fileTypeFromBuffer.mockResolvedValueOnce({
// 				ext: 'svg',
// 				mime: 'image/svg+xml'
// 			})
//
// 			await expect(
// 				UpdateUsersServices.checkUserAvatar({
// 					user_id: 1,
// 					avatarBuffer: mockBuffer,
// 					originalName: 'file.svg',
// 					mimeType: 'image/svg+xml'
// 				})
// 			).rejects.toThrow('Invalid image type')
// 		})
//
// 		it('should throw error for empty buffer', async () => {
// 			const fileType = await import('file-type')
// 			const emptyBuffer = Buffer.alloc(0)
//
// 			// Mock file-type to not recognize the format
// 			fileType.fileTypeFromBuffer.mockResolvedValueOnce(undefined)
//
// 			await expect(
// 				UpdateUsersServices.checkUserAvatar({
// 					user_id: 1,
// 					avatarBuffer: emptyBuffer,
// 					originalName: 'avatar.png',
// 					mimeType: 'image/png'
// 				})
// 			).rejects.toThrow('File content not valid image')
// 		})
// 	})
// })

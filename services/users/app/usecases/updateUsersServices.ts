import { fileTypeFromBuffer } from 'file-type'
import { UserStatus } from '@ft_transcendence/common'
import { UsersRepository } from '../repositories/usersRepository.js'
import fs from 'fs/promises'
import * as path from 'path'
import { randomUUID } from 'crypto'
import createHttpError from 'http-errors'

export interface CheckUserAvatarParams {
	user_id: number
	avatarBuffer: Buffer
	originalName: string
	mimeType: string
}

interface AvatarPaths {
	avatarsDir: string
	outPath: string
	tempPath: string
	publicPath: string
	filename: string
}

const ALLOWED_TYPES: readonly string[] = [
	'image/jpeg',
	'image/png',
	'image/jpg'
]
const ALLOWED_EXTENSIONS: readonly string[] = ['.jpg', '.jpeg', '.png']
const MAX_SIZE = 5 * 1024 * 1024

export class UpdateUsersServices {
	static async updateUsernameProfile(
		user: { user_id: number },
		newUsername: string
	): Promise<void> {
		if (!user.user_id || user.user_id <= 0) {
			throw createHttpError.BadRequest('Invalid user ID')
		}
		if (UsersRepository.existsByUsername({ username: newUsername })) {
			throw createHttpError.Conflict('Username already taken')
		}
		UsersRepository.updateUsername({
			user_id: user.user_id,
			username: newUsername
		})
	}

	static async updateUserStatus(
		userId: number,
		status: UserStatus,
		lastConnection?: string
	): Promise<void> {
		if (!userId || userId <= 0)
			throw createHttpError.BadRequest('Invalid user ID')

		if (!UsersRepository.existsById({ user_id: userId }))
			throw createHttpError.NotFound('User not found')

		const currentStatus = UsersRepository.getUserStatusById({ user_id: userId })

		if (currentStatus === status) {
			return
		}

		if (status === UserStatus.OFFLINE && !lastConnection) {
			lastConnection = new Date().toISOString()
		}

		UsersRepository.updateUserStatus(
			{ user_id: userId },
			status,
			lastConnection
		)
	}

	/**
	 * Validates, saves avatar image and cleans up old avatars atomically.
	 *
	 * Process:
	 * 1. Validates file type and size
	 * 2. Saves to temp file then renames (atomic)
	 * 3. Updates database
	 * 4. Deletes old avatar files for this user
	 *
	 * @throws {BadRequest} If file type/size invalid
	 * @throws {InternalServerError} If save fails (no partial state)
	 */
	static async checkUserAvatar(
		params: CheckUserAvatarParams
	): Promise<boolean> {
		const detectedType = await _validateAvatar(params)
		const paths = await _generateAvatarPaths(params.user_id, detectedType)
		await _saveAvatarAndCleanup(paths, params.avatarBuffer, params.user_id)
		return true
	}
}

async function _validateAvatar(params: CheckUserAvatarParams) {
	const { user_id, avatarBuffer, originalName, mimeType } = params

	if (!user_id || user_id <= 0) {
		throw createHttpError.BadRequest('Invalid user ID')
	}

	const fileExtension =
		originalName && originalName.includes('.')
			? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
			: ''

	if (fileExtension && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
		throw createHttpError.BadRequest('Invalid file extension')
	}

	if (!Buffer.isBuffer(avatarBuffer))
		throw createHttpError.BadRequest('Missing file')

	if (avatarBuffer.length > MAX_SIZE)
		throw createHttpError.BadRequest('File too large')

	const detectedType = await fileTypeFromBuffer(avatarBuffer)
	if (!detectedType)
		throw createHttpError.BadRequest('File content not valid image')

	if (!ALLOWED_TYPES.includes(detectedType.mime))
		throw createHttpError.BadRequest('Invalid image type')

	return detectedType
}

async function _generateAvatarPaths(
	user_id: number,
	detectedType: { ext: string | undefined; mime: string }
): Promise<AvatarPaths> {
	const ext = detectedType.ext
		? `.${detectedType.ext}`
		: detectedType.mime === 'image/png'
			? '.png'
			: '.jpg'
	const uuid = randomUUID()
	const filename = `img_${user_id}_${uuid}${ext}`
	const avatarsDir = path.join(process.cwd(), 'avatars')
	const outPath = path.join(avatarsDir, filename)
	const tempPath = path.join(avatarsDir, `.tmp_${filename}`)
	const publicPath = path.posix.join('/avatars', filename)

	return { avatarsDir, outPath, tempPath, publicPath, filename }
}

async function _saveAvatarAndCleanup(
	paths: AvatarPaths,
	avatarBuffer: Buffer,
	user_id: number
): Promise<void> {
	const { avatarsDir, outPath, tempPath, publicPath, filename } = paths

	try {
		await fs.mkdir(avatarsDir, { recursive: true })
		await fs.writeFile(tempPath, avatarBuffer)
		await fs.rename(tempPath, outPath)
	} catch (err) {
		try {
			await fs.unlink(tempPath)
		} catch (_) {}
		throw createHttpError.InternalServerError('Failed to save avatars')
	}

	try {
		UsersRepository.updateUserAvatar({ user_id, avatar: publicPath })
	} catch (err) {
		try {
			await fs.unlink(outPath)
		} catch (_) {}
		throw err
	}

	const files = await fs.readdir(avatarsDir)
	const prefix = `img_${user_id}_`
	const oldFiles = files.filter(
		(f) => f.startsWith(prefix) && f !== filename && !f.startsWith('.tmp_')
	)

	for (const file of oldFiles) {
		try {
			await fs.unlink(path.join(avatarsDir, file))
		} catch (err) {
			// Ignore cleanup errors
		}
	}
}

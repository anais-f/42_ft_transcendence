import {fileTypeFromBuffer} from 'file-type'
import {AppError, ERROR_MESSAGES, UserStatus} from '@ft_transcendence/common'
import {UsersRepository} from '../repositories/usersRepository.js'
import fs from 'fs/promises'
import * as path from 'path'
import {randomUUID} from 'crypto'

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

const ALLOWED_TYPES: readonly string[] = ['image/jpeg', 'image/png']
const ALLOWED_EXTENSIONS: readonly string[] = ['.jpg', '.jpeg', '.png']
const MAX_SIZE = 5 * 1024 * 1024

export class UpdateUsersServices {
	/** Update username in user profile */
	static async updateUsernameProfile(
		user: { user_id: number },
		newUsername: string
	): Promise<void> {
		if (!user.user_id || user.user_id <= 0) {
			throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)
		}

		await UsersRepository.updateUsername({
			user_id: user.user_id,
			username: newUsername
		})
	}

	/** Update user status (online/offline) */
	static async updateUserStatus(
		userId: number,
		status: UserStatus,
		lastConnection?: string
	): Promise<void> {
		if (!userId || userId <= 0) {
			throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)
		}

		if (!UsersRepository.existsById({ user_id: userId })) {
			throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
		}

		const currentStatus = UsersRepository.getUserStatusById({ user_id: userId })

		if (currentStatus === status) {
			console.log(`User ${userId} status already ${status}, ignoring update`)
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
		console.log(`User ${userId} status updated to ${status}`)
	}

	/** Check and update user avatar */
	static async checkUserAvatar(
		params: CheckUserAvatarParams
	): Promise<boolean> {
		const detectedType = await _validateAvatar(params)
		const paths = await _generateAvatarPaths(params.user_id, detectedType)
		await _saveAvatarAndCleanup(paths, params.avatarBuffer, params.user_id)
		return true
	}
}

// --------------------- Helpers (module-private) ---------------------

/**
 * Internal helper: validate avatar image
 */
async function _validateAvatar(params: CheckUserAvatarParams) {
	const { user_id, avatarBuffer, originalName, mimeType } = params

	if (!user_id || user_id <= 0) {
		throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)
	}

	const fileExtension =
		originalName && originalName.includes('.')
			? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
			: ''

	if (!Buffer.isBuffer(avatarBuffer)) {
		throw new AppError('Missing file', 400)
	}

	if (avatarBuffer.length > MAX_SIZE) {
		throw new AppError('File too large', 400)
	}

	const detectedType = await fileTypeFromBuffer(avatarBuffer)
	if (!detectedType) {
		throw new AppError('File content not valid image', 400)
	}

	if (!ALLOWED_TYPES.includes(detectedType.mime)) {
		throw new AppError('Invalid image type', 400)
	}

	if (mimeType && mimeType !== detectedType.mime) {
		console.warn(
			'[avatars] MIME mismatch: header=',
			mimeType,
			'detected=',
			detectedType.mime
		)
	}

	if (fileExtension && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
		console.warn(
			'[avatars] original file extension not allowed:',
			fileExtension,
			' - continuing based on detectedType'
		)
	}

	return detectedType
}

/**
 * Internal helper: generate file paths for avatar storage
 */
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

	console.log(
		'[avatars] generateAvatarPaths - chosen ext:',
		ext,
		'filename:',
		filename,
		'detected mime:',
		detectedType.mime
	)

	return { avatarsDir, outPath, tempPath, publicPath, filename }
}

/**
 * Internal helper: save avatar and cleanup old files
 */
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
		console.log(`Avatar saved successfully: ${filename}`)
	} catch (err) {
		try {
			await fs.unlink(tempPath)
		} catch (_) {}
		throw new AppError('Failed to save avatars', 500)
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
			console.log(`Deleted old avatar: ${file}`)
		} catch (err) {
			console.warn(`Failed to delete old avatar file ${file}:`, err)
		}
	}
}

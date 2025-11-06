import { fileTypeFromBuffer } from 'file-type'
import {AppError, ERROR_MESSAGES} from "@ft_transcendence/common"
import { UsersRepository } from '../repositories/usersRepository.js'
import fs from 'fs/promises'
import path from 'path'

export interface CheckUserAvatarParams {
  user_id: number
  avatarBuffer: Buffer
  originalName: string
  mimeType: string
}

export class UpdateUsersServices {
  static async updateUsernameProfile(
      user: { user_id: number },
      newUsername: string
  ): Promise<void> {
    if (!user.user_id || user.user_id <= 0)
      throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)

    await UsersRepository.updateUsername({
      user_id: user.user_id,
      username: newUsername
    })
  }

  static async checkUserAvatar(params: CheckUserAvatarParams): Promise<boolean> {
    const { user_id, avatarBuffer, originalName, mimeType } = params

    if (!user_id || user_id <= 0)
      throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)

    // check mime type and extension
    const allowedTypes = ["image/jpeg", "image/png"]
    if (!allowedTypes.includes(mimeType))
      throw new AppError("Invalid image type", 400)

    const allowedExtensions = [".jpg", ".jpeg", ".png"]
    const fileExtension = originalName.slice(
      originalName.lastIndexOf(".")
    ).toLowerCase()
    if (!allowedExtensions.includes(fileExtension))
      throw new AppError("Invalid file extension", 400)

    // check the file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (avatarBuffer.length > MAX_SIZE)
      throw new AppError("File too large", 400)

    // check the real file type via content
    const detectedType = await fileTypeFromBuffer(avatarBuffer)
    if (!detectedType || !allowedTypes.includes(detectedType.mime))
      throw new AppError("File content not valid image", 400)

    // generate filename and paths
    const ext = detectedType.ext ? `.${detectedType.ext}` : (detectedType.mime === 'image/png' ? '.png' : '.jpg')
    const filename = `img_${user_id}${ext}`
    const avatarsDir = path.join(process.cwd(), 'avatars')
    const outPath = path.join(avatarsDir, filename)
    const tempPath = path.join(avatarsDir, `.tmp_${filename}_${Date.now()}`)
    const publicPath = path.posix.join('/avatars', filename)

    console.log('Name avatar: ', filename)
    console.log('outPath avatar: ', outPath)
    console.log('publicPath: ', publicPath)

    try {
      await fs.mkdir(avatarsDir, { recursive: true })
      await fs.writeFile(tempPath, avatarBuffer)
      await fs.rename(tempPath, outPath)
      console.log(`Avatar saved successfully: ${filename}`)

      const files = await fs.readdir(avatarsDir)
      const prefix = `img_${user_id}.`
      const oldFiles = files.filter((f) =>
        f.startsWith(prefix) &&
        f !== filename &&
        !f.startsWith('.tmp_')
      )

      for (const file of oldFiles) {
        try {
          await fs.unlink(path.join(avatarsDir, file))
          console.log(`Deleted old avatar: ${file}`)
        } catch (err) {
          console.warn(`Failed to delete old avatar file ${file}:`, err)
        }
      }
    } catch (err) {
      try { await fs.unlink(tempPath) } catch (_) {}
      throw new AppError('Failed to save avatar', 500)
    }

    // update repository with avatar public path
    try {
      await UsersRepository.updateUserAvatar({ user_id, avatar: publicPath })
    } catch (err) {
      try { await fs.unlink(outPath) } catch (_) {}
      throw err
    }

    return true
  }
}

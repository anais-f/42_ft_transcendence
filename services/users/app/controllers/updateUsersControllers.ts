import { FastifyReply, FastifyRequest } from 'fastify'
import '@fastify/multipart'
import {
	UserProfileUpdateUsernameSchema,
	UpdateUserStatusSchema,
	UpdateUserStatusDTO
} from '@ft_transcendence/common'
import { UpdateUsersServices } from '../usecases/updateUsersServices.js'
import createHttpError from 'http-errors'

export async function updateUsername(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = req.user as { user_id?: number } | undefined
	const userId = Number(user?.user_id)
	const { username } = req.body as { username?: string }

	if (!userId || userId <= 0)
		throw createHttpError.BadRequest('Invalid user ID')

	const parsed = UserProfileUpdateUsernameSchema.safeParse({ username })
	if (!parsed.success) {
		console.error('UserProfileUpdateUsername validation failed:', parsed.error)
		throw createHttpError.BadRequest('Invalid user data')
	}

	await UpdateUsersServices.updateUsernameProfile(
		{ user_id: userId },
		parsed.data.username
	)

	reply.send({ message: 'User updated' })
}

export async function updateAvatar(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = request.user as { user_id?: number } | undefined
	const userId = Number(user?.user_id)

	if (!userId || userId <= 0)
		throw createHttpError.BadRequest('Invalid user ID')

	let buffer: Buffer
	let filename: string
	let mimeType: string

	const contentType = request.headers['content-type'] || ''
	const isMultipart =
		contentType.startsWith('multipart/') && contentType.includes('boundary=')

	if (isMultipart) {
		const data = await request.file()
		if (!data) throw createHttpError.BadRequest('Missing file')

		const chunks: Buffer[] = []
		for await (const chunk of data.file) {
			chunks.push(chunk)
		}
		buffer = Buffer.concat(chunks)
		filename = data.filename
		mimeType = data.mimetype
	} else {
		if (!Buffer.isBuffer(request.body))
			throw createHttpError.BadRequest('Missing file')

		buffer = request.body as Buffer
		mimeType = contentType
		filename = `avatar.${(mimeType.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '')}`
	}

	if (buffer.length === 0) throw createHttpError.BadRequest('Missing file')

	await UpdateUsersServices.checkUserAvatar({
		user_id: userId,
		avatarBuffer: buffer,
		originalName: filename,
		mimeType: mimeType
	})

	reply.code(200).send({ message: 'User updated' })
}

export async function updateUserStatus(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const { user_id } = req.params as { user_id: number }
	const body = req.body as UpdateUserStatusDTO

	const parsed = UpdateUserStatusSchema.safeParse(body)
	if (!parsed.success) {
		console.error('UpdateUserStatus validation failed:', parsed.error)
		throw createHttpError.BadRequest('Invalid user data')
	}

	const { status, lastConnection } = parsed.data

	await UpdateUsersServices.updateUserStatus(user_id, status, lastConnection)

	reply.code(200).send({ message: 'User updated' })
}

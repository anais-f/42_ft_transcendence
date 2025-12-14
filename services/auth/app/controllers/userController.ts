import type { FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import {
	listPublicUsers,
	findPublicUserById,
	deleteUserById
} from '../repositories/userRepository.js'
import {
	PublicUserAuthSchema,
	PublicUserListAuthSchema,
	IdParamSchema
} from '@ft_transcendence/common'
import { changeMyPassword } from '../usecases/changeMyPassword.js'

export async function listPublicUsersController(
	_req: FastifyRequest,
	reply: FastifyReply
) {
	const users = listPublicUsers()
	return reply.send(PublicUserListAuthSchema.parse(users))
}

export async function getPublicUserController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = IdParamSchema.safeParse(request.params)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid id')
	const idNum = Number(parsed.data.id)
	const user = findPublicUserById(idNum)
	if (!user) throw createHttpError.NotFound('User not found')
	return reply.send(PublicUserAuthSchema.parse(user))
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	const parsed = IdParamSchema.safeParse(request.params)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid id')
	const idNum = Number(parsed.data.id)
	const ok = deleteUserById(idNum)
	if (!ok) throw createHttpError.NotFound('User not found')
	return reply.code(204).send({ success: true })
}

export async function patchUserPassword(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user?.user_id
	if (!userId) throw createHttpError.Unauthorized('Invalid token')

	const { old_password, new_password, twofa_code } = request.body as {
		old_password: string
		new_password: string
		twofa_code?: string
	}

	await changeMyPassword(userId, old_password, new_password, twofa_code)

	return reply.send({ success: true })
}

/**
 * Verify the password of the authenticated user.
 * @param request
 * @param reply
 */
export async function verifyMyPasswordController(
    request: FastifyRequest,
    reply: FastifyReply
) {
  const userId = request.user?.user_id
  if (!userId) throw createHttpError.Unauthorized('Invalid token')

  const parsed = PasswordBodySchema.safeParse(request.body)
  if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

  const { password } = parsed.data

  const user = findUserById(userId)
  if (!user || !user.password) {
    throw createHttpError.NotFound('User not found')
  }

  const ok = await verifyPassword(user.password, password)
  if (!ok) throw createHttpError.Unauthorized('Invalid password')

  return reply.send({ success: true })
}

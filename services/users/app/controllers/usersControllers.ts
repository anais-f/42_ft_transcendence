import { UsersServices } from '../usecases/usersServices.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
	PublicUserAuthDTO,
	UserPublicProfileSchema,
	AppError,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES
} from '@ft_transcendence/common'

/**
 * Handle user creation via webhook
 * @description This function handles the creation of a new user when a webhook notification is received from the auth service.
 * It checks if the user already exists and creates a new user if not. Responds with appropriate status codes and messages based on the operation outcome.
 * @param req
 * @param reply
 */
export async function handleUserCreated(
    req: FastifyRequest<{ Body: PublicUserAuthDTO }>,
    reply: FastifyReply
): Promise<void> {
  try {
    const newUser: PublicUserAuthDTO = req.body
    await UsersServices.createUser(newUser)
    void reply
        .code(201)
        .send({ success: true, message: SUCCESS_MESSAGES.USER_CREATED })
    return
  } catch (error) {
    if (
        error instanceof Error &&
        error.message === ERROR_MESSAGES.USER_ALREADY_EXISTS
    ) {
      void reply
          .code(200)
          .send({ success: true, message: ERROR_MESSAGES.USER_ALREADY_EXISTS })
      return
    }
    void reply
        .code(500)
        .send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
    return
  }
}

export async function getPublicUser(
    req: FastifyRequest<{ Params?: { id?: string | number } }>,
    reply: FastifyReply
): Promise<void> {
  const idRaw = req.params?.id
  const idNumber = Number(idRaw)
  console.log('Fetching user with id number:', idNumber)

  if (idRaw === undefined || idRaw === null || isNaN(idNumber) || idNumber <= 0) {
    void reply.code(400).send({ success: false, error: ERROR_MESSAGES.INVALID_USER_ID })
    return
  }

  try {
    const rawProfile = await UsersServices.getPublicUserProfile({ user_id: idNumber })

    const parsed = UserPublicProfileSchema.safeParse(rawProfile)
    if (!parsed.success) {
      console.error('UserProfile validation failed:', parsed.error)
      void reply.code(500).send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
      return
    }

    void reply.code(200).send({ success: true, data: parsed.data })
  } catch (error: any) {
    if (error instanceof AppError) {
      void reply.code(error.status).send({ success: false, error: error.message })
      return
    }
    throw error
  }
}

//   async function getPrivateUser(
//   req: FastifyRequest,
//   reply: FastifyReply
// ): Promise<FastifyReply> {
//     try {
//       const id = req.params.id
//
//
//       }
//
//   return ;
// }

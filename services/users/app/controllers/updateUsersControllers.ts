import {FastifyReply, FastifyRequest} from 'fastify'
import '@fastify/multipart'
import {
  AppError,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UserProfileUpdateUsernameSchema
} from '@ft_transcendence/common'
import {UpdateUsersServices} from '../usecases/updateUsersServices.js'

export async function updateUsername(
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
  try {
    const user = req.user as { user_id?: number } | undefined
    const userId = Number(user?.user_id)
    const {username} = req.body as { username?: string }

    if (!userId || userId <= 0) {
      void reply
          .code(400)
          .send({success: false, error: ERROR_MESSAGES.INVALID_USER_ID})
      return
    }

    const parsed = UserProfileUpdateUsernameSchema.safeParse({username})
    if (!parsed.success) {
      console.error(
          'UserProfileUpdateUsername validation failed:',
          parsed.error
      )
      void reply.code(400).send({
        success: false,
        error: ERROR_MESSAGES.INVALID_USER_DATA + 'test'
      })
      return
    }

    await UpdateUsersServices.updateUsernameProfile(
        {user_id: userId},
        parsed.data.username
    )

    void reply
        .code(200)
        .send({success: true, message: SUCCESS_MESSAGES.USER_UPDATED})
  } catch (error: any) {
    if (error instanceof AppError) {
      void reply
          .code(error.status)
          .send({success: false, error: error.message})
      return
    }
    console.error('Unexpected error in updateUsernameProfile:', error)
    void reply
        .code(500)
        .send({success: false, error: ERROR_MESSAGES.INTERNAL_ERROR})
  }
}

export async function updateAvatar(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
  try {
    const user = request.user as { user_id?: number } | undefined
    const userId = Number(user?.user_id)

    if (!userId || userId <= 0) {
      void reply
          .code(400)
          .send({ success: false, error: ERROR_MESSAGES.INVALID_USER_ID })
      return
    }

    const data = await request.file()
    if (!data) {
      void reply
          .code(400)
          .send({ success: false, error: ERROR_MESSAGES.MISSING_FILE })
      return
    }

    const chunks = []
    for await (const chunk of data.file) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    await UpdateUsersServices.checkUserAvatar({
      user_id: userId,
      avatarBuffer: buffer,
      originalName: data.filename,
      mimeType: data.mimetype
    })

    void reply.code(200).send({
      success: true,
      message: SUCCESS_MESSAGES.USER_UPDATED
    })
  } catch (error) {
    if (error instanceof AppError) {
      void reply
          .code(error.status)
          .send({ success: false, error: error.message })
      return
    }
    console.error('Unexpected error in updateAvatar:', error)
    void reply
        .code(500)
        .send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
  }
}



/*


// Si ok, sauvegarde sur disque (remplace ancien avatar)
await fs.writeFile(`avatars/users/${userId}.png`, buffer);

reply.send({ message: 'Upload validé et avatar remplacé' });
});

 */
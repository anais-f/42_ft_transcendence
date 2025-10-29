import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import { ERROR_MESSAGES } from '@ft_transcendence/common'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      user_id: number
      login: string
    }
  }
}

/**
 * @description Check valid JWT token
 * @use Routes accessible to authenticated users
 */
export function jwtAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  (request as any).jwtVerify((err: Error | null) => {
    if (err) {
      void reply.code(401).send({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED
      })
      return done()
    }

    return done()
  })
}

/**
 * @description Check valid JWT token and ownership
 * @use Routes where users can access only their own resources
 */
export function jwtAuthOwnerMiddleware(
  request: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  (request as any).jwtVerify((err: Error | null) => {
    if (err) {
      void reply.code(401).send({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED
      })
      return done()
    }

    const userId = Number((request as any).user?.user_id)
    const paramId = Number(request.params.id)

    if (Number.isNaN(userId) || userId !== paramId) {
      void reply.code(403).send({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN
      })
      return done()
    }

    return done()
  })
}

/**
 * @description Check valid API key in headers
 * @use Routes for inter-service communication
 */
export function apiKeyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const rawAuth = (request.headers.authorization ?? request.headers['x-api-key']) as
    | string
    | string[]
    | undefined

  const apiKey = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth

  if (!apiKey || apiKey !== process.env.USERS_API_SECRET) {
    void reply.code(401).send({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED
    })
    return done()
  }

  return done()
}
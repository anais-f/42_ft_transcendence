import '@fastify/jwt'
import '../fastify.js'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import createHttpError from "http-errors";
/**
 * @description Check valid JWT token from httpOnly cookie or Authorization header
 * @use Routes accessible to authenticated users
 */
export function jwtAuthMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
): void {
  request
      .jwtVerify()
      .then(() => {
        done()
      })
      .catch((err: Error) => {
        console.error('JWT verification failed:', err.message)
        done(createHttpError.Unauthorized('Unauthorized from jwtCheck'))
      })
}

/**
 * @description Check valid JWT token and ownership
 * @use Routes where users can access and modify only their own resources
 */
export function jwtAuthOwnerMiddleware(
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
): void {
  request
      .jwtVerify()
      .then(() => {
        const userId = Number(request.user?.user_id)
        const paramId = Number(request.params.id)

        if (Number.isNaN(userId) || userId !== paramId) {
          done(createHttpError.Forbidden('Forbidden'))
          return
        }

        done()
      })
      .catch((err: Error) => {
        console.error('JWT verification failed:', err.message)
        done(createHttpError.Unauthorized('Unauthorized from jwtCheck'))
      })
}


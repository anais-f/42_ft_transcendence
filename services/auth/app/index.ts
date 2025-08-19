import Fastify from 'fastify'
import { request } from 'http'

const fastify = Fastify()

fastify.get('/', async (request, reply) => {
  return { message: 'Auth service is running!' }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Auth server running on port 3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

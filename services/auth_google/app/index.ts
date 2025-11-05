import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyOauth2, { 
  OAuth2Namespace, 
  FastifyOAuth2Options
} from '@fastify/oauth2';

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}

const fastify: FastifyInstance = Fastify({ 
  logger: { level: 'trace' } 
});

const oauth2Options: FastifyOAuth2Options = {
  name: 'googleOAuth2',
  credentials: {
    client: {
      id: process.env.google_CLIENT_ID || '310342889284-r3v02ostdrpt7ir500gfl0j0ft1rrnsu.apps.googleusercontent.com',
      secret: process.env.google_CLIENT_SECRET || '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'
    },
    auth: {
      authorizeHost: 'https://accounts.google.com',
      authorizePath: '/o/oauth2/v2/auth',
      tokenHost: 'https://www.googleapis.com',
      tokenPath: '/oauth2/v4/token'
    }
  },
  startRedirectPath: '/login/google',
  callbackUri: 'http://localhost:8080/auth-google/login/google/callback',
  scope: ['email', 'profile']
};

await fastify.register(fastifyOauth2, oauth2Options);

fastify.get('/login/google/callback', async (
  request: FastifyRequest, 
  reply: FastifyReply
) => {
  try {
    const { token } = await fastify.googleOAuth2
      .getAccessTokenFromAuthorizationCodeFlow(request);
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { 
          Authorization: `Bearer ${token.access_token}` 
        }
      }
    );
    
    const googleUser = await userInfoResponse.json();
    console.log('Google User Info:', googleUser);
    const authResponse = await fetch('http://auth:3000/api/register-google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        google_id: googleUser.id
      })
    });
    const { token: myJWT, user } = await authResponse.json();
    
    return reply.send({ token: myJWT, user });
    
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'OAuth2 authentication failed' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: parseInt(process.env.PORT as string), host: '0.0.0.0' });
    fastify.log.info('Server listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

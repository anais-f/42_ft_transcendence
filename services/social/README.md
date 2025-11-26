# Service `social`

This document describes the `social` service of the Transcendence project: its purpose, the environment variables required (with a distinction for tests), a short note about the database, and the exposed endpoints.

## Purpose of the service

The `social` service handles user relationships, presence and realtime social features:

- Manage friend relationships (requests, accept/reject, cancel, remove)
- Provide friends lists and pending requests
- Maintain presence status (online/offline) and handle logout events
- Provide a WebSocket endpoint for realtime presence/notifications via temporary tokens
- Act as the owner of social-related business logic and aggregate user data by calling the `users` service

## Environment variables

Below are the environment variables used by the service. Variables marked "(required for tests)" indicate values that need to be defined to run local unit/integration tests (or for mocks that rely on these values).

Variables required for normal service operation

- `USERS_SERVICE_URL`: URL of the users service (used by `UsersApi` to fetch user profiles)
- `USERS_API_SECRET`: secret/API key to authenticate calls to the users service
- `JWT_SECRET_SOCIAL`: JWT secret used by the social service for token validation (if configured)
- `SOCIAL_DB_PATH`: path to the social database file (used by `socialDatabase.ts`, typically a sqlite path)
- `HOST` / `PORT`: host and port the service binds to (defaults are often provided in code)
- `DTO_OPENAPI_FILE` (optional): path to OpenAPI/DTO file used at startup
- `WS_TOKEN_EXPIRES_SECONDS` (optional, default used if not set): lifetime of temporary WS tokens in seconds

Variables required only for tests (or strongly useful for tests)

- `USERS_SERVICE_URL` and `USERS_API_SECRET` (required for integration tests that call `UsersApi`; for unit tests prefer using mocks instead)
- Test DB path (e.g. `TEST_SOCIAL_DB_PATH` or configure `SOCIAL_DB_PATH` to point to a temp/test DB)
- Any storage/backing variables if presence/avatar persistence is tested against a real backend

Testing best practices

- Mock `UsersApi` responses for unit tests to avoid network dependency in CI.
- Mock WebSocket connections or use an in-process test harness for websocket logic.
- Use a separate test DB file for integration tests and clean it between runs.

## Database (brief)

The social service uses a lightweight database (configured via `SOCIAL_DB_PATH`) to store relations and presence. Key concepts:

- `relations` table stores friend relationships with columns like `user_id`, `friend_id`, `origin_id`, `relation_status`
  - `relation_status` values: `0` = pending, `1` = friends
- Presence / connection state is tracked to provide `status` and `last_connection` in friend lists (aggregated from the `users` service and the social presence store)

See `services/social/app/repositories/socialRepository.ts` for SQL queries and table usage.

## Endpoints

Endpoints exposed by the service (extracted from `services/social/app/routes/socialRoutes.ts`):

- POST /api/social/create-token
  - Protection: JWT (`jwtAuthMiddleware`)
  - Response: `{ token: string }` — creates a temporary token to authenticate WebSocket connections

- GET /api/social/ws?token=<token>
  - WebSocket endpoint (raw Fastify websocket)
  - Querystring: `token` (temporary WS token created by `/api/social/create-token`)
  - Purpose: realtime presence / notifications channel

- POST /api/social/logout/:userId
  - Protection: JWT owner middleware (`jwtAuthOwnerMiddleware`) — only the owner can logout themselves
  - Params: `userId` (path param)
  - Purpose: mark a user as offline

- POST /api/social/request-friend
  - Protection: JWT
  - Body: `{ user_id: number }` (id of the friend)
  - Purpose: send a friend request

- POST /api/social/accept-friend
  - Protection: JWT
  - Body: `{ user_id: number }`
  - Purpose: accept a pending friend request

- POST /api/social/reject-friend
  - Protection: JWT
  - Body: `{ user_id: number }`
  - Purpose: reject a pending friend request

- POST /api/social/cancel-friend
  - Protection: JWT
  - Body: `{ user_id: number }`
  - Purpose: cancel a previously sent friend request

- POST /api/social/remove-friend
  - Protection: JWT
  - Body: `{ user_id: number }`
  - Purpose: remove an existing friend

- GET /api/social/friends/:userId
  - Protection: JWT
  - Params: `userId` (coerced to number)
  - Response: `FriendsListSchema` — an object `{ friends: [...] }` with each friend containing `user_id`, `username`, `avatar`, `status`, `last_connection`

- (Optional/disabled) GET /api/social/pending-requests
  - Protection: JWT
  - Purpose: return pending requests to approve / sent requests (route currently commented out)

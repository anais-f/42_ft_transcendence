# Service `users`

## Purpose of the service

The `users` service is responsible for everything related to user profiles:

- Creating internal users (internal endpoint used by the auth service)
- Reading public profiles (`/api/users/:id`)
- Reading private profile (authenticated user `/api/users/me`)
- Updating profiles (username, avatar)
- Updating user status (used by other internal services)

The service distinguishes between public endpoints (protected by JWT) and internal endpoints (protected by an API key).

## Environment variables

Below are the environment variables used by the service. Variables marked "(required for tests)" indicate values that need to be defined to run local unit/integration tests (or for mocks that rely on these values).

Variables required for normal service operation

- `AUTH_SERVICE_URL`: URL of the auth service (used by `AuthApi` to retrieve/consult users)
- `AUTH_API_SECRET`: secret/API key to authenticate calls to the auth service
- Database variables (see `services/users/app/database` for details): e.g. `DATABASE_URL` or separate DB variables depending on your configuration
- `API_KEY` (or equivalent): internal key used by `apiKeyMiddleware` to protect internal endpoints

Variables required only for tests (or strongly useful for tests)

- `AUTH_SERVICE_URL` and `AUTH_API_SECRET` (required for integration tests that call `AuthApi`; for unit tests prefer using mocks rather than calling a real URL)
- Test database access variables (e.g. `TEST_DATABASE_URL`, if you have a separate test DB configuration)
- Avatar storage-related variables (if upload tests rely on a real storage backend)

Testing best practices

- Prefer mocks/stubs for `AuthApi` and other network calls in unit tests to avoid dependency on external services in CI.
- For integration tests that simulate the ecosystem, provide test-specific environment variables (e.g. a `.env.test` file or CI variables).

## Database

The service uses a PostgreSQL database to store user profiles. The main table is `users`, which contains fields such as:

- `user_id` (primary key)
- `username`
- `avatar_url`
- `status`
- `last_connection`

## Endpoints

Endpoints exposed by the service (extracted from `services/users/app/routes/usersRoutes.ts`):

- POST /api/internal/users/new-user
  - Protection: API Key (`apiKeyMiddleware`)
  - Expected body: `PublicUserAuthSchema` (e.g. `{ user_id, login }`)
  - Purpose: internal user creation (called by the auth service)

- GET /api/users/:id
  - Protection: JWT (`jwtAuthMiddleware`)
  - Params: `id` (coerced to number)
  - Response: public profile (`user_id`, `username`, `avatar`, `status`, `last_connection`)

- GET /api/users/me
  - Protection: JWT
  - Response: private profile of the authenticated user

- PATCH /api/users/me
  - Protection: JWT
  - Body: profile update (e.g. `username`)

- PATCH /api/users/me/avatar
  - Protection: JWT
  - Consumes: `multipart/form-data` (image upload)

- PATCH /api/internal/users/:id/status
  - Protection: API Key
  - Body: update user status (used by other services)

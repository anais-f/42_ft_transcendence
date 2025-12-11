# Service `users`

## Service Overview

The `users` service is responsible for all user profile management within the Transcendence ecosystem. It serves as a central service that handles user personal information and provides APIs for both public and private profile access.

## Service Purpose

The `users` service manages:

- **Internal user creation**: Internal endpoint used by the authentication service
- **Public profile consultation**: Access to profile information visible to all authenticated users
- **Private profile consultation**: Access to personal information for the connected user
- **Profile updates**: Username and avatar modification
- **User status updates**: Used by other internal services to maintain user state
- **User search**: Exact username search functionality

The service clearly distinguishes between:

- **Public endpoints**: Protected by JWT, accessible to authenticated users
- **Internal endpoints**: Protected by API key, reserved for inter-service communication

## Environment Variables

### Variables required for normal operation

- `INTERNAL_API_SECRET`: Secret/API key to protect internal endpoints
- `DATABASE_URL`: SQLite database connection URL (or separate DB variables depending on your configuration)
- `HOST` / `PORT`: Host and port on which the service listens
- `AVATAR_STORAGE_PATH`: Storage path for uploaded avatars
- `JWT_SECRET`: JWT secret for authentication token validation

## Database

The service uses a **SQLite** database to store user profiles. The main `users` table contains:

- `user_id` (primary key): Unique user identifier
- `username`: Username (unique, modifiable)
- `avatar_url`: User avatar URL
- `status`: Presence status (online, offline, in_game, etc.)
- `last_connection`: Last connection timestamp

## Architecture

The service follows a layered architecture:

- **Routes** (`routes/usersRoutes.ts`): Endpoint definitions and schema validation
- **Controllers** (`controllers/`): HTTP request processing logic
- **Use Cases** (`usecases/`): Business logic and validation rules
- **Repositories** (`repositories/`): Data access and SQL queries
- **Database** (`database/`): Database configuration and migrations

## Endpoints

### Public endpoints (JWT protected)

#### `GET /api/users/profile/:user_id`

- **Protection**: JWT (`jwtAuthMiddleware`)
- **Parameters**: `user_id` (number, validated by regex `\d+`)
- **Response**: Public profile (`UserPublicProfileSchema`)
- **Purpose**: View a user's public profile

#### `GET /api/users/me`

- **Protection**: JWT
- **Response**: Private profile of the authenticated user (`UserPrivateProfileSchema`)
- **Purpose**: View own complete profile

#### `PATCH /api/users/me`

- **Protection**: JWT
- **Body**: Profile update (`UserProfileUpdateUsernameSchema`)
- **Purpose**: Modify username

#### `PATCH /api/users/me/avatar`

- **Protection**: JWT
- **Format**: `multipart/form-data` (image upload)
- **Accepted types**: `image/jpeg`, `image/png`
- **Purpose**: Update avatar

#### `GET /api/users/search-by-username`

- **Protection**: JWT
- **Query parameters**: `username` (string, 4-32 characters)
- **Response**: Search result (`UserSearchResultSchema`)
- **Purpose**: Search for a user by exact username

### Internal endpoints (API key protected)

#### `POST /api/internal/users/new-user`

- **Protection**: API key (`apiKeyMiddleware`)
- **Body**: User data (`PublicUserAuthSchema`)
- **Purpose**: Internal user creation (called by auth service)

#### `GET /api/internal/users/profile/:user_id`

- **Protection**: API key
- **Parameters**: `user_id` (number)
- **Response**: Public profile (`UserPublicProfileSchema`)
- **Purpose**: Profile consultation for inter-service communication

#### `PATCH /api/internal/users/:user_id/status`

- **Protection**: API key
- **Parameters**: `user_id` (number)
- **Body**: Status update (`UpdateUserStatusSchema`)
- **Purpose**: Update user status from other services

## Data Schemas

The service uses Zod schemas for validation:

- `PublicUserAuthSchema`: Authentication data for creation
- `UserPublicProfileSchema`: Public profile visible to all
- `UserPrivateProfileSchema`: Complete user profile
- `UserProfileUpdateUsernameSchema`: Username update
- `UpdateUserStatusSchema`: Status update
- `UserSearchResultSchema`: User search result
- `UserIdCoerceSchema`: User ID validation and coercion

## Avatar Management

The service handles avatar upload and storage:

- Upload via `PATCH /api/users/me/avatar` endpoint
- Format validation (JPEG, PNG)
- Local storage in configured directory
- URLs automatically generated for access via nginx

## Security

- **JWT**: End-user authentication
- **API keys**: Internal service authentication
- **Strict validation**: All endpoints use Zod schemas
- **Separation of concerns**: Public vs internal endpoints clearly separated

## Ecosystem Integration

The `users` service interacts with:

- **Auth service**: User creation, JWT validation
- **Social service**: Providing profile data for friend lists
- **Nginx service**: Static file server for avatars
- **Other services**: Via internal endpoints for status updates

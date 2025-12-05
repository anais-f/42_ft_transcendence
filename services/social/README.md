# Service `social`

## Service Overview

The `social` service handles user relationships, presence management, and real-time social features within the Transcendence ecosystem. It serves as the central hub for all social interactions between users, managing friend relationships and providing real-time communication capabilities.

## Service Purpose

The `social` service manages:

- **Friend relationship management**: Friend requests, acceptance/rejection, cancellation, and removal
- **Friends list and pending requests**: Comprehensive views of social connections
- **Real-time presence tracking**: Online/offline status and activity monitoring
- **WebSocket communication**: Real-time notifications and presence updates via temporary tokens
- **Social business logic aggregation**: Combines user data by calling the `users` service
- **Logout event handling**: Proper cleanup of presence and session data

The service acts as the owner of social-related business logic and maintains clear separation between authenticated user actions and internal service operations.

## Environment Variables

### Variables required for normal operation

- `USERS_SERVICE_URL`: URL of the users service (used by `UsersApi` to fetch user profiles)
- `INTERNAL_API_SECRET`: Secret/API key to protect internal endpoints
- `JWT_SECRET_SOCIAL`: JWT secret used by the social service for token validation
- `SOCIAL_DB_PATH`: Path to the social database file (used by `socialDatabase.ts`, typically SQLite)
- `HOST` / `PORT`: Host and port the service binds to (defaults often provided in code)
- `DTO_OPENAPI_FILE` (optional): Path to OpenAPI/DTO file used at startup
- `WS_TOKEN_EXPIRES_SECONDS` (optional): Lifetime of temporary WebSocket tokens in seconds (default used if not set)

## Database

The social service uses a lightweight **SQLite** database (configured via `SOCIAL_DB_PATH`) to store relationships and presence data. Key components:

### Relations Table

Stores friend relationships with columns:

- `user_id`: The user who initiated or is part of the relationship
- `friend_id`: The target user in the relationship
- `origin_id`: The user who originally sent the friend request
- `relation_status`: Relationship state
  - `0` = pending request
  - `1` = accepted friends

### Presence Tracking

Connection state is tracked to provide `status` and `last_connection` information in friend lists, aggregated from both the `users` service and the social presence store.

See `services/social/app/repositories/socialRepository.ts` for detailed SQL queries and table usage.

## Architecture

The service follows a clean architecture pattern:

- **Routes** (`routes/socialRoutes.ts`): Endpoint definitions and WebSocket setup
- **Controllers** (`controllers/`): Request processing and WebSocket handling
- **Use Cases** (`usecases/`): Business logic for social operations
- **Repositories** (`repositories/`): Data access layer for social data
- **Types** (`types/`): TypeScript type definitions for social entities

## Endpoints

### Authentication and Token Management

#### `POST /api/social/create-token`

- **Protection**: JWT (`jwtAuthMiddleware`)
- **Response**: `{ token: string }` — Creates a temporary token to authenticate WebSocket connections
- **Purpose**: Generate secure tokens for WebSocket authentication

#### `GET /api/social/ws?token=<token>`

- **Type**: WebSocket endpoint (raw Fastify WebSocket)
- **Query parameters**: `token` (temporary WebSocket token created by `/api/social/create-token`)
- **Purpose**: Real-time presence and notifications channel
- **Features**: Handles connection lifecycle, presence updates, and real-time messaging

### Session Management

#### `POST /api/social/logout/me`

- **Protection**: JWT (`jwtAuthMiddleware`)
- **Purpose**: Mark the authenticated user as offline and clean up presence data
- **Behavior**: Updates user status and notifies connected friends via WebSocket

### Friend Relationship Management

#### `POST /api/social/request-friend`

- **Protection**: JWT
- **Body**: `{ user_id: number }` (ID of the user to send request to)
- **Purpose**: Send a friend request to another user
- **Validation**: Prevents duplicate requests and self-requests

#### `POST /api/social/accept-friend`

- **Protection**: JWT
- **Body**: `{ user_id: number }` (ID of the user whose request to accept)
- **Purpose**: Accept a pending friend request
- **Behavior**: Changes relationship status from pending to friends

#### `POST /api/social/reject-friend`

- **Protection**: JWT
- **Body**: `{ user_id: number }` (ID of the user whose request to reject)
- **Purpose**: Reject a pending friend request
- **Behavior**: Removes the pending relationship entirely

#### `POST /api/social/cancel-request-friend`

- **Protection**: JWT
- **Body**: `{ user_id: number }` (ID of the user to cancel request to)
- **Purpose**: Cancel a previously sent friend request
- **Behavior**: Allows users to retract their own sent requests

#### `POST /api/social/remove-friend`

- **Protection**: JWT
- **Body**: `{ user_id: number }` (ID of the friend to remove)
- **Purpose**: Remove an existing friend relationship
- **Behavior**: Completely removes the friendship for both users

### Social Data Retrieval

#### `GET /api/social/friends-list/me`

- **Protection**: JWT
- **Response**: `FriendsListSchema` — Object containing `{ friends: [...] }`
- **Friend data includes**: `user_id`, `username`, `avatar`, `status`, `last_connection`
- **Purpose**: Retrieve the authenticated user's complete friends list with current presence

#### `GET /api/social/pending-requests/me`

- **Protection**: JWT
- **Response**: `PendingFriendsListSchema` — List of incoming pending friend requests
- **Purpose**: View friend requests that need to be accepted or rejected

#### `GET /api/social/requests-sent/me`

- **Protection**: JWT
- **Response**: `PendingFriendsListSchema` — List of outgoing pending friend requests
- **Purpose**: View friend requests the user has sent that are still pending

## Data Schemas

The service uses comprehensive Zod schemas for validation:

- `createTokenSchema`: WebSocket token response format
- `FriendsListSchema`: Complete friends list with presence data
- `PendingFriendsListSchema`: Pending requests (both incoming and outgoing)
- `UserIdCoerceSchema`: User ID validation and type coercion
- `SuccessResponseSchema` / `ErrorResponseSchema`: Standard API responses

## WebSocket Features

### Real-time Communication

- **Token-based authentication**: Secure WebSocket connections using temporary tokens
- **Presence broadcasting**: Real-time status updates to connected friends
- **Connection lifecycle management**: Proper handling of connect/disconnect events
- **Error handling**: Robust error management for WebSocket operations

### Security

- **Temporary tokens**: WebSocket tokens have configurable expiration times
- **JWT validation**: All initial connections validated through JWT middleware
- **Connection isolation**: Users only receive updates relevant to their social graph

## Integration with Ecosystem

The `social` service integrates with:

- **Users service**: Fetches complete user profile data for friend lists
- **Auth service**: Validates JWT tokens for authentication
- **Frontend**: Provides WebSocket endpoints for real-time UI updates
- **Game services**: Can notify about game status changes and invitations

## Real-time Features

- **Live presence updates**: Friends see when users come online/offline in real-time
- **Instant notifications**: Friend requests and responses are delivered immediately
- **Status synchronization**: Game status, online/offline state synced across all connections
- **Efficient broadcasting**: Only sends updates to users who need them (friends)

## Security Considerations

- **API protection**: All endpoints protected by JWT authentication
- **Input validation**: Strict validation using Zod schemas
- **Relationship integrity**: Prevents invalid relationship states
- **Rate limiting ready**: Architecture supports rate limiting implementation
- **Token security**: WebSocket tokens are temporary and single-use

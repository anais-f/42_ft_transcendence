# Social Service

User relationships, presence management, and real-time social features for ft_transcendence.

## Responsibilities

- Friend relationship management (request, accept, reject, remove)
- Real-time presence tracking (online, offline, in_game)
- WebSocket communication for live updates
- Friends list and pending requests
- Logout event handling and cleanup

## Architecture

```
routes/ ──→ controllers/ ──→ usecases/ ──→ repositories/ ──→ database/
   │            │               │              │               │
   └─ Fastify  └─ HTTP/WS      └─ Business    └─ SQL        └─ SQLite
      routes      logic            logic           queries
```

**Stack**: Node.js, TypeScript, Fastify, WebSocket, SQLite, Zod

## Quick Start

### Local development

```bash
cd services/social/app
npm install
npm run dev
```

### With Docker

```bash
docker compose up social
```

## Configuration

### Required environment variables

```bash
# Security
INTERNAL_API_SECRET=xxx     # Internal endpoints protection
JWT_SECRET_SOCIAL=xxx       # WebSocket token signing
WS_TOKEN_EXPIRES_SECONDS=30 # WebSocket token lifetime

# Database
SOCIAL_DB_PATH=/data/db-social.sqlite

# External services
USERS_SERVICE_URL=http://users:3000
```

See `.env.example` for the complete list.

## API Documentation

**Swagger UI**: `https://localhost:8080/social/docs`

## Database

**Type**: SQLite with better-sqlite3

### Configuration (PRAGMA)

```sql
journal_mode = WAL        -- Write-Ahead Logging for concurrent reads
synchronous = NORMAL      -- Balance between safety and performance
cache_size = -64000       -- 64MB cache for better performance
busy_timeout = 5000       -- Wait 5s before throwing SQLITE_BUSY
```

### Schema

```sql
CREATE TABLE relations (
    user_id INTEGER,
    friend_id INTEGER,
    relation_status INTEGER NOT NULL CHECK (relation_status IN (0, 1)),
    origin_id INTEGER NOT NULL CHECK(origin_id = user_id OR origin_id = friend_id),
    PRIMARY KEY (user_id, friend_id)
);
```

**Relation status:**

- `0` = Pending friend request
- `1` = Accepted friends

## WebSocket Features

### Real-time Communication

1. **Token-based authentication**
   - Client calls `POST /api/social/create-token` with JWT
   - Receives temporary WebSocket token (expires in 30s)
   - Connects to `GET /api/social/ws?token=xxx`

2. **Presence broadcasting**
   - Online/offline status synced in real-time
   - Friends receive instant presence updates
   - Game status changes propagated

3. **Connection lifecycle**
   - Automatic cleanup on disconnect
   - Proper error handling
   - Reconnection support

### Security

- JWT validation for token creation
- Temporary WebSocket tokens (configurable expiration)
- Connection isolation (users only see their friends)

## Services dependencies

### Required services

- `users` - Fetch user profiles for friends list
- `auth` - JWT validation

### Called by

- `frontend` - WebSocket for real-time UI updates
- `game` - Update in_game status

## Development

### Code structure

- `index.ts` - Entry point, Fastify setup
- `routes/` - Route definitions and WebSocket setup
- `controllers/` - HTTP and WebSocket request handling
- `usecases/` - Business logic for social features
- `repositories/` - Database access
- `database/` - SQLite configuration
- `types/` - TypeScript type definitions

### Adding an endpoint

1. Define Zod schema in `@ft_transcendence/common`
2. Add route in `routes/socialRoutes.ts`
3. Create controller in `controllers/`
4. Implement logic in `usecases/`
5. Add repository methods if needed

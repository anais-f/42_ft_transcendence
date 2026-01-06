# Users Service

User profile management microservice for ft_transcendence.

## Responsibilities

- User profile creation and management
- Avatar upload and storage
- User search by username
- User status updates (online, offline, in_game)
- Public endpoints (JWT) and internal endpoints (API key)

## Architecture

```
routes/ ──→ controllers/ ──→ usecases/ ──→ repositories/ ──→ database/
   │            │               │              │               │
   └─ Fastify  └─ HTTP logic   └─ Business    └─ SQL        └─ SQLite
      routes                      logic           queries
```

**Stack**: Node.js, TypeScript, Fastify, SQLite, Zod

## Quick Start

### Local development

```bash
cd services/users/app
npm install
npm run dev
```

### With Docker

```bash
docker compose up users
```

## Configuration

### Required environment variables

```bash
# Security
INTERNAL_API_SECRET=xxx     # Internal endpoints protection
JWT_SECRET=xxx              # JWT token validation

# Database
USERS_DB_PATH=/data/db-users.sqlite

# Storage
AVATAR_STORAGE_PATH=/app/avatars

# External services
AUTH_SERVICE_URL=http://auth:3000
```

See `.env.example` for the complete list.

## API Documentation

**Swagger UI**: `https://localhost:8080/users/docs`

- Public endpoints: Protected by JWT
- Internal endpoints: Protected by API key

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
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT NOT NULL,
    status INTEGER NOT NULL,
    last_connection TEXT NOT NULL
);
```

## Services dependencies

### Required services

- `auth` - JWT validation
- `nginx` - Static avatar serving

### Called by

- `social` - Profile retrieval for friends
- `game` - In-game status updates

## Development

### Code structure

- `index.ts` - Entry point, Fastify setup
- `routes/` - Route definitions and middlewares
- `controllers/` - Request parsing/validation
- `usecases/` - Business logic
- `repositories/` - Database access
- `database/` - SQLite configuration

### Adding an endpoint

1. Define Zod schema in `@ft_transcendence/common`
2. Add route in `routes/usersRoutes.ts`
3. Create controller in `controllers/`
4. Implement logic in `usecases/`
5. Add repository methods if needed

# Microservices Architecture - ft_transcendence

> **Note**: The diagrams below are automatically rendered by GitHub.  
> If you don't see them, make sure you're on github.com (not in raw mode).

## Architecture Overview

```mermaid
graph TB
    Client[Client Browser]

    Client -->|HTTPS 8080| Nginx[NGINX Reverse Proxy]

    Nginx --> Frontend[Frontend Vite TypeScript TailwindCSS]
    Nginx --> Auth[Auth Authentication]
    Nginx --> Users[Users Profiles]
    Nginx --> TwoFA[2FA Two-Factor Auth]
    Nginx --> Social[Social Friends Notifications]
    Nginx --> Game[Game Pong Logic]

    Auth -->|volume| DB_Auth[(SQLite Auth)]
    Users -->|volume| DB_Users[(SQLite Users)]
    Social -->|volume| DB_Social[(SQLite Social)]
    TwoFA -->|volume| DB_2FA[(SQLite 2FA)]
    Game -->|volume| DB_Game[(SQLite Game)]

    Users -->|volume| Avatars[(Avatars Storage)]
    Nginx -->|volume RO| Avatars

    style Nginx fill:#2d6fb5,stroke:#1a4d8f,color:#fff
    style Frontend fill:#646cff,stroke:#535bf2,color:#fff
    style Auth fill:#f39c12,stroke:#e67e22,color:#fff
    style Users fill:#9b59b6,stroke:#8e44ad,color:#fff
    style TwoFA fill:#e74c3c,stroke:#c0392b,color:#fff
    style Social fill:#1abc9c,stroke:#16a085,color:#fff
    style Game fill:#3498db,stroke:#2980b9,color:#fff
```

## Services

### NGINX (Reverse Proxy)

- **Exposed port**: 8080
- **Role**: Single entry point, SSL/TLS management, request routing
- **Dependencies**: All backend services
- **Volumes**: Avatars (read-only)
- **Secrets**: SSL certificates (cert.pem, key.pem)

### Frontend

- **Technology**: Vite + TypeScript + TailwindCSS
- **Internal port**: 3000
- **Role**: User interface (SPA)
- **Dependencies**: None (base service)

### Auth Service

- **Internal port**: 3000
- **Role**: Authentication and session management (JWT)
- **Database**: SQLite (db_auth_data volume)
- **Dependencies**: Frontend

### Users Service

- **Internal port**: 3000
- **Role**: User profile management
- **Database**: SQLite (db_users_data volume)
- **Volumes**: Avatars (read/write), db_users_data
- **Dependencies**: Frontend, Auth

### 2FA Service

- **Internal port**: 3000
- **Role**: Two-factor authentication (TOTP)
- **Database**: SQLite (db_2fa_data volume)
- **Dependencies**: Auth, Users

### Social Service

- **Internal port**: 3000
- **Role**: Friend relationships, presence tracking, real-time notifications via WebSocket
- **Database**: SQLite (db_social_data volume)
- **Dependencies**: Frontend, Auth, Users

### Game Service

- **Internal port**: 3000
- **Role**: Pong game logic, matchmaking, real-time gameplay via WebSocket
- **Database**: SQLite (db_game_data volume)
- **Dependencies**: Frontend

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant N as NGINX
    participant F as Frontend
    participant A as Auth
    participant 2 as 2FA
    participant US as Users

    U->>N: GET /login
    N->>F: Forward request
    F-->>U: Login page

    U->>N: POST /api/auth/login
    N->>A: Forward credentials
    A->>A: Verify password
    A-->>F: JWT Token

    F->>2:  GET /api/2fa/status
    2->>A:  Verify JWT
    A-->>2: Token valid
    2-->>F: 2FA enabled

    F-->>U: Request 2FA code

    U->>N: POST /api/2fa/verify
    N->>2: Forward 2FA code + JWT
    2->>2: Validate TOTP
    2-->>F:  Verified

    F->>US: GET /api/users/profile
    US->>A:  Verify JWT
    A-->>US:  Token valid
    US-->>F:  User data
    F-->>U: Dashboard
```

## Service Dependencies and Communication

```mermaid
graph TB
    subgraph Entry["Entry Point"]
        Nginx[NGINX Reverse Proxy Port 8080]
    end

    subgraph Frontend_Layer["Frontend Layer"]
        Frontend[Frontend SPA Vite TypeScript TailwindCSS Port 3000]
    end

    subgraph Backend["Backend Services"]
        Auth[Auth Service JWT Management Port 3000]
        Users[Users Service Profile Management Port 3000]
        TwoFA[2FA Service TOTP Validation Port 3000]
        Social[Social Service Friends Presence Notifications Port 3000]
        Game[Game Service Pong Gameplay Port 3000]
    end

    subgraph Data["Data Layer"]
        DB_Auth[(SQLite Auth Data Volume)]
        DB_Users[(SQLite Users Data Volume)]
        DB_2FA[(SQLite 2FA Data Volume)]
        DB_Social[(SQLite Social Data Volume)]
        DB_Game[(SQLite Game Data Volume)]
        Avatars[(Avatars File Storage Volume)]
    end

    Client[Client Browser] -->|HTTPS requests| Nginx

    Nginx -->|static files| Frontend
    Nginx -->|api auth| Auth
    Nginx -->|api users| Users
    Nginx -->|api 2fa| TwoFA
    Nginx -->|api social WebSocket| Social
    Nginx -->|api game WebSocket| Game
    Nginx -->|avatars static| Avatars

    Frontend -.->|REST API JWT| Auth
    Frontend -.->|REST API JWT| Users
    Frontend -.->|REST API JWT| TwoFA
    Frontend -.->|REST WebSocket JWT| Social
    Frontend -.->|REST WebSocket JWT| Game

    Users <-->|Internal API Key| Auth
    Auth -->|Internal API Key| TwoFA

    Social -->|Internal API Key| Users

    Auth -->|Read Write| DB_Auth
    Users -->|Read Write| DB_Users
    Users -->|Read Write| Avatars
    TwoFA -->|Read Write| DB_2FA
    Social -->|Read Write| DB_Social
    Game -->|Read Write| DB_Game

    style Nginx fill:#2d6fb5,stroke:#1a4d8f,color:#fff
    style Frontend fill:#646cff,stroke:#535bf2,color:#fff
    style Auth fill:#f39c12,stroke:#e67e22,color:#fff
    style Users fill:#9b59b6,stroke:#8e44ad,color:#fff
    style TwoFA fill:#e74c3c,stroke:#c0392b,color:#fff
    style Social fill:#1abc9c,stroke:#16a085,color:#fff
    style Game fill:#3498db,stroke:#2980b9,color:#fff
```

### Communication Patterns

**1. Client → Services (via NGINX)**

- All HTTP/HTTPS requests go through NGINX reverse proxy
- NGINX routes based on URL path (`/api/auth/*`, `/api/users/*`, etc.)
- WebSocket connections for real-time communication (Social: friend notifications, Game: gameplay)

**2. Service-to-Service Communication**

Services communicate via internal Docker network (`backend`) using REST API calls with API Key authentication (`INTERNAL_API_SECRET`).

#### Internal API Reference

| From Service | To Service       | Authentication | Endpoint                                | Purpose                            |
| ------------ | ---------------- | -------------- | --------------------------------------- | ---------------------------------- |
| **Auth**     | **Users**        | API Key        | `POST /api/internal/users/new-user`     | Create new user after registration |
| **Users**    | **Auth**         | API Key        | `GET /api/internal/2fa/status/: id`     | Get 2FA status for user profile    |
| **Auth**     | **2FA**          | API Key        | `POST /api/internal/2fa/setup`          | Setup 2FA for user                 |
| **Auth**     | **2FA**          | API Key        | `POST /api/internal/2fa/verify`         | Verify 2FA code                    |
| **Auth**     | **2FA**          | API Key        | `POST /api/internal/2fa/disable`        | Disable 2FA for user               |
| **Auth**     | **2FA**          | API Key        | `POST /api/internal/2fa/status`         | Get 2FA status                     |
| **Social**   | **Users**        | API Key        | `GET /api/internal/users/profile/: id`  | Get user profile data              |
| **Social**   | **Users**        | API Key        | `PATCH /api/internal/users/: id/status` | Update user online/offline status  |
| **Frontend** | **All Services** | JWT            | All `/api/*` public endpoints           | User authentication                |

**Note**: The **Game** service operates independently and does not make internal API calls to other services.

**3. Data Persistence**

- Each service has its own isolated SQLite database (database per service pattern)
- Databases stored in Docker volumes for persistence
- Avatars shared between Users (RW) and NGINX (RO)

**4. Real-time Communication**

- **Social Service WebSocket**: Friend request notifications, presence updates (online/offline status)
- **Game Service WebSocket**: Real-time game state synchronization, player movements, score updates

## Services Summary

| Service      | Port | Technology                                 | Database        | Main Role                            |
| ------------ | ---- | ------------------------------------------ | --------------- | ------------------------------------ |
| **NGINX**    | 8080 | Nginx                                      | -               | Reverse proxy, SSL/TLS, static files |
| **Frontend** | 3000 | Vite + TypeScript + TailwindCSS            | -               | User interface (SPA)                 |
| **Auth**     | 3000 | Node.js + TypeScript + Fastify             | SQLite (volume) | JWT Authentication                   |
| **Users**    | 3000 | Node.js + TypeScript + Fastify             | SQLite (volume) | Profile management                   |
| **2FA**      | 3000 | Node.js + TypeScript + Fastify             | SQLite (volume) | Two-factor auth (TOTP)               |
| **Social**   | 3000 | Node.js + TypeScript + Fastify + WebSocket | SQLite (volume) | Friends, presence, notifications     |
| **Game**     | 3000 | Node.js + TypeScript + Fastify + WebSocket | SQLite (volume) | Pong game, real-time gameplay        |

## Exposed Endpoints

```
https://localhost:8080/
├── /                       → Frontend (Vite SPA)
├── /api/auth/*             → Auth Service (login, logout, verify)
├── /api/users/*            → Users Service (profile, avatars)
├── /api/2fa/*              → 2FA Service (setup, verify)
├── /api/social/*           → Social Service (friends, requests)
│   └── /api/social/ws      → WebSocket (friend notifications, presence)
├── /api/game/*             → Game Service (matchmaking, game state)
│   └── /api/game/ws        → WebSocket (real-time gameplay)
└── /avatars/*              → Static avatars (NGINX serves from volume)
```

## Networks

- **backend**: Main network for inter-service communication
- **pong**: Dedicated network (potentially for game WebSocket isolation)

## Persistent Volumes

| Volume           | Usage                                   | Services               | Access |
| ---------------- | --------------------------------------- | ---------------------- | ------ |
| `db_auth_data`   | Authentication data (SQLite)            | Auth                   | RW     |
| `db_users_data`  | User profiles (SQLite)                  | Users                  | RW     |
| `db_social_data` | Friend relationships, presence (SQLite) | Social                 | RW     |
| `db_2fa_data`    | 2FA secrets (SQLite)                    | 2FA                    | RW     |
| `db_game_data`   | Game history (SQLite)                   | Game                   | RW     |
| `avatars_data`   | Avatar images                           | Users (RW), NGINX (RO) | Mixed  |

## Healthchecks

All Node.js services use a TCP healthcheck on port 3000:

- **Interval**: 5-30s
- **Timeout**: 3s
- **Retries**: 5-12
- **Start period**: 10-20s

NGINX has an HTTP healthcheck on port 8080.

## Startup Order

1. **Frontend** (base service, no dependencies)
2. **Auth** (depends on Frontend)
3. **Users** (depends on Frontend + Auth)
4. **2FA** (depends on Auth + Users)
5. **Social** (depends on Frontend + Auth + Users)
6. **Game** (depends on Frontend)
7. **NGINX** (depends on all services)

## Getting Started

### Prerequisites

Ensure you have the required environment variables configured:

```bash
# Verify environment setup
make verif-env
```

### Build the application

```bash
# Build all services
make build
```

### Start the application

```bash
# Start all services in detached mode
make up
```

This command will:

- Verify environment variables
- Start all Docker containers
- Services will be accessible at `https://localhost:8080`

### Development mode

For development with hot-reload:

```bash
# Build development environment
make dev-build

# Start in development mode
make dev-up
```

### Stop the application

```bash
# Stop all services
make down
```

## Useful Commands

### View logs from specific services

```bash
# View NGINX logs
make logs-nginx

# View Frontend logs
make logs-frontend

# View Auth service logs
make logs-auth

# View Users service logs
make logs-users

# View 2FA service logs
make logs-2fa

# View Social service logs
make logs-social

# View Game service logs
make logs-game
```

### Access service shell

```bash
# Access NGINX shell
make sh-nginx

# Access Frontend shell
make sh-frontend

# Access Auth shell
make sh-auth

# Access Users shell
make sh-users
```

### Code formatting

```bash
# Format code
make format

# Check formatting
make format-check
```

### Run tests

```bash
# Run all tests
make test
```

This command will:

- Stop any running services
- Build fresh containers
- Run the test suite
- Clean up after tests

### Debug mode

Run services with logs visible in the console:

```bash
# Start in debug mode with console logs
make debug
```

## Database Management

### Reset all databases

**Warning**: This will delete all data in volumes.

```bash
# Stop services and remove all volumes
make reset-db
```

After resetting, rebuild and restart:

```bash
make build
make up
```

## Development Workflow

### Initial setup

```bash
# Install dependencies and hooks
make install

# Build the project
make build

# Start services
make up
```

### Daily development

```bash
# Start development mode
make dev-up

# View logs
make logs-frontend
make logs-auth

# Access a service shell
make sh-users
```

### Before committing

```bash
# Check code formatting
make format-check

# Run tests
make test
```

## Monitoring

This project includes a complete monitoring stack with Prometheus, Grafana and AlertManager.

See **[monitoring.md](./monitoring.md)** for the complete monitoring architecture documentation.

```bash
# Build monitoring stack
make build-monitoring

# Start with monitoring
make up-monitoring

# Access monitoring interfaces
# - Grafana: http://localhost:8080/grafana/
# - Prometheus: http://localhost:8080/prometheus/
```

## Troubleshooting

### Services won't start

```bash
# Check environment variables
make verif-env

# Rebuild containers
make build

# Try starting again
make up
```

### Port conflicts

If port 8080 is already in use, modify the `PORT` variable in your `.env` file:

```bash
PORT=8081
```

### Database issues

```bash
# Reset all databases
make reset-db

# Rebuild and restart
make build
make up
```

### View service status

```bash
# Check running containers
docker ps

# View logs for debugging
make logs-nginx
make logs-frontend
```

## Architecture Principles

This architecture follows microservices best practices:

- Separation of concerns
- Database per service pattern
- API-based communication with API Key authentication for internal services
- Centralized gateway (NGINX)
- Health monitoring on all services
- Container orchestration with Docker Compose
- Environment-based configuration
- Automated testing pipeline

```

```

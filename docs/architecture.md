# Microservices Architecture - ft_transcendence

> **Note**: The diagrams below are automatically rendered by GitHub.  
> If you don't see them, make sure you're on github.com (not in raw mode).

## Architecture Overview

```mermaid
graph TB
    Client[Client Browser]

    Client -->|"HTTPS ${PORT} -- default 8080"| Nginx[NGINX Reverse Proxy]

    Nginx --> Frontend[Frontend]
    Nginx --> Auth[Auth Service]
    Nginx --> Users[Users Service]
    Nginx --> TwoFA[2FA Service]
    Nginx --> Social[Social Service]
    Nginx --> Game[Game Service]

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

- **Exposed port**: ${PORT}
- **Role**: Single entry point, SSL/TLS management, request routing
- **Dependencies**: All backend services
- **Volumes**: Avatars (read-only)
- **Secrets**: SSL certificates (cert. pem, key.pem)
- **Configuration**: Uses environment variables for service URLs

### Frontend

- **Internal port**: 3000
- **Role**: User interface (SPA)
- **Dependencies**: None (base service)
- **Technology**: Vite + TypeScript + TailwindCSS

### Auth Service

- **Internal port**: 3000
- **Role**: Authentication and session management (JWT), admin validation
- **Volumes**: SQLite (db_auth_data volume)
- **Dependencies**: Frontend

### Users Service

- **Internal port**: 3000
- **Role**: User profile management
- **Volumes**: Avatars (read/write), db_users_data, SQLite (db_users_data volume)
- **Dependencies**: Frontend, Auth

### 2FA Service

- **Internal port**: 3000
- **Role**: Two-factor authentication (TOTP)
- **Volumes**: SQLite (db_2fa_data volume)
- **Dependencies**: Auth, Users

### Social Service

- **Internal port**: 3000
- **Role**: Friend relationships, presence tracking, real-time notifications
- **Volumes**: SQLite (db_social_data volume)
- **Dependencies**: Frontend, Auth, Users

### Game Service

- **Internal port**: 3000
- **Role**: Pong game logic, matchmaking, real-time gameplay
- **Volumes**: SQLite (db_game_data volume)
- **Dependencies**: Frontend

## Database

Using SQLite with Better-sqlite3 for efficient, file-based data storage.
SQLite is a file, so it has to lock it when writing to prevent data corruption.
Better-sqlite3 is synchronous, so each operation blocks the event loop until it completes.
There are some risks of using SQLite in a concurrent environment, especially with multiple instances of the service. It's not only for performance but also for data integrity and preventing database locks and crash.
The pragmas set here help manage how SQLite handles concurrency and performance:

- **WAL** : Write-Ahead Logging, writen to improve concurrency and performance in SQLite databases. Reading doesn't block writing and vice versa, allowing multiple operations to occur simultaneously.
- **NORMAL** : Balances performance and data integrity. It reduces the number of sync operations to disk, improving speed while still providing a reasonable level of data safety.
- **CACHE_SIZE** = -64000 : Sets the cache size to 64MB. A negative value indicates the size is in kilobytes. A larger cache can improve performance by reducing disk I/O operations.
- **BUSY_TIMEOUT** = 5000 : Sets the busy timeout to 5000 milliseconds (5 seconds). This means that if the database is locked (e.g., by another connection), SQLite will wait up to 5 seconds for the lock to be released before returning a "database is busy" error.

## Authentication Flow

```mermaid
    sequenceDiagram
        participant U as Client
        participant N as NGINX
        participant F as Frontend
        participant A as Auth Service
        participant T as TwoFA Service
        participant US as Users Service

        U->>N: GET /login
        N->>F: Forward request
        F-->>U: Render login page

        U->>N: POST /api/auth/login
        N->>A: Forward credentials
        A->>A: Verify password
        A-->>N: Return JWT to frontend
        N-->>F: Return JWT

        F->>N: GET /api/2fa/status
        N->>T: Forward request (with JWT)
        T->>A: Verify JWT
        A-->>T: Token valid
        T-->>N: 2FA enabled (if configured)
        N-->>F: 2FA status

        F-->>U: Prompt for 2FA code

        U->>N: POST /api/2fa/verify
        N->>T: Forward 2FA code + JWT
        T->>T: Validate TOTP
        T-->>N: Verified
        N-->>F: Verified

        F->>N: GET /api/users/profile
        N->>US: Forward request (with JWT)
        US->>A: Verify JWT
        A-->>US: Token valid
        US-->>N: User data
        N-->>F: User data
        F-->>U: Homepage
```

## Service Dependencies and Communication

```mermaid
graph LR
  %% Focused view: inter-service calls only

  Client["Client Browser"]
  Nginx["NGINX"]
  Frontend["Frontend"]
  Auth["Auth Service"]
  Users["Users Service"]
  TwoFA["TwoFA Service"]
  Social["Social Service"]
  Game["Game Service"]

  subgraph External["External Layer"]
    Client
    Nginx
  end

  subgraph Internal["Internal Services"]
    Frontend
    Auth
    Users
    TwoFA
    Social
    Game
  end

  Client ==> Nginx
  Nginx <==> Frontend
  Nginx ==> Auth
  Nginx ==> Users
  Nginx ==> TwoFA
  Nginx ==> Social
  Nginx ==> Game

  Auth <===> Users
  Auth ==> TwoFA
  Auth ==> Game

  Social ==> Users

  %% WebSocket flows (client via NGINX to services)
  Client <-.-> Nginx
  Nginx <-.-> Social
  Nginx <-.-> Game

  subgraph Legend["Legend"]
    direction LR
    LS1[Service] ==>|HTTP API| LS2[Service]
    LS3[Service] <-.->|WebSocket| LS4[Service]
  end

  style Auth fill:#f39c12,stroke:#e67e22,color:#fff
  style Users fill:#9b59b6,stroke:#8e44ad,color:#fff
  style TwoFA fill:#e74c3c,stroke:#c0392b,color:#fff
  style Social fill:#1abc9c,stroke:#16a085,color:#fff
  style Game fill:#3498db,stroke:#2980b9,color:#fff
  style Frontend fill:#646cff,stroke:#535bf2,color:#fff
```

### Communication Patterns

**1. Client → Services (via NGINX)**

- All HTTP/HTTPS requests go through NGINX reverse proxy
- NGINX routes based on URL path (`/api/auth/*`, `/api/users/*`, etc.)
- NGINX uses environment variables for service URLs (e.g., `${AUTH_SERVICE_URL}`)
- WebSocket connections for real-time communication (Social: friend notifications, Game: gameplay)

**2. Service-to-Service Communication**

Services communicate via internal Docker network (`backend`) using REST API calls with API Key authentication (`INTERNAL_API_SECRET`).

For the complete list of internal calls (endpoints, authentication, purpose), see: **[docs/internal_api.md](./internal_api.md)**

**3. Admin Authentication**

- Admin validation is handled by Auth service for acces to monitoring
- `/stub_status` endpoint (NGINX metrics) is restricted to internal networks only

**4. Real-time Communication**

- **Social Service WebSocket**: Friend request notifications, presence updates (online/offline status)
- **Game Service WebSocket**: Real-time game state synchronization, player movements, score updates

## Networks

- **backend**: Main network for inter-service communication
- **monitoring**: Dedicated network for monitoring stack (Prometheus, Grafana, AlertManager)

## Startup Order

1. **Frontend** (base service, no dependencies)
2. **Auth** (depends on Frontend)
3. **Users** (depends on Frontend + Auth)
4. **2FA** (depends on Auth + Users)
5. **Social** (depends on Frontend + Auth + Users)
6. **Game** (depends on Frontend)
7. **Prometheus** (depends on Auth + Users for scraping)
8. **AlertManager** (depends on Prometheus)
9. **Grafana** (depends on Prometheus)
10. **NGINX** (depends on all services)
11. **NGINX Exporter** (depends on NGINX)

## Getting Started

or setup, commands and development instructions, see: **[docs/getting_started.md](./getting_started.md)**

## Monitoring

This project includes a complete monitoring stack with Prometheus, Grafana and AlertManager integrated into the main build.

See **[docs/monitoring.md](./monitoring.md)** for the complete monitoring architecture documentation.

## Architecture Principles

This architecture follows microservices best practices:

- Separation of concerns
- Database per service pattern
- API-based communication with API Key authentication for internal services
- Centralized gateway (NGINX) with parameterized routing
- Health monitoring on all services
- Container orchestration with Docker Compose
- Environment-based configuration
- Automated testing pipeline
- Integrated monitoring stack

<div align="center">

# ft_transcendence

**A full-stack, real-time multiplayer Pong platform — 42 School final project**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
</div>


---

## 🎮 Overview

A complete multiplayer gaming platform with real-time gameplay, user authentication, social features, and a monitoring stack. Built as a microservices architecture that's easy to deploy and scale.

### Features

- **Real-time Pong** — multiplayer game with WebSocket-powered live gameplay
- **Tournaments** — bracket-style tournament system with matchmaking lobby
- **User profiles** — custom avatars, match history, stats
- **Social system** — friend requests, online/offline presence, real-time notifications
- **Secure authentication** — JWT sessions, Google OAuth, two-factor authentication
- **Monitoring stack** — Prometheus + Grafana dashboards + AlertManager with Discord alerts

### Key Capabilities

Play matches in real-time against other users, manage your social connections, track your stats, and see everything that's happening on the system through the monitoring dashboard. Account security is handled with modern authentication standards including 2FA. The whole thing runs in Docker, so you can spin it up anywhere.

---

## 📸 Screenshots

### Login & Authentication

![Login Screen](./docs/screenshots/login.png)


### Home Dashboard

![Dashboard](./docs/screenshots/home.png)


### Live Gameplay

![Game Interface](./docs/screenshots/game.png)


### Game Settings

![Game Settings](./docs/screenshots/game_settings.png)


### User Profile

![User Profile](./docs/screenshots/profile.png)


### Settings Panel

![Settings](./docs/screenshots/settings.png)


### Monitoring Dashboard

![Monitoring](./docs/screenshots/monitoring.png)


---

## 📚 Additional Documentation

- [Getting Started Guide](./docs/getting_started.md)
- [Complete Architecture](./docs/architecture.md)
- [Internal API](./docs/internal_api.md)
- [Monitoring Setup](./docs/monitoring.md)
- [Example .env Configuration](./.env.example)

#### Internal API Reference

This document list all inter-services calls.

| From Service | To Service | Authentication | Endpoint                               | Purpose                                                   |
| ------------ | ---------- | -------------- | -------------------------------------- | --------------------------------------------------------- |
| **Auth**     | **Game**   | API Key        | `POST /api/internal/game/cleanup/:id`  | Clear game websockets if logout during game or tournament |
| **Auth**     | **Users**  | API Key        | `POST /api/internal/users/new-user`    | Create new user after registration                        |
| **Auth**     | **2FA**    | API Key        | `POST /api/internal/2fa/verify`        | Verify 2FA code                                           |
| **Auth**     | **2FA**    | API Key        | `POST /api/internal/2fa/setup`         | Setup 2FA for user                                        |
| **Auth**     | **2FA**    | API Key        | `POST /api/internal/2fa/disable`       | Disable 2FA for user                                      |
| **Auth**     | **2FA**    | API Key        | `POST /api/internal/2fa/status`        | Get 2FA status                                            |
| **Social**   | **Users**  | API Key        | `GET /api/internal/users/profile/:id`  | Get user profile data                                     |
| **Social**   | **Users**  | API Key        | `PATCH /api/internal/users/:id/status` | Update user online/offline status                         |
| **Users**    | **Auth**   | API Key        | `GET /api/internal/users`              | Get all users for update DB                               |
| **Users**    | **Auth**   | API Key        | `GET /api/internal/2fa/status/:id`     | Get 2FA status for user profile                           |
| **Users**    | **Auth**   | API Key        | `GET /api/internal/2fa/status/:id`     | Get isGoogle info for user profile                        |

```

```

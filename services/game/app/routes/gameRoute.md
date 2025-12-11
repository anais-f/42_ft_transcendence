# Game API Documentation

This file provides an overview of the game routes implemented. It covers the
primary routes for creating games, joining games, and establishing WebSocket
connections.

## API Endpoints

### 1. Join Game

- **URL**: `/api/game/join-game/:code`
- **Method**: `POST`
- **Authentication**: Requires JWT authentication via `jwtAuthMiddleware`.
- **Parameters**:
  - `code`: The unique game code returned from the `new-game` endpoint
    (format: XXXX-XXXX).
- **Response**:
  - **201**: returns a jwt token for the session.
  - **404**: unknow game code
  - **409**: player already in a game 
  - **409**: player not allowed in this game

#### Description

This endpoint allows a player to join an existing game using the game code. The
received JWT serves to authenticate the player for subsequent interactions
within the game.

---

### 2. Create New Game

- **URL**: `/api/game/new-game`
- **Method**: `POST`
- **Authentication**: Requires JWT authentication via `jwtAuthMiddleware`.
- **Response**:
  - **201**: returns a game code
  - **404**: unknow game code.
  - **409**: player already in a game

#### Description

This endpoint creates a new game and assigns Player 1 to the requester. Note
that the requester still needs to join the game using the code returned.

---

### 3. WebSocket Connection

- **URL**: `/api/game/ws`
- **Method**: `GET`
- **WebSocket**: Enabled.
- **Authentication**: Requires JWT token obtained from the `join-game` endpoint.

#### Description

This endpoint facilitates WebSocket connections to the game. Upon connecting,
the client must provide the JWT token received from the `join-game` endpoint,
allowing for real-time communication within the game.

---

## Development Notes

- All JWT-related authentication is handled by the `jwtAuthMiddleware`.

---

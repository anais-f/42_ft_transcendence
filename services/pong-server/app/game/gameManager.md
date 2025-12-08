> [!WARNING]
> This information is subject to change at any time.

## Overview

The game management system relies on three main data structures: `games`,
`playerToActiveGame`, and `playerToPendingGame`. The `games` map stores all
games (both active and pending), identified by a unique code in `XXXX-XXXX`
format. Each game contains information about both players (`p1` and `p2`), the
game instance, and a status indicating whether the game is pending, active, or
finished. Each player is represented by the `Iplayer` interface which combines
their identifier and their WebSocket connection state (`connState`). The two
player maps provide reverse relationships: `playerToActiveGame` tracks ongoing
matches while `playerToPendingGame` handles reserved games (e.g., tournament
matches). This separation allows a player to be in an active game while having
a future game reserved. The typical flow starts with game creation via
`requestGame()` for friendly matches or `requestPendingGame()` for tournaments,
then transitions to active when both players connect.

---

## Data Structures

### `GameStatus`

| Value      | Description                        |
| ---------- | ---------------------------------- |
| `pending`  | Game reserved, waiting for players |
| `active`   | Game in progress                   |
| `finished` | Game completed                     |

### `Iplayer`

| Property    | Type      | Description                |
| ----------- | --------- | -------------------------- |
| `id`        | `number`  | Player ID                  |
| `connState` | `boolean` | WebSocket connection state |

### `GameData`

| Property       | Type                     | Description               |
| -------------- | ------------------------ | ------------------------- |
| `p1`           | `Iplayer \| undefined`   | Player 1 data             |
| `p2`           | `Iplayer \| undefined`   | Player 2 data             |
| `gameInstance` | `IGameData \| undefined` | Game instance             |
| `status`       | `GameStatus`             | Current state of the game |

### `games: Map<string, GameData>`

| Key                     | Value      |
| ----------------------- | ---------- |
| Game code (`XXXX-XXXX`) | `GameData` |

### `playerToActiveGame: Map<number, string>`

| Key       | Value     | Description           |
| --------- | --------- | --------------------- |
| Player ID | Game code | Currently active game |

### `playerToPendingGame: Map<number, string>`

| Key       | Value     | Description                      |
| --------- | --------- | -------------------------------- |
| Player ID | Game code | Reserved game (e.g., tournament) |

> [!NOTE]
> A player can have at most ONE active game and ONE pending game simultaneously.

---

## Functions

### `generateCode()`

- Generates unique game codes in `XXXX-XXXX` format (uppercase)
- Uses a `do-while` loop to ensure the generated code doesn't already exist in
  the map

### `requestGame({ code, pID })`

- **If `code` is null**: Creates a new active game, assigns the player as `p1`,
  and returns the new game code
- **If `code` is provided**: Validates that the game exists, throws `'unknown
  game code'` error if not found, otherwise returns the code
- Throws `'player already in a game'` if the player already has an active game

### `requestPendingGame({ pID1, pID2 })`

- Creates a new pending game with both players pre-assigned
- Useful for tournament matches where both players are known in advance
- Assigns `pID1` as `p1` and `pID2` as `p2`
- Both players start with `connState: false` and `status: 'pending'`
- Throws `'player already has a pending game'` if either player already has a
  pending game
- Throws `'unknown player'` if player verification fails (TODO)

### `activateGame(gameCode)`

- Transitions a game from `pending` to `active` status
- Moves players from `playerToPendingGame` to `playerToActiveGame`
- Throws `'unknown game code'` if the game doesn't exist
- Throws `'game not pending'` if the game is not in pending status

### `addPlayerToGame(gameCode, playerId)`

- Attempts to add a second player to an existing game
- Throws `'unknown game code'` if the game doesn't exist
- Throws `'player already in a game'` if the player already has an active game
- Throws `'game full'` if `p2` slot is already taken

> [!TIP]
> This function is used for friendly games where players join via game code.

### `leaveGame(playerId)`

- Removes a player from their current active game
- Clears `p1` or `p2` slot depending on which one the player occupied
- Automatically deletes the game if both players have left
- Silent fail if the player is not in any active game

### `cancelPendingGame(gameCode)`

- Cancels a pending game and removes it from the system
- Clears both players from `playerToPendingGame`
- Throws `'unknown game code'` if the game doesn't exist
- Throws `'game not pending'` if the game is not in pending status

---

## State Transitions

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   requestPendingGame()          activateGame()          │
│         │                            │                  │
│         ▼                            ▼                  │
│     ┌───────┐                   ┌────────┐              │
│     │PENDING│ ─────────────────►│ ACTIVE │              │
│     └───────┘                   └────────┘              │
│         │                            │                  │
│         │ cancelPendingGame()        │ leaveGame()      │
│         ▼                            ▼                  │
│     ┌────────┐                  ┌────────┐              │
│     │DELETED │                  │FINISHED│              │
│     └────────┘                  └────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Error Summary

| Function             | Error                                 | Cause                             |
| -------------------- | ------------------------------------- | --------------------------------- |
| `requestGame`        | `'unknown game code'`                 | Provided code doesn't exist       |
| `requestGame`        | `'player already in a game'`          | Player already has an active game |
| `requestPendingGame` | `'player already has a pending game'` | Player already has a pending game |
| `requestPendingGame` | `'unknown player'`                    | Player verification failed (TODO) |
| `activateGame`       | `'unknown game code'`                 | Game code doesn't exist           |
| `activateGame`       | `'game not pending'`                  | Game is not in pending status     |
| `addPlayerToGame`    | `'unknown game code'`                 | Game code doesn't exist           |
| `addPlayerToGame`    | `'player already in a game'`          | Player already has an active game |
| `addPlayerToGame`    | `'game full'`                         | `p2` slot is already occupied     |
| `cancelPendingGame`  | `'unknown game code'`                 | Game code doesn't exist           |
| `cancelPendingGame`  | `'game not pending'`                  | Game is not in pending status     |

---

## TODOs

- [x] #108
- [ ] #109
- [ ] #110
- [ ] #111
- [x] #112
- [x] #113
- [ ] #114
- [x] #115

> [!WARNING]
> This information is subject to change at any time.

## Data Structures

### `Iplayer`

| Property    | Type      | Description                |
| ----------- | --------- | -------------------------- |
| `id`        | `number`  | Player ID                  |
| `connState` | `boolean` | WebSocket connection state |

### `games: Map<string, GameData>`

| Key                     | Value                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Game code (`XXXX-XXXX`) | `{ p1: Iplayer \| undefined, p2: Iplayer \| undefined, gameInstance: IGameData \| undefined }` |

### `playerToGame: Map<number, string>`

| Key       | Value     |
| --------- | --------- |
| Player ID | Game code |

Logically these maps can handle friendly games and tournament games.

---

## Functions

### `generateCode()`

- Generates unique game codes in `XXXX-XXXX` format (uppercase)
- Uses a `do-while` loop to ensure the generated code doesn't already exist in the map

### `requestGame({ code, pID })`

- **If `code` is null**: Creates a new game, assigns the player as `p1`, and returns the new game code
- **If `code` is provided**: Validates that the game exists, throws `'unknown game code'` error if not found, otherwise returns the code
- Throws `'player already in a game'` if the player is already in a game

### `addPlayerToGame(gameCode, playerId)`

- Attempts to add a second player to an existing game
- Throws `'unknown game code'` if the game doesn't exist
- Throws `'player already in a game'` if the player is already in another game
- Throws `'game full'` if `p2` slot is already taken

> [!TIP]
> This function can be used to reserve a game for a specific player (for example for a tournament) or to add a player to a game.

### `leaveGame(playerId)`

- Removes a player from their current game
- Clears `p1` or `p2` slot depending on which one the player occupied
- Automatically deletes the game if both players have left
- Silent fail if the player is not in any game

### `requestMatchGame({ pID1, pID2 })`

- Creates a new game with both players pre-assigned
- Useful for tournament matches where both players are known in advance
- Assigns `pID1` as `p1` and `pID2` as `p2`
- Both players start with `connState: false`
- Throws `'player already in a game'` if either player is already in another game
- Throws `'unknown player'` if player verification fails (TODO)

---

## Error Summary

| Function           | Error                        | Cause                                    |
| ------------------ | ---------------------------- | ---------------------------------------- |
| `requestGame`      | `'unknown game code'`        | Provided code doesn't exist              |
| `requestGame`      | `'player already in a game'` | Player is already in a game              |
| `addPlayerToGame`  | `'unknown game code'`        | Game code doesn't exist                  |
| `addPlayerToGame`  | `'player already in a game'` | Player is already in another game        |
| `addPlayerToGame`  | `'game full'`                | `p2` slot is already occupied            |
| `requestMatchGame` | `'player already in a game'` | Either player is already in another game |
| `requestMatchGame` | `'unknown player'`           | Player verification failed (TODO)        |

---

## TODOs

- [x] #108
- [ ] #109
- [ ] #110
- [ ] #111
- [ ] #112
- [ ] #113
- [ ] #114
- [x] #115

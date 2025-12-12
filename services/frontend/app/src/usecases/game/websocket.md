# Game WebSocket Architecture

This directory contains the client-side logic for handling WebSocket
communication with the game server.

## Structure

```
game/
├── wsDispatcher.ts     # Routes incoming WebSocket messages
└── handlers/           # JSON message handlers
    └── eogHandler.ts
```

## Message Types

The WebSocket connection handles two types of messages:

- **JSON messages** - Control messages (game state, events, etc.)
- **ArrayBuffer messages** - Binary game packets (physics, inputs, etc.)

## Dispatcher

`wsDispatcher.ts` is the entry point for all incoming WebSocket messages. It
checks if the message is binary (`ArrayBuffer`) or JSON and routes accordingly.

## Available Handlers

### EOG (End of Game)

Triggered when the game ends (opponent left, forfeit, etc.).

**Message format:**
```json
{
    "type": "EOG",
    "data": { "reason": "opponent left" }
}
```

**Behavior:** Redirects the user to `/home`.

### opponent

Triggered when an opponent joins the lobby.

**Message format:**
```json
{
    "type": "opponent",
    "data": { "id": 123 }
}
```

**Behavior:** Fetches the opponent's profile (username, avatar) from the users
API and updates the lobby page.

# Ball Interpolation System

## Overview

The client uses velocity-based interpolation to render smooth ball movement
between server updates. Instead of waiting for each server tick, the client
predicts the ball position using the last known position, velocity, and a speed
factor.

## How It Works

1. **Server sends S06BallSync** containing:
   - `pos`: Current ball position (Vector2)
   - `velo`: Ball velocity direction (normalized Vector2)
   - `factor`: Speed multiplier

2. **Client stores state** in `gameRenderer`:
   - Ball position, velocity, factor
   - Timestamp of last update (`lastBallUpdate`)

3. **Animation loop** (`requestAnimationFrame`):
   - Calculates delta time since last server update
   - Predicts position: `predictedPos = pos + velo * factor * deltaTime`
   - Renders ball at predicted position

## Files

| File              | Role                                                      |
| ----------------- | --------------------------------------------------------- |
| `gameRenderer.ts` | Stores ball state, runs animation loop, predicts position |
| `wsDispatcher.ts` | Passes pos/velo/factor from S06BallSync to renderer       |

## Key Methods

### `gameRenderer.setBallState(pos, velo, factor)`

Called when S06BallSync is received. Updates ball state and resets the interpolation timer.

### `gameRenderer.getPredictedBallPos()`

Returns the interpolated ball position based on:

```
predictedX = ballPos.x + ballVelo.x * factor * dt
predictedY = ballPos.y + ballVelo.y * factor * dt
```

Where `dt` is seconds since last server update.

## Configuration

The `factor` parameter in S06BallSync controls ball speed. Currently set to `1`
in `startGame.ts`. Adjust this value to change ball speed without modifying
TPS.

## Limitations

- No collision prediction: ball may briefly clip through walls before server
  correction
- Relies on accurate server timestamps for smooth interpolation

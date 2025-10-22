import { GameEngine, GameState } from '@ft_transcendence/pong-shared'
import { PhysicsEngine } from '@ft_transcendence/pong-shared/engine/physics-engine.js'

let PE = new PhysicsEngine()
let GE = new GameEngine(PE, 20)
GE.setState(GameState.Started)

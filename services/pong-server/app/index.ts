import { GameEngine, GameState } from '@packages/pong-shared'
import { PhysicsEngine } from '@packages/pong-shared/srcs/engine/physics-engine'

// tempary main untils mutiple game instace + game creation
const physicsEngine = new PhysicsEngine()
const gameEngine = new GameEngine(physicsEngine, 20)

gameEngine.setState(GameState.Started)

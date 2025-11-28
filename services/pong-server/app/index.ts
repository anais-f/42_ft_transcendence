import { GameState } from '@ft_transcendence/pong-shared'
import { createGame } from './utils/createGame.js'

const game = createGame(100)
game.GE.setState(GameState.Started)
/* -------------- --- ---------------- */

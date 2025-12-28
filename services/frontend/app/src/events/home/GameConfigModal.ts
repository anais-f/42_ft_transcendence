import { Modal } from '../../components/Modal.js'
import { ToggleGroup } from '../../components/ToggleGroup.js'
import { Button } from '../../components/Button.js'
import { PaddleShape, ObstacleType } from '@ft_transcendence/pong-shared'

export const GAME_CONFIG_MODAL_ID = 'game-config-modal'

export const GameConfigModal = (): string => {
	const content = /*html*/ `
		${ToggleGroup({
			name: 'paddleShape',
			label: 'Paddle Shape',
			options: [
				{ value: PaddleShape.Classic, label: 'Classic' },
				{ value: PaddleShape.V, label: 'V-Shape' }
			],
			defaultValue: PaddleShape.Classic
		})}
		${ToggleGroup({
			name: 'obstacle',
			label: 'Obstacles',
			options: [
				{ value: ObstacleType.None, label: 'None' },
				{ value: ObstacleType.Diamonds, label: 'Diamonds' },
				{ value: ObstacleType.Hexagons, label: 'Hexagons' }
			],
			defaultValue: ObstacleType.None
		})}
		<div class="mt-6">
			${Button({
				id: 'create-game-submit',
				text: 'Create Game',
				type: 'button',
				action: 'submit-game-config'
			})}
		</div>
	`

	return Modal({
		id: GAME_CONFIG_MODAL_ID,
		title: 'Game Options',
		content
	})
}

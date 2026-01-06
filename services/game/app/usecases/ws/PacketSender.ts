import Bottleneck from 'bottleneck'
import { IS00PongBase } from '@ft_transcendence/pong-shared/network/Packet/Server/S00.js'
import { SPacketsType } from '@ft_transcendence/pong-shared/network/Packet/packetTypes.js'
import { DEFAULT_TPS } from '@ft_transcendence/pong-shared'
import { GameData } from '../managers/gameData.js'

export class PacketSender {
	private queue: Map<SPacketsType, IS00PongBase> = new Map()
	private limiter: Bottleneck
	private running: boolean = false

	constructor(private gameData: GameData) {
		this.limiter = new Bottleneck({
			minTime: 1000 / DEFAULT_TPS,
			maxConcurrent: 1
		})
	}

	push(type: SPacketsType, packet: IS00PongBase): void {
		this.queue.set(type, packet)
	}

	async start(): Promise<void> {
		this.running = true

		while (this.running) {
			await this.limiter.schedule(async () => {
				this.flush()
			})
		}
	}

	stop(): void {
		this.running = false
	}

	private flush(): void {
		if (this.queue.size === 0) return

		for (const [, packet] of this.queue) {
			const buffer = packet.serialize()
			this.gameData.p1.ws?.send(buffer)
			this.gameData.p2?.ws?.send(buffer)
		}

		this.queue.clear()
	}
}

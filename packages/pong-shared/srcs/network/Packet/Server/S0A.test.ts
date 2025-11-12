import { PongBall } from '../../../engine/objects/PongBall'
import { PongObject } from '../../../engine/objects/PongObject'
import { PongPad } from '../../../engine/objects/PongPad'
import { Segment } from '../../../math/Segment'
import { AShape } from '../../../math/shapes/AShape'
import { Circle } from '../../../math/shapes/Circle'
import { Polygon } from '../../../math/shapes/Polygon'
import { Vector2 } from '../../../math/Vector2'
import { packetBuilder, SPacketsType } from '../packetBuilder'
import { S0ASync } from './S0A'

describe('S0A', () => {
	let S0A: S0ASync
	beforeEach(() => {
		S0A = new S0ASync(
			[
				// borders
				new Segment(new Vector2(-15, -5), new Vector2(15, -5)),
				new Segment(new Vector2(-15, 5), new Vector2(15, 5)),
				new Segment(new Vector2(-15, -5), new Vector2(-15, 5)),
				new Segment(new Vector2(15, -5), new Vector2(15, 5))
			],
			[
				// pads
				new PongPad(1, new PongObject(new Circle(new Vector2(0, 0), 0.5))),
				new PongPad(
					2,
					new PongObject(
						[
							new Circle(new Vector2(), 0.4),
							new Polygon([new Vector2(), new Vector2(1, 1), new Vector2(1, 0)])
						],
						new Vector2()
					)
				)
			],
			new PongBall(5.54353, new Vector2(9, 2)),
			123
		)
	})

	test('serialize returns correct buffer', () => {
		const buff = S0A.serialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S0A.time)

		const type = view.getUint8(8)
		expect(type).toBe(SPacketsType.S0A)

		expect(view.getUint8(9)).toBe(4)
		const s1 = new Segment(
			new Vector2(view.getFloat64(10, true), view.getFloat64(18, true)),
			new Vector2(view.getFloat64(26, true), view.getFloat64(34, true))
		)
		const s2 = new Segment(
			new Vector2(view.getFloat64(42, true), view.getFloat64(50, true)),
			new Vector2(view.getFloat64(58, true), view.getFloat64(66, true))
		)
		const s3 = new Segment(
			new Vector2(view.getFloat64(74, true), view.getFloat64(82, true)),
			new Vector2(view.getFloat64(90, true), view.getFloat64(98, true))
		)
		const s4 = new Segment(
			new Vector2(view.getFloat64(106, true), view.getFloat64(114, true)),
			new Vector2(view.getFloat64(122, true), view.getFloat64(130, true))
		)

		const eqSeg = (a: Segment, b: Segment) => {
			const a1 = a.getP1(),
				a2 = a.getP2()
			const b1 = b.getP1(),
				b2 = b.getP2()
			return (
				(a1.equals(b1) && a2.equals(b2)) || (a1.equals(b2) && a2.equals(b1))
			)
		}

		const borders = S0A.getBorders()

		expect(borders.some((b) => eqSeg(b, s1))).toBe(true)
		expect(borders.some((b) => eqSeg(b, s2))).toBe(true)
		expect(borders.some((b) => eqSeg(b, s3))).toBe(true)
		expect(borders.some((b) => eqSeg(b, s4))).toBe(true)
		// todo test pads and ball
	})
	test('serialize + deserialize', () => {
		const buff = S0A.serialize()
		const packet = packetBuilder.deserializeS(buff)

		expect(packet?.time).toBeCloseTo(S0A.time)
		console.log(packet)
		expect(packet).toBeInstanceOf(S0ASync)
		const p = packet as S0ASync
		const borders = p.getBorders()
		expect(borders).toHaveLength(S0A.getBorders().length)

		borders.forEach((e, i) => {
			//console.log(`i: ${i}`)
			//console.log(`e p1 x:${e.getP1().getX()} | e p1 y: ${e.getP1().getY()}`)
			//console.log(`e p2 x:${e.getP2().getX()} | e p2 y: ${e.getP2().getY()}`)
			//console.log(`s p1 x:${S0A.getBorders()[i].getP1().getX()} | s p1 y: ${S0A.getBorders()[i].getP1().getY()}`)
			//console.log(`s p2 x:${S0A.getBorders()[i].getP2().getX()} | s p2 y: ${S0A.getBorders()[i].getP2().getY()}`)
			expect(e.getP1().equals(S0A.getBorders()[i].getP1())).toBe(true)
			expect(e.getP2().equals(S0A.getBorders()[i].getP2())).toBe(true)
		})
		const ball = p.getBall() as PongBall
		expect(ball.getPos().equals(S0A.getBall().getPos())).toBe(true)
		expect(
			ball.getObj().getOrigin().equals(S0A.getBall().getObj().getOrigin())
		).toBe(true)
		expect(ball.velo.equals(S0A.getBall().velo)).toBe(true)
		expect(
			typeof ball.getObj().getHitbox()[0] ===
				typeof S0A.getBall().getObj().getHitbox()[0]
		).toBe(true)
		expect(ball.getObj().getHitbox()[0]).toBeInstanceOf(Circle)
		expect(S0A.getBall().getObj().getHitbox()[0]).toBeInstanceOf(Circle)
		expect((ball.getObj().getHitbox()[0] as Circle).getRad()).toBeCloseTo(
			(S0A.getBall().getObj().getHitbox()[0] as Circle).getRad()
		)

		expect(p.getPads()).toHaveLength(2)
		expect(S0A.getPads()).toHaveLength(2)
		const pad1: PongPad = p.getPads()[0]
		const pad2: PongPad = p.getPads()[1]
		expect(pad1.getPlayer()).toBeCloseTo(S0A.getPads()[0].getPlayer())
		expect(pad2.getPlayer()).toBeCloseTo(S0A.getPads()[1].getPlayer())

		p.getPads().forEach((pad, padI) => {
			const origPad = S0A.getPads()[padI]

			expect(
				pad.getObjs().getOrigin().equals(origPad.getObjs().getOrigin())
			).toBe(true)

			const hitboxes = pad.getObjs().getHitbox()
			const origHitboxes = origPad.getObjs().getHitbox()
			expect(hitboxes).toHaveLength(origHitboxes.length)

			hitboxes.forEach((hb: AShape, i: number) => {
				const origHb = origHitboxes[i]
				expect(hb.getOrigin().equals(origHb.getOrigin())).toBe(true)

				if (origHb instanceof Circle) {
					expect(hb).toBeInstanceOf(Circle)
					expect((hb as Circle).getRad()).toBeCloseTo(
						(origHb as Circle).getRad()
					)
				} else if (origHb instanceof Polygon) {
					// type et segments du polygone
					expect(hb).toBeInstanceOf(Polygon)
					const segs = (hb as Polygon).getSegment()
					const origSegs = origHb.getSegment()
					expect(segs).toHaveLength(origSegs.length)
					segs.forEach((seg: Segment, j: number) => {
						expect(seg.getP1().equals(origSegs[j].getP1())).toBe(true)
						expect(seg.getP2().equals(origSegs[j].getP2())).toBe(true)
					})
				}
			})
		})
	})
})

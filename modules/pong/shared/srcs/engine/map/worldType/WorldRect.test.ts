import { Polygon } from "../../../math/shapes/Polygon"
import { Circle } from "../../../math/shapes/Circle"
import { Segment } from "../../../math/Segment"
import { Vector2 } from "../../../math/Vector2"
import { WorldRect } from "./WorldRect"
describe("WorldRect", () => {



    test("WorldRect init", () => {
        const w = new WorldRect()
        const p = new Vector2()
        expect(w.isInside(p)).toBe(true)
    })

    describe("isInside", () =>{
        let w: WorldRect

        beforeAll(() => {
            w = new WorldRect()
        })
        describe("vec2", () => {
            describe("basic test", () => {

                test("inside", () => {
                    expect(w.isInside(new Vector2())).toBe(true)
                    expect(w.isInside(new Vector2(5, 5))).toBe(true)
                    expect(w.isInside(new Vector2(-5, 5))).toBe(true)
                    expect(w.isInside(new Vector2(5, -5))).toBe(true)
                    expect(w.isInside(new Vector2(-5, -5))).toBe(true)
                })

                test("outside", () => {
                    expect(w.isInside(new Vector2(-21, 0))).toBe(false)    
                    expect(w.isInside(new Vector2(0, -11))).toBe(false)    
                    expect(w.isInside(new Vector2(-21, -11))).toBe(false)    
                    expect(w.isInside(new Vector2(21, 11))).toBe(false)    
                    expect(w.isInside(new Vector2(0, 11))).toBe(false)    
                    expect(w.isInside(new Vector2(21, 11))).toBe(false)    
                })
            })

            describe("advanced test", () => {
                test("limit test", () => {
                    expect(w.isInside(new Vector2(-20, 10))).toBe(true)
                    expect(w.isInside(new Vector2(-20, -10))).toBe(true)
                    expect(w.isInside(new Vector2(-20, 0))).toBe(true)
                    expect(w.isInside(new Vector2(0, -10))).toBe(true)

                    expect(w.isInside(new Vector2(20, -10))).toBe(true)
                    expect(w.isInside(new Vector2(20, 10))).toBe(true)
                    expect(w.isInside(new Vector2(20, 0))).toBe(true)
                    expect(w.isInside(new Vector2(0, 10))).toBe(true)
                })

                test("close out", () => {
                    expect(w.isInside(new Vector2(-20.001, 10))).toBe(false)
                    expect(w.isInside(new Vector2(-20.001, -10))).toBe(false)
                    expect(w.isInside(new Vector2(-20.001, 0))).toBe(false)

                    expect(w.isInside(new Vector2(20.001, -10))).toBe(false)
                    expect(w.isInside(new Vector2(20.001, 10))).toBe(false)
                    expect(w.isInside(new Vector2(20.001, 0))).toBe(false)


                    expect(w.isInside(new Vector2(-20, -10.001))).toBe(false)
                    expect(w.isInside(new Vector2(-20.001, 0))).toBe(false)
                    expect(w.isInside(new Vector2(0, -10.001))).toBe(false)

                    expect(w.isInside(new Vector2(20, -10.001))).toBe(false)
                    expect(w.isInside(new Vector2(20, 10.001))).toBe(false)
                    expect(w.isInside(new Vector2(0, 10.001))).toBe(false)
                })
            })
        })


        describe("Circle", () => {
            test("inside", () => {
                const c = new Circle(new Vector2(0, 0), 1)
                expect(w.isInside(c)).toBe(true)
            })

            test("touching border", () => {
                const c = new Circle(new Vector2(0, 0), 10)
                expect(w.isInside(c)).toBe(true)
            })

            test("center inside, border outside", () => {
                const c = new Circle(new Vector2(0, 0), 100)
                expect(w.isInside(c)).toBe(false)
            })

            test("center outside", () => {
                const c = new Circle(new Vector2(100, 100), 1)
                expect(w.isInside(c)).toBe(false)
            })

            test("borderline", () => {
                const c = new Circle(new Vector2(20, 10), 1)
                expect(w.isInside(c)).toBe(false) 
            })
        })
        describe("Circle - extra cases", () => {

            test("tiny circle in the top-left corner (inside)", () => {
                const c = new Circle(new Vector2(-19.999, -9.999), 0.001)
                expect(w.isInside(c)).toBe(true)
            })

            test("circle tangent to the left border", () => {
                const c = new Circle(new Vector2(-20 + 2, 0), 2)
                expect(w.isInside(c)).toBe(true)
            })

            test("circle tangent to the right border", () => {
                const c = new Circle(new Vector2(20 - 2, 0), 2)
                expect(w.isInside(c)).toBe(true)
            })

            test("circle tangent to the top border", () => {
                const c = new Circle(new Vector2(0, -10 + 2), 2)
                expect(w.isInside(c)).toBe(true)
            })

            test("circle tangent to the bottom border", () => {
                const c = new Circle(new Vector2(0, 10 - 2), 2)
                expect(w.isInside(c)).toBe(true)
            })

            test("circle slightly overflowing to the left", () => {
                const c = new Circle(new Vector2(-20 + 0.999, 0), 1)
                expect(w.isInside(c)).toBe(false)
            })

            test("circle slightly overflowing to the right", () => {
                const c = new Circle(new Vector2(20 - 0.999, 0), 1)
                expect(w.isInside(c)).toBe(false)
            })

            test("circle slightly overflowing the bottom", () => {
                const c = new Circle(new Vector2(0, 10 - 0.999), 1)
                expect(w.isInside(c)).toBe(false)
            })

            test("circle slightly overflowing the top", () => {
                const c = new Circle(new Vector2(0, -10 + 0.999), 1)
                expect(w.isInside(c)).toBe(false)
            })

            test("huge circle covering the whole rectangle", () => {
                const c = new Circle(new Vector2(0, 0), 100)
                expect(w.isInside(c)).toBe(false)
            })

            test("circle with center exactly on the left border", () => {
                const c = new Circle(new Vector2(-20, 0), 1)
                expect(w.isInside(c)).toBe(false)
            })

            test("circle with center exactly on the bottom border", () => {
                const c = new Circle(new Vector2(0, 10), 1)
                expect(w.isInside(c)).toBe(false)
            })

            test("tiny circle completely outside", () => {
                const c = new Circle(new Vector2(30, 0), 0.5)
                expect(w.isInside(c)).toBe(false)
            })

            test("circle tangent to two borders (corner)", () => {
                const c = new Circle(new Vector2(-20 + 2, -10 + 2), 2)
                expect(w.isInside(c)).toBe(true)
            })

            test("circle tangent to two borders (corner, but slightly overflowing)", () => {
                const c = new Circle(new Vector2(-20 + 1.999, -10 + 1.999), 2)
                expect(w.isInside(c)).toBe(false)
            })

            test("circle tangent to the top-left corner", () => {
                const c = new Circle(new Vector2(-20 + 1, -10 + 1), 1)
                expect(w.isInside(c)).toBe(true)
            })

            test("circle tangent to the bottom-right corner", () => {
                const c = new Circle(new Vector2(20 - 1, 10 - 1), 1)
                expect(w.isInside(c)).toBe(true)
            })
        })

        describe("Segment", () => {
            describe("basic test", () => {
                // T: top
                // B: bottom
                // R: Right
                // L: left
                // M: mid
                let ML: Vector2
                let MR: Vector2
                let MM: Vector2
                let TL: Vector2
                let TR: Vector2
                let TM: Vector2
                let BL: Vector2
                let BR: Vector2
                let BM: Vector2
                beforeAll(() => {
                    ML = new Vector2(-20, 0)
                    MR = new Vector2(20, 0)
                    MM = new Vector2()
                    TL = new Vector2(-20, 10)
                    TR = new Vector2(20, 10)
                    TM = new Vector2(0, 10)
                    BL = new Vector2(-20, -10)
                    BR = new Vector2(20, -10)
                    BM = new Vector2(0, -10)
                })

                test("inside", () => {
                    const seg: Segment[] = [
                        new Segment(MM, TL),
                        new Segment(MM, new Vector2(6, 3))
                    ]
                    seg.forEach((s) => {
                        expect(w.isInside(s)).toBe(true)
                    })
                })

                test("diagonal", () => {
                    const v = [ML, MR, MM, TL, TR, TM, BL, BR, BM]
                    const s: Segment[] = []
                    v.forEach((a, i) => v.slice(i + 1).forEach(b => s.push(new Segment(a, b))))
                    s.forEach((e) => expect(w.isInside(e)).toBe(true))
                })

                test("outside", () => {
                    const outsidePoints = [
                        new Vector2(-25, 0),
                        new Vector2(25, 0),
                        new Vector2(0, 15),
                        new Vector2(0, -15),
                        new Vector2(-25, -15),
                        new Vector2(25, 15)
                    ]
                    const s: Segment[] = []
                    outsidePoints.forEach((a, i) => outsidePoints.slice(i + 1).forEach(b => s.push(new Segment(a, b))))
                    s.forEach((seg) => expect(w.isInside(seg)).toBe(false))
                })

                test("both", () => {
                    const insidePoints = [
                        MM, TL, TR, TM, BL, BR, BM, ML, MR
                    ]
                    const outsidePoints = [
                        new Vector2(-25, 0),
                        new Vector2(25, 0),
                        new Vector2(0, 15),
                        new Vector2(0, -15)
                    ]
                    insidePoints.forEach((a) => {
                        outsidePoints.forEach((b) => {
                            expect(w.isInside(new Segment(a, b))).toBe(false)
                            expect(w.isInside(new Segment(b, a))).toBe(false)
                        })
                    })
                })

                test("border edge", () => {
                    expect(w.isInside(new Segment(TL, TR))).toBe(true)
                    expect(w.isInside(new Segment(TR, BR))).toBe(true)
                    expect(w.isInside(new Segment(BR, BL))).toBe(true)
                    expect(w.isInside(new Segment(BL, TL))).toBe(true)
                })

                test("crossing rectangle", () => {
                    expect(w.isInside(new Segment(new Vector2(-100, 0), new Vector2(100, 0)))).toBe(false)
                })
            })
        })


        describe("Polygon", () => {
            test("fully inside", () => {
                // Triangle bien à l'intérieur
                const poly = new Polygon([
                    new Vector2(-10, 0),
                    new Vector2(0, 5),
                    new Vector2(10, 0)
                ])
                expect(w.isInside(poly)).toBe(true)
            })

            test("crossing border", () => {
                // Un sommet dehors
                const poly = new Polygon([
                    new Vector2(-10, 0),
                    new Vector2(0, 5),
                    new Vector2(30, 0) // dehors
                ])
                expect(w.isInside(poly)).toBe(false)
            })

            test("polygon on border", () => {
                // Sommets sur le rectangle
                const poly = new Polygon([
                    new Vector2(-20, -10),
                    new Vector2(20, -10),
                    new Vector2(20, 10),
                    new Vector2(-20, 10)
                ])
                expect(w.isInside(poly)).toBe(true)
            })

            test("all points outside", () => {
                const poly = new Polygon([
                    new Vector2(50, 50),
                    new Vector2(60, 60),
                    new Vector2(70, 50)
                ])
                expect(w.isInside(poly)).toBe(false)
            })
        })

        describe("Polygon - extra cases", () => {
            // Rectangle goes from (-20, -10) to (20, 10)

            test("simple triangle fully inside", () => {
                const poly = new Polygon([
                    new Vector2(-10, 0),
                    new Vector2(0, 5),
                    new Vector2(10, 0)
                ])
                expect(w.isInside(poly)).toBe(true)
            })

            test("triangle crossing left border", () => {
                const poly = new Polygon([
                    new Vector2(-25, 0), // outside
                    new Vector2(-10, 5), // inside
                    new Vector2(-10, -5) // inside
                ])
                expect(w.isInside(poly)).toBe(false)
            })

            test("quadrilateral on the borders (all corners exactly on rectangle)", () => {
                const poly = new Polygon([
                    new Vector2(-20, -10),
                    new Vector2(20, -10),
                    new Vector2(20, 10),
                    new Vector2(-20, 10)
                ])
                expect(w.isInside(poly)).toBe(true)
            })

            test("polygon with one vertex just outside right border", () => {
                const poly = new Polygon([
                    new Vector2(-10, 0),
                    new Vector2(10, 0),
                    new Vector2(21, 0) // outside
                ])
                expect(w.isInside(poly)).toBe(false)
            })

            test("polygon with all vertices just inside the border", () => {
                const poly = new Polygon([
                    new Vector2(-19.999, -9.999),
                    new Vector2(19.999, -9.999),
                    new Vector2(19.999, 9.999),
                    new Vector2(-19.999, 9.999)
                ])
                expect(w.isInside(poly)).toBe(true)
            })

            test("polygon totally outside (far away)", () => {
                const poly = new Polygon([
                    new Vector2(100, 100),
                    new Vector2(110, 100),
                    new Vector2(110, 110),
                    new Vector2(100, 110)
                ])
                expect(w.isInside(poly)).toBe(false)
            })

            test("polygon exactly covering the rectangle", () => {
                const poly = new Polygon([
                    new Vector2(-20, -10),
                    new Vector2(20, -10),
                    new Vector2(20, 10),
                    new Vector2(-20, 10)
                ])
                expect(w.isInside(poly)).toBe(true)
            })

            test("star-shaped polygon fully inside", () => {
                const poly = new Polygon([
                    new Vector2(0, 0),
                    new Vector2(5, 2),
                    new Vector2(2, 5),
                    new Vector2(0, 3),
                    new Vector2(-2, 5),
                    new Vector2(-5, 2),
                    new Vector2(-3, 0),
                    new Vector2(-5, -2),
                    new Vector2(-2, -5),
                    new Vector2(0, -3),
                    new Vector2(2, -5),
                    new Vector2(5, -2)
                ])
                expect(w.isInside(poly)).toBe(true)
            })

            test("polygon with one vertex just above the top border", () => {
                const poly = new Polygon([
                    new Vector2(0, -10.001),  // outside top
                    new Vector2(5, 0),        // inside
                    new Vector2(0, 5)         // inside
                ])
                expect(w.isInside(poly)).toBe(false)
            })

            test("degenerate polygon (all points on a line inside)", () => {
                const poly = new Polygon([
                    new Vector2(-10, 0),
                    new Vector2(0, 0),
                    new Vector2(10, 0)
                ])
                expect(w.isInside(poly)).toBe(true)
            })

            test("degenerate polygon (all points on a line, some outside)", () => {
                const poly = new Polygon([
                    new Vector2(-30, 0), // outside
                    new Vector2(0, 0),   // inside
                    new Vector2(30, 0)   // outside
                ])
                expect(w.isInside(poly)).toBe(false)
            })
        })
    })
})

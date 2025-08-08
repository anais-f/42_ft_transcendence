import { Shape } from "../../math/shapes/Shape"

export class pad {
    private hitbox: Shape

    public constructor(hitbox: Shape) {
        this.hitbox = hitbox
    }

    public intersect(objs: Shape[]) {
        for (const obj of objs) {
            if (obj.intersect(this.hitbox)) return true
        }
        return false
    }
}

import { Shape } from "../../math/shapes/Shape"

class pad {
    private hitbox: Shape

    public constructor(hitbox: Shape) {
        this.hitbox = hitbox
    }

    public intersect(objs: Shape) {
        for (const obj in objs) {
            if (obj.intersect()) return true
        }
        return false
    }
}

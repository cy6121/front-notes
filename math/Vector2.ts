export class Vector2 {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    sub(v: Vector2) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    cross(v: Vector2) {
        return this.x * v.y - this.y * v.x;
    }

    equal(v: Vector2) {
        return this.x === v.x && this.y === v.y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}
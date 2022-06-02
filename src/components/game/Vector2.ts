export default class Vector2 {
    x: number
    z: number
    constructor(x: number, z: number) {
        this.x = x;
        this.z = z;
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.z);
    }

    multiplyX(val: number): Vector2 {
        this.x *= val;
        return this
    }

    multiplyZ(val: number): Vector2 {
        this.z *= val;
        return this
    }

    add(v2: Vector2): Vector2 {
        this.x += v2.x;
        this.z += v2.z;
        return this;
    }
}
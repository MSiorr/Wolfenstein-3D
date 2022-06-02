import Matrix4 from "./Matrix4";

export default class Vector3 {
    x: number
    y: number
    z: number
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    set(vec: Vector3): Vector3 {
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
        return this
    }

    normalize(): Vector3 {
        let len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        if (len > 0.00001) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        return this
    }

    sub(v: Vector3) {
        this.x -= v.x
        this.y -= v.y
        this.z -= v.z

        return this;
    }

    add(v: Vector3) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;
    }

    translate(x: number, y: number, z: number) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    rotateY(angle: number) {
        this.y += angle;
    }

    inverse() {
        this.multiply(-1);
        return this
    }

    multiply(val: number) {
        this.x *= val;
        this.y *= val;
        this.z *= val;
        return this
    }

    divide(val: number) {
        this.x /= val;
        this.y /= val;
        this.z /= val;
        return this
    }

    zReverse() {
        this.z *= -1;
        return this;
    }

    xReverse() {
        this.x *= -1;
        return this;
    }

    static cross(v1: Vector3, v2: Vector3): Vector3 {
        return new Vector3(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x
        )
    }

    transformMat4(mat: Matrix4) {
        let m = mat.matrix;
        let w = m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15]
        w = w || 1.0
        let out = Vector3.zero();
        out.x = (m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12]) / w
        out.y = (m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13]) / w
        out.z = (m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14]) / w

        this.x = out.x;
        this.y = out.y;
        this.z = out.z;

        return this
    }

    isEval(vec: Vector3) {
        if (vec.x == this.x && vec.y == this.y && vec.z == this.z) {
            return true
        } else {
            return false
        }
    }

    flipXZ() {
        let x = this.x;
        let z = this.z;
        this.x = z;
        this.z = x;

        return this;
    }

    static up(): Vector3 {
        return new Vector3(0, 1, 0);
    }

    static forward(): Vector3 {
        return new Vector3(0, 0, 1);
    }

    static backward(): Vector3 {
        return new Vector3(0, 0, -1);
    }

    static down(): Vector3 {
        return new Vector3(0, -1, 0);
    }

    static zero(): Vector3 {
        return new Vector3(0, 0, 0);
    }

    static fromAngle(angle: number) {
        angle = angle - Math.PI / 2
        return new Vector3(-Math.cos(angle), 0, Math.sin(angle));
    }

    static distance(v1: Vector3, v2: Vector3): number {
        return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.z - v1.z, 2))
    }
}
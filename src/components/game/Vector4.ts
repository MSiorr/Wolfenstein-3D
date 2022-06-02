import Matrix4 from "./Matrix4"

export default class Vector4 {
    x: number
    y: number
    z: number
    w: number

    tab: number[]
    constructor(x: number, y: number, z: number, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        this.tab = [x, y, z, w]
    }


    static vectorMultiply(v: Vector4, m: Matrix4) {
        let dst = [];
        for (let i = 0; i < 4; ++i) {
            dst[i] = 0.0;
            for (let j = 0; j < 4; ++j) {
                dst[i] += v.tab[j] * m.matrix[j * 4 + i];
            }
        }
        return new Vector4(dst[0], dst[1], dst[2], dst[3]);
    }

    private updateTab() {
        this.tab = [this.x, this.y, this.z, this.w];
    }
}
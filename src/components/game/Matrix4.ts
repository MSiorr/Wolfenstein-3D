import Vector3 from "./Vector3";

export default class Matrix4 {
    matrix: number[]
    constructor(matrix: number[] = null) {
        this.matrix = matrix != null ? matrix : [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1]
    }

    perspective(fieldOfView: number, aspect: number, near: number, far: number) {
        let f: number = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView);
        let rangeInv: number = 1.0 / (near - far)

        this.matrix = [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]
        return this;
    }

    translate(tx: number, ty: number, tz: number) {
        this.multiply(Matrix4.translation(tx, ty, tz))
        return this;
    }

    xRotate(angle: number) {
        this.multiply(Matrix4.xRotation(angle));
        return this;
    }

    yRotate(angle: number) {
        this.multiply(Matrix4.yRotation(angle));
        return this;
    }

    zRotate(angle: number) {
        this.multiply(Matrix4.zRotation(angle));
        return this;
    }

    scale(sx: number, sy: number, sz: number) {
        this.multiply(Matrix4.scaling(sx, sy, sz));
        return this;
    }

    static lookAt(vec: Vector3, target: Vector3, up: Vector3) {
        let zAxis = vec.clone().sub(target).normalize();
        let xAxis = Vector3.cross(up, zAxis).normalize();
        let yAxis = Vector3.cross(zAxis, xAxis).normalize();

        return new Matrix4([
            xAxis.x, xAxis.y, xAxis.z, 0,
            yAxis.x, yAxis.y, yAxis.z, 0,
            zAxis.x, zAxis.y, zAxis.z, 0,
            vec.x,
            vec.y,
            vec.z,
            1,
        ]);
    }

    clone(): Matrix4 {
        let mat = new Matrix4();
        mat.matrix = Array.from(this.matrix);
        return mat
    }

    positionFromMatrix(): Vector3 {
        return new Vector3(this.matrix[12], this.matrix[13], this.matrix[14])
    }

    multiply(mat: Matrix4) {
        var b00 = mat.matrix[0 * 4 + 0];
        var b01 = mat.matrix[0 * 4 + 1];
        var b02 = mat.matrix[0 * 4 + 2];
        var b03 = mat.matrix[0 * 4 + 3];
        var b10 = mat.matrix[1 * 4 + 0];
        var b11 = mat.matrix[1 * 4 + 1];
        var b12 = mat.matrix[1 * 4 + 2];
        var b13 = mat.matrix[1 * 4 + 3];
        var b20 = mat.matrix[2 * 4 + 0];
        var b21 = mat.matrix[2 * 4 + 1];
        var b22 = mat.matrix[2 * 4 + 2];
        var b23 = mat.matrix[2 * 4 + 3];
        var b30 = mat.matrix[3 * 4 + 0];
        var b31 = mat.matrix[3 * 4 + 1];
        var b32 = mat.matrix[3 * 4 + 2];
        var b33 = mat.matrix[3 * 4 + 3];
        var a00 = this.matrix[0 * 4 + 0];
        var a01 = this.matrix[0 * 4 + 1];
        var a02 = this.matrix[0 * 4 + 2];
        var a03 = this.matrix[0 * 4 + 3];
        var a10 = this.matrix[1 * 4 + 0];
        var a11 = this.matrix[1 * 4 + 1];
        var a12 = this.matrix[1 * 4 + 2];
        var a13 = this.matrix[1 * 4 + 3];
        var a20 = this.matrix[2 * 4 + 0];
        var a21 = this.matrix[2 * 4 + 1];
        var a22 = this.matrix[2 * 4 + 2];
        var a23 = this.matrix[2 * 4 + 3];
        var a30 = this.matrix[3 * 4 + 0];
        var a31 = this.matrix[3 * 4 + 1];
        var a32 = this.matrix[3 * 4 + 2];
        var a33 = this.matrix[3 * 4 + 3];

        this.matrix = [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
        return this;
    }
    inverse() {
        var m00 = this.matrix[0 * 4 + 0];
        var m01 = this.matrix[0 * 4 + 1];
        var m02 = this.matrix[0 * 4 + 2];
        var m03 = this.matrix[0 * 4 + 3];
        var m10 = this.matrix[1 * 4 + 0];
        var m11 = this.matrix[1 * 4 + 1];
        var m12 = this.matrix[1 * 4 + 2];
        var m13 = this.matrix[1 * 4 + 3];
        var m20 = this.matrix[2 * 4 + 0];
        var m21 = this.matrix[2 * 4 + 1];
        var m22 = this.matrix[2 * 4 + 2];
        var m23 = this.matrix[2 * 4 + 3];
        var m30 = this.matrix[3 * 4 + 0];
        var m31 = this.matrix[3 * 4 + 1];
        var m32 = this.matrix[3 * 4 + 2];
        var m33 = this.matrix[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        this.matrix = [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
        return this
    }

    private static translation(tx: number, ty: number, tz: number) {
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ])
    }

    private static xRotation(angle: number) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);

        return new Matrix4([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ])
    }

    private static yRotation(angle: number) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);

        return new Matrix4([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ])
    }

    private static zRotation(angle: number) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);

        return new Matrix4([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])
    }

    private static scaling(sx: number, sy: number, sz: number) {
        return new Matrix4([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ])
    }
}
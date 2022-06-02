import BoxPoint from "./BoxPoint";

export enum LINE_TYPE {
    "FULL" = "FULL",
    "ONLY_X" = "ONLY_X",
    "ONLY_Y" = "ONLY_Y"
}

export default class BoxLine {
    a: number
    b: number
    p1: BoxPoint;
    p2: BoxPoint;
    type: LINE_TYPE;
    constructor(p1: BoxPoint, p2: BoxPoint) {
        this.p1 = p1;
        this.p2 = p2;
        this.type = (p1.x == p2.x ? LINE_TYPE.ONLY_X : p1.z == p2.z ? LINE_TYPE.ONLY_Y : LINE_TYPE.FULL)
        if (this.type == LINE_TYPE.FULL || this.type == LINE_TYPE.ONLY_Y) {
            this.a = (p2.z - p1.z) / (p2.x - p1.x);
            this.b = p1.z - this.a * p1.x;
        } else {
            this.a = p1.x
            this.b = 0
        }
    }

    calcCrossPoint(secLine: BoxLine): BoxPoint | null {
        let x, z, nulled;

        if (this.type == LINE_TYPE.ONLY_X && (secLine.type == LINE_TYPE.FULL || secLine.type == LINE_TYPE.ONLY_Y)) {
            x = this.a;
            z = secLine.a * x + secLine.b;
        } else if ((this.type == LINE_TYPE.FULL || this.type == LINE_TYPE.ONLY_Y) && secLine.type == LINE_TYPE.ONLY_X) {
            x = secLine.a;
            z = this.a * x + this.b;
        } else if ((this.type == LINE_TYPE.ONLY_X && secLine.type == LINE_TYPE.ONLY_X) || (this.type == LINE_TYPE.ONLY_Y && secLine.type == LINE_TYPE.ONLY_Y)) {
            nulled = true
        } else {
            x = (secLine.b - this.b) / (this.a - secLine.a);
            z = this.a * x + this.b;
        }

        return nulled ? null : new BoxPoint(x, z)
    }

    checkPointBetweenLimit(point: BoxPoint) {
        let limitTabX = [this.p1, this.p2].sort((a, b) => { return a.x - b.x });
        let limitTabZ = [this.p1, this.p2].sort((a, b) => { return a.z - b.z });

        return limitTabX[0].x <= point.x && point.x <= limitTabX[1].x && limitTabZ[0].z <= point.z && point.z <= limitTabZ[1].z
    }

    distanceToPoint(point: BoxPoint) {
        let limitTabX = [this.p1, this.p2].sort((a, b) => { return a.x - b.x });
        let limitTabZ = [this.p1, this.p2].sort((a, b) => { return a.z - b.z });


        let ptX = Math.min(limitTabX[1].x, Math.max(limitTabX[0].x, point.x));
        let ptZ = Math.min(limitTabZ[1].z, Math.max(limitTabZ[0].z, point.z));

        let dst = new BoxPoint(ptX, ptZ).distancePointToPoint(point);
        return dst
    }

    calcPoint(type: 'x' | 'z', val: number): BoxPoint | null {
        if (this.type == LINE_TYPE.ONLY_X) {
            if (type == "x") {
                return null
            } else {
                return new BoxPoint(this.a, val);
            }
        } else {
            if (type == "x") {
                let cross = this.a * val + this.b;
                return new BoxPoint(val, cross);
            } else {
                let cross = (val - this.b) / this.a;
                return new BoxPoint(cross, val);
            }
        }
    }
}
export default class BoxPoint {
    z: number;
    x: number;
    constructor(x: number, z: number) {
        this.x = x;
        this.z = z;
    }

    distancePointToPoint(point: BoxPoint) {
        return Math.abs(Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.z - this.z, 2)));
    }
}
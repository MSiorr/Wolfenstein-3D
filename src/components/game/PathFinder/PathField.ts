import Vector3 from "../Vector3";

export default class PathField {
    x: number;
    z: number;

    gCost: number;
    hCost: number;
    fCost: number;

    parent?: PathField;

    block: boolean;
    constructor(x: number, z: number) {
        this.x = x;
        this.z = z;

        this.gCost = 0;
        this.hCost = 0;
        this.fCost = 0;

        this.block = false;
    }

    clearCosts() {
        this.gCost = 0;
        this.hCost = 0;
        this.fCost = 0;
        this.parent = undefined;
    }

    setGCost(v: number) {
        this.gCost = v;
    }

    setHCost(v: number) {
        this.hCost = v;
    }

    calcFCost() {
        this.fCost = this.gCost + this.hCost;
    }

    distance(target: PathField) {
        return Math.abs(target.x - this.x) + Math.abs(target.z - this.z)
    }

    advanceDistance(target: PathField) {
        return Vector3.distance(new Vector3(this.x, 0, this.z), new Vector3(target.x, 0, target.z));
    }
}
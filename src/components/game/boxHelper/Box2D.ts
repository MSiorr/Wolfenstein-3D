import { config } from "../../Config";
import BoxLine from "./BoxLine";
import { BoxCorners, BoxLines } from "../../Interfaces";
import Object3D from "../objects/Object3D";
import BoxPoint from "./BoxPoint";


export default class Box2D {
    obj: Object3D;
    corners: BoxCorners;
    lines: BoxLines;
    constructor(obj: Object3D) {
        this.obj = obj;
        this.corners = {
            TOP_LEFT: new BoxPoint(this.obj.pos.x - this.obj.width / 2, this.obj.pos.z - this.obj.deep / 2),
            TOP_RIGHT: new BoxPoint(this.obj.pos.x + this.obj.width / 2, this.obj.pos.z - this.obj.deep / 2),
            BOTTOM_LEFT: new BoxPoint(this.obj.pos.x - this.obj.width / 2, this.obj.pos.z + this.obj.deep / 2),
            BOTTOM_RIGHT: new BoxPoint(this.obj.pos.x + this.obj.width / 2, this.obj.pos.z + this.obj.deep / 2)
        }

        this.lines = {
            TOP: new BoxLine(this.corners.TOP_LEFT, this.corners.TOP_RIGHT),
            RIGHT: new BoxLine(this.corners.TOP_RIGHT, this.corners.BOTTOM_RIGHT),
            BOTTOM: new BoxLine(this.corners.BOTTOM_LEFT, this.corners.BOTTOM_RIGHT),
            LEFT: new BoxLine(this.corners.TOP_LEFT, this.corners.BOTTOM_LEFT),
        }
    }

    checkPointInBox(point: BoxPoint) {
        let limitTabX = [this.corners.TOP_LEFT, this.corners.TOP_RIGHT].sort((a, b) => { return a.x - b.x });
        let limitTabZ = [this.corners.TOP_LEFT, this.corners.BOTTOM_LEFT].sort((a, b) => { return a.z - b.z });

        return limitTabX[0].x <= point.x && point.x <= limitTabX[1].x && limitTabZ[0].z <= point.z && point.z <= limitTabZ[1].z
    }

    isCornerCollision(point: BoxPoint) {
        let limitTabX = [this.corners.TOP_LEFT, this.corners.TOP_RIGHT].sort((a, b) => { return a.x - b.x });
        let limitTabZ = [this.corners.TOP_LEFT, this.corners.BOTTOM_LEFT].sort((a, b) => { return a.z - b.z });

        if ((limitTabX[0].x <= point.x && point.x <= limitTabX[1].x) || (limitTabZ[0].z <= point.z && point.z <= limitTabZ[1].z)) {
            return false
        } else {
            return true
        }
    }
}
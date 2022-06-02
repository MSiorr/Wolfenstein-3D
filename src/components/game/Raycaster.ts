import { config } from "../Config";
import DataDisplay from "../HUDElements/helpers/DataDisplay";
import BoxLine from "./boxHelper/BoxLine";
import BoxPoint from "./boxHelper/BoxPoint";
import Camera from "./Camera";
import Matrix4 from "./Matrix4";
import Door from "./objects/Door";
import Object3D from "./objects/Object3D";
import Vector3 from "./Vector3";

export default class Raycaster {
    camera: Camera;
    gridSize: number;
    slowLogOffset: number;
    lastSlowLog: number;
    constructor(camera: Camera) {
        this.camera = camera;
        this.gridSize = config.wallSize;

        this.slowLogOffset = 100;
        this.lastSlowLog = Date.now();
    }



    create(S: Vector3, length: number, collideObjects: Object3D[], target: Vector3 = null) {
        let E;
        let dir;
        let rayLine;

        if (target == null) {
            let matRot = new Matrix4().yRotate(this.camera.rotation.y);
            dir = Vector3.backward().clone().normalize().transformMat4(matRot).normalize();
            let forwardPos = S.clone().add(dir.clone().multiply(1));

            E = S.clone().add(dir.clone().multiply(length));
            rayLine = new BoxLine(new BoxPoint(S.x, S.z), new BoxPoint(forwardPos.x, forwardPos.z));
        } else {
            dir = target.clone().sub(S).normalize();
            E = target.clone();
            rayLine = new BoxLine(new BoxPoint(S.x, S.z), new BoxPoint(E.x, E.z));
        }


        let startPosPoint = new BoxPoint(S.x, S.z);

        let currBlockPos = this.toBlockPosition(startPosPoint);
        let currBlock = collideObjects.find(e => e.pos.x == currBlockPos.x && e.pos.z == currBlockPos.z);

        let targetBlockPos = this.toBlockPosition(new BoxPoint(E.x, E.z));

        let collideFound = false;

        while ((currBlockPos.x != targetBlockPos.x || currBlockPos.z != targetBlockPos.z) && collideFound == false) {
            let newX = dir.x > 0 ? currBlockPos.x + config.wallSize / 2 : currBlockPos.x - config.wallSize / 2;
            let newZ = dir.z > 0 ? currBlockPos.z + config.wallSize / 2 : currBlockPos.z - config.wallSize / 2;
            let pointCrossZ = rayLine.calcPoint('x', newX);
            let pointCrossX = rayLine.calcPoint('z', newZ);
            let distToX = pointCrossX != null ? startPosPoint.distancePointToPoint(pointCrossX) : Infinity;
            let distToZ = pointCrossZ != null ? startPosPoint.distancePointToPoint(pointCrossZ) : Infinity;

            if (distToX < distToZ) {
                let newS = new Vector3(pointCrossX.x, 0, pointCrossX.z).add(dir.clone().multiply(0.1));
                startPosPoint = new BoxPoint(newS.x, newS.z);
            } else {
                let newS = new Vector3(pointCrossZ.x, 0, pointCrossZ.z).add(dir.clone().multiply(0.1));
                startPosPoint = new BoxPoint(newS.x, newS.z);
            }

            currBlockPos = this.toBlockPosition(startPosPoint);
            // currBlock = collideObjects.find(e => e.pos.isEval(new Vector3(currBlockPos.x, 0, currBlockPos.z)) || (e instanceof Door && e.startPos.isEval(new Vector3(currBlockPos.x, 0, currBlockPos.z))));
            currBlock = collideObjects.find(e => e.pos.x == currBlockPos.x && e.pos.z == currBlockPos.z);

            if (currBlock != undefined) {
                collideFound = true;
            }

        }

        let dist = collideFound ? new BoxPoint(S.x, S.z).distancePointToPoint(startPosPoint) : new BoxPoint(S.x, S.z).distancePointToPoint(new BoxPoint(E.x, E.z))
        return { dist: dist, collide: collideFound };
    }

    private toBlockPosition(p: BoxPoint) {
        let newX = Math.sign(p.x) * ((Math.abs(p.x) + this.gridSize / 2) - ((Math.abs(p.x) + this.gridSize / 2) % this.gridSize));
        let newY = Math.sign(p.z) * ((Math.abs(p.z) + this.gridSize / 2) - ((Math.abs(p.z) + this.gridSize / 2) % this.gridSize));

        return new BoxPoint(newX, newY)
    }
}
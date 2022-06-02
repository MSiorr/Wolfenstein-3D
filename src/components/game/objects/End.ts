import Object3D from './Object3D';
import Vector3 from '../Vector3';
import DataDisplay from '../../HUDElements/helpers/DataDisplay';
import Camera from '../Camera';
import { AudioNames, config } from '../../Config';
import Box2D from '../boxHelper/Box2D';
import BoxPoint from '../boxHelper/BoxPoint';
import Wall from './Wall';
import Door from './Door';
import { EndNeighbours } from '../../Interfaces';
import MyAudio from '../../MyAudio';

export default class End extends Object3D {
    pos: Vector3;
    neighbours: EndNeighbours;

    width: number;
    deep: number;

    playerIn: boolean;
    constructor(x: number, y: number, z: number, width: number, neighboursList: Object3D[]) {
        super();
        this.pos = new Vector3(x, y, z);
        this.width = width;
        this.deep = width;
        this.neighbours = { FRONT: undefined, LEFT: undefined, RIGHT: undefined };


        this.playerIn = false;
        this.UpdateNeighTextures(neighboursList);
    }

    UpdateNeighTextures(neigh: Object3D[]) {
        this.FindRightNeighbours(neigh);

        this.neighbours.FRONT ? this.neighbours.FRONT.textureSet(this.neighbours.FRONT.texture, 'wall_elevatorPins_off') : null;
        this.neighbours.LEFT ? this.neighbours.LEFT.textureSet(this.neighbours.FRONT.texture, 'wall_elevatorPins_side') : null;
        this.neighbours.RIGHT ? this.neighbours.RIGHT.textureSet(this.neighbours.FRONT.texture, 'wall_elevatorPins_side') : null;

    }

    FindRightNeighbours(neigh: Object3D[]) {
        let door = neigh.find(e => e instanceof Door);
        let front;
        if (door) {
            let frontPos = this.pos.clone().add(door.pos.clone().sub(this.pos).multiply(-1));
            front = neigh.find(e => e.pos.isEval(frontPos)) as Wall;
            if (front) { front = neigh.find(e => e instanceof Wall) as Wall }
        } else {
            front = neigh.find(e => e instanceof Wall) as Wall;
        }
        let toFront = front.pos.clone().sub(this.pos);

        let leftPos = this.pos.clone().add(toFront.z != 0 ? toFront.clone().flipXZ() : toFront.clone().flipXZ().multiply(-1));
        let rightPos = this.pos.clone().add(toFront.z != 0 ? toFront.clone().flipXZ().multiply(-1) : toFront.clone().flipXZ());

        let left = neigh.find(e => e.pos.isEval(leftPos)) as Wall;
        let right = neigh.find(e => e.pos.isEval(rightPos)) as Wall;

        this.neighbours.FRONT = front;
        this.neighbours.LEFT = left;
        this.neighbours.RIGHT = right;
    }

    checkPlayerIn(camera: Camera) {
        let box = new Box2D(this);
        let camIn = box.checkPointInBox(new BoxPoint(camera.pos.x, camera.pos.z));
        this.playerIn = camIn;
    }

    change() {
        MyAudio.instance.playAudio(AudioNames.ELEVATOR_SWITCH);
        this.neighbours.FRONT ? this.neighbours.FRONT.textureSet(this.neighbours.FRONT.texture, 'wall_elevatorPins_on') : null;
    }

    update(deltaTime: number, camera: Camera) {
        this.checkPlayerIn(camera);
    }
}
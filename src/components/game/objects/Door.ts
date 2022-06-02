import Camera from '../Camera';
import Matrix4 from '../Matrix4';
import Object3D from './Object3D';
import Vector3 from '../Vector3';
import Vector4 from '../Vector4';
import { Object3DWallsTypes } from '../../Interfaces';
import { AudioNames, config } from '../../Config';
import MyAudio from '../../MyAudio';

export default class Door extends Object3D {
    pos: Vector3;
    scale: Vector3;
    rotation: Vector3;

    width: number;
    deep: number;
    rotated: boolean;
    texture: string;
    textureName: string;

    open: boolean;
    moveSpeed: number;
    futurePos: Vector3;
    startPos: Vector3;

    autoClose: NodeJS.Timeout;

    posArray: Float32Array;
    startTextureCoords: Array<number>;
    tempTextureCoords: Array<number>;
    textureArray: Float32Array;

    wallTypes: Object3DWallsTypes;

    count: number;
    lookAtOb?: Camera;
    constructor(x: number, y: number, z: number, width: number, deep: number, rotated: boolean) {
        super();
        this.pos = new Vector3(x, y, z);
        this.scale = new Vector3(1, 1, 1);
        this.rotation = new Vector3(0, 0, 0);
        this.width = width;
        this.deep = deep;
        this.rotated = rotated;

        this.texture = 'WALL';
        this.textureName = '';

        this.open = false;
        this.moveSpeed = 1 * config.wallSize;
        this.futurePos = new Vector3(x, y, z);
        this.startPos = new Vector3(x, y, z);

        this.autoClose = undefined;

        this.posArray = new Float32Array();
        this.startTextureCoords = [];
        this.tempTextureCoords = [];
        this.textureArray = new Float32Array();

        this.wallTypes = {
            "FRONT": 0,
            "TOP": 1,
            "BOTTOM": 2,
            "LEFT": 3,
            "RIGHT": 4,
            "BACK": 5,
        }

        this.count = 6 * 6;
        this.calcPos();
        this.calcTexture();
    }

    calcPos() {
        let midDeepFront = (this.width / 2) - (this.deep / 2);
        let midDeepBack = (this.width / 2) + (this.deep / 2);
        this.posArray = new Float32Array([
            //front
            0, 0, midDeepFront,
            0, this.width, midDeepFront,
            this.width, 0, midDeepFront,
            0, this.width, midDeepFront,
            this.width, this.width, midDeepFront,
            this.width, 0, midDeepFront,

            //top
            0, 0, midDeepFront,
            this.width, 0, midDeepFront,
            0, 0, midDeepBack,
            this.width, 0, midDeepFront,
            this.width, 0, midDeepBack,
            0, 0, midDeepBack,

            //bottom
            0, this.width, midDeepFront,
            0, this.width, midDeepBack,
            this.width, this.width, midDeepFront,
            0, this.width, midDeepBack,
            this.width, this.width, midDeepBack,
            this.width, this.width, midDeepFront,

            //left
            0, 0, midDeepBack,
            0, this.width, midDeepBack,
            0, 0, midDeepFront,
            0, this.width, midDeepBack,
            0, this.width, midDeepFront,
            0, 0, midDeepFront,

            //right
            this.width, 0, midDeepFront,
            this.width, this.width, midDeepFront,
            this.width, 0, midDeepBack,
            this.width, this.width, midDeepFront,
            this.width, this.width, midDeepBack,
            this.width, 0, midDeepBack,

            //back
            0, 0, midDeepBack,
            this.width, 0, midDeepBack,
            0, this.width, midDeepBack,
            0, this.width, midDeepBack,
            this.width, 0, midDeepBack,
            this.width, this.width, midDeepBack,
        ]);
        let matrix = new Matrix4().xRotate(Math.PI);
        matrix.translate(-(this.width / 2), -(this.width / 2), -(this.width / 2));

        for (let i = 0; i < this.posArray.length; i += 3) {
            let vec = Vector4.vectorMultiply(
                new Vector4(
                    this.posArray[i + 0],
                    this.posArray[i + 1],
                    this.posArray[i + 2]
                ),
                matrix
            );
            this.posArray[i + 0] = vec.x;
            this.posArray[i + 1] = vec.y;
            this.posArray[i + 2] = vec.z;
        }

        if (this.rotated) {
            let width = this.width;
            this.width = this.deep;
            this.deep = width;
        }
    }

    calcTexture() {
        let tab = [];
        new Array(5).fill(null).map(e => tab.push(...[
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0
        ]))
        tab.push(...[
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
        ])
        this.startTextureCoords = Array.from(tab);
        this.tempTextureCoords = Array.from(tab);
    }

    forceOpen() {
        if (this.autoClose != undefined) { clearTimeout(this.autoClose); this.autoClose = undefined; }
        this.open = true;
        this.futurePos.set(new Vector3(this.startPos.x + (this.rotated ? 0 : config.wallSize + 5), this.startPos.y, this.startPos.z + (this.rotated ? config.wallSize + 5 : 0)));
        this.autoClose = setTimeout(() => {
            this.move();
        }, config.doorsAutoCloseTime)
    }

    move(camera?: Camera) {
        if (this.autoClose != undefined) { clearTimeout(this.autoClose); this.autoClose = undefined; }
        this.open = !this.open;
        if (this.open) {
            this.futurePos.set(new Vector3(this.startPos.x + (this.rotated ? 0 : config.wallSize + 5), this.startPos.y, this.startPos.z + (this.rotated ? config.wallSize + 5 : 0)));
            this.autoClose = setTimeout(() => {
                this.move(camera);
            }, config.doorsAutoCloseTime)
        } else {
            this.scale.set(new Vector3(1, 1, 1))
            this.futurePos.set(this.startPos);
        }
        if (camera && Vector3.distance(camera.pos, this.pos) < 500) {
            if (this.open) {
                MyAudio.instance.playAudio(AudioNames.DOORS_OPEN);
            } else {
                MyAudio.instance.playAudio(AudioNames.DOORS_CLOSE);
            }
        }

    }

    update(deltaTime: number) {
        if (this.pos.x != this.futurePos.x) {
            if (Math.abs(this.futurePos.x - this.pos.x) < deltaTime * this.moveSpeed && this.open == true) { this.scale.x = 0.5 }
            this.pos.x += Math.sign(this.futurePos.x - this.pos.x) * Math.min(deltaTime * this.moveSpeed, Math.abs(this.futurePos.x - this.pos.x));

        }
        if (this.pos.z != this.futurePos.z) {
            if (Math.abs(this.futurePos.z - this.pos.z) < deltaTime * this.moveSpeed && this.open == true) { this.scale.z = 0.5 }
            this.pos.z += Math.sign(this.futurePos.z - this.pos.z) * Math.min(deltaTime * this.moveSpeed, Math.abs(this.futurePos.z - this.pos.z));
        }
    }
}
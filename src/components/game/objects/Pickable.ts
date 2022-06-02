import Camera from '../Camera';
import Matrix4 from '../Matrix4';
import Object3D from './Object3D';
import Vector3 from '../Vector3';
import Vector4 from '../Vector4';
import AnimationManager from '../AnimationManager';
import { animNames, config } from '../../Config';
import Animation from '../Animation';
import { animationData, pickableAction } from '../../Interfaces';

export default class Pickable extends Object3D {
    pos: Vector3;
    rotation: Vector3;

    width: number;
    deep: number
    texture: string;
    textureName: string;
    count: number;

    posArray: Float32Array;
    startTextureCoords: Array<number>;
    tempTextureCoords: Array<number>;
    textureArray: Float32Array;

    lookAtOb?: Camera;
    action: pickableAction;
    toDelete: boolean;

    constructor(action: pickableAction, x: number, y: number, z: number, width: number) {
        super();
        this.pos = new Vector3(x, y, z);
        this.rotation = new Vector3(0, 0, 0);
        this.scale = new Vector3(1, 1, 1);

        this.width = width;
        this.deep = 0;
        this.texture = 'OBJECT';
        this.textureName = '';
        this.count = 6;

        this.action = action;
        this.toDelete = false;

        this.posArray = new Float32Array();
        this.startTextureCoords = [];
        this.tempTextureCoords = [];
        this.textureArray = new Float32Array();

        this.calsPos();
        this.calcTexture();
    }

    calsPos() {
        this.posArray = new Float32Array([
            0,
            0,
            this.width / 2,
            0,
            this.width,
            this.width / 2,
            this.width,
            0,
            this.width / 2,
            0,
            this.width,
            this.width / 2,
            this.width,
            this.width,
            this.width / 2,
            this.width,
            0,
            this.width / 2,
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
    }

    calcTexture() {
        let tab = [
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0
        ];

        this.startTextureCoords = Array.from(tab);
        this.tempTextureCoords = Array.from(tab);
    }

    pick(camera: Camera) {
        let action = this.action(camera);
        action ? this.toDelete = true : null
    }

    update(camera: Camera) {
        if (Vector3.distance(camera.pos, this.pos) < camera.collisionRadius * 2) {
            this.pick(camera);
        }
    }
}

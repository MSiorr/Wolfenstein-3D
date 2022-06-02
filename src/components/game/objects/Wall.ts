import Camera from '../Camera';
import Matrix4 from '../Matrix4';
import Object3D from './Object3D';
import Vector3 from '../Vector3';
import Vector4 from '../Vector4';
import { Object3DWallsTypes } from '../../Interfaces';
import { AudioNames, config } from '../../Config';
import MyAudio from '../../MyAudio';

export default class Wall extends Object3D {
  pos: Vector3;
  scale: Vector3;
  rotation: Vector3;

  width: number;
  deep: number;
  texture: string;
  textureName: string;

  secretWall: boolean;
  targetPos?: Vector3;
  futurePos?: Vector3;
  moveSpeed: number;

  posArray: Float32Array;
  startTextureCoords: Array<number>;
  tempTextureCoords: Array<number>;
  textureArray: Float32Array;

  wallTypes: Object3DWallsTypes;

  moved: boolean;

  count: number;
  lookAtOb?: Camera;
  constructor(x: number, y: number, z: number, width: number) {
    super();
    this.pos = new Vector3(x, y, z);
    this.scale = new Vector3(1, 1, 1);
    this.rotation = new Vector3(0, 0, 0);
    this.width = width;
    this.deep = width;

    this.secretWall = false;
    this.futurePos = new Vector3(x, y, z);
    this.moveSpeed = 0.5 * config.wallSize;

    this.texture = 'WALL';
    this.textureName = '';

    this.moved = false;

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
    this.posArray = new Float32Array([
      //front
      0, 0, 0,
      0, this.width, 0,
      this.width, 0, 0,
      0, this.width, 0,
      this.width, this.width, 0,
      this.width, 0, 0,

      // // back
      // 0, 0, this.width,
      // 0, this.width, this.width,
      // this.width, 0, this.width,
      // 0, this.width, this.width,
      // this.width, this.width, this.width,
      // this.width, 0, this.width,


      //top
      0, 0, 0,
      this.width, 0, 0,
      0, 0, this.width,
      this.width, 0, 0,
      this.width, 0, this.width,
      0, 0, this.width,

      //bottom
      0, this.width, 0,
      0, this.width, this.width,
      this.width, this.width, 0,
      0, this.width, this.width,
      this.width, this.width, this.width,
      this.width, this.width, 0,

      //left
      0, 0, this.width,
      0, this.width, this.width,
      0, 0, 0,
      0, this.width, this.width,
      0, this.width, 0,
      0, 0, 0,

      //right
      this.width, 0, 0,
      this.width, this.width, 0,
      this.width, 0, this.width,
      this.width, this.width, 0,
      this.width, this.width, this.width,
      this.width, 0, this.width,

      //back
      0, 0, this.width,
      this.width, 0, this.width,
      0, this.width, this.width,
      0, this.width, this.width,
      this.width, 0, this.width,
      this.width, this.width, this.width,
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
      1, 0,
      0, 0,
      1, 1,
      1, 1,
      0, 0,
      0, 1,
    ])

    this.startTextureCoords = Array.from(tab);
    this.tempTextureCoords = Array.from(tab);
  }

  setAsSecretWall(targetPos: Vector3) {
    this.secretWall = true;
    this.targetPos = targetPos.clone();
  }

  move() {
    if (this.moved == false) {
      MyAudio.instance.playAudio(AudioNames.DOORS_SECRET);
    }
    this.futurePos = this.targetPos.clone();
    this.moved = true;
  }

  update(deltaTime: number) {
    if (this.secretWall) {
      if (this.pos.x != this.futurePos.x) {
        this.pos.x += Math.sign(this.futurePos.x - this.pos.x) * Math.min(deltaTime * this.moveSpeed, Math.abs(this.futurePos.x - this.pos.x));

      }
      if (this.pos.z != this.futurePos.z) {
        this.pos.z += Math.sign(this.futurePos.z - this.pos.z) * Math.min(deltaTime * this.moveSpeed, Math.abs(this.futurePos.z - this.pos.z));
      }
    }
  }
}
import { animNames, AudioNames, weaponStatus, weaponTypes } from "../../Config";
import { IWeaponData } from "../../Interfaces";
import MyAudio from "../../MyAudio";
import AnimationManager from "../AnimationManager";
import Matrix4 from "../Matrix4";
import Vector3 from "../Vector3";
import Vector4 from "../Vector4";
import Object3D from "./Object3D";

export default class Weapon extends Object3D {
    pos: Vector3;
    rotation: Vector3;

    width: number;
    deep: number
    texture: string;
    textureName: string;
    count: number;

    weaponID: number;
    fireRate: number;
    auto: boolean;
    range: number;
    shootID: number;
    damage: number;
    needAmmo: boolean;
    makeNoise: boolean;
    audioName: string;

    forceStop: boolean;
    forceChange: boolean;
    status: string;

    posArray: Float32Array;
    startTextureCoords: Array<number>;
    tempTextureCoords: Array<number>;
    textureArray: Float32Array;

    animManger: AnimationManager;
    highestWeaponID: number;

    constructor(type: IWeaponData, animManager: AnimationManager) {
        super();
        this.pos = new Vector3(0, -0.21, -2);
        this.scale = new Vector3(0.1, 0.1, 0.1);
        this.rotation = new Vector3(0, 0, 0);
        this.width = 12;
        this.deep = 0;

        this.count = 6;

        this.texture = 'WEAPON';
        this.textureName = '';

        this.weaponID = type.id;
        this.fireRate = type.attackSpeed;
        this.auto = type.auto;
        this.range = type.range;
        this.shootID = type.shootID;
        this.damage = type.damage;
        this.needAmmo = type.needAmmo;
        this.makeNoise = type.makeNoise;
        this.audioName = type.audioName;

        this.forceStop = false;
        this.forceChange = false;
        this.highestWeaponID = type.id;
        this.status = weaponStatus.DEFAULT;

        this.animManger = animManager;

        this.posArray = new Float32Array();
        this.startTextureCoords = [];
        this.tempTextureCoords = [];
        this.textureArray = new Float32Array();

        this.calsPos();
        this.calcTexture();
    }

    calsPos() {
        this.posArray = new Float32Array([
            0, 0, 0,
            0, this.width, 0,
            this.width, 0, 0,
            0, this.width, 0,
            this.width, this.width, 0,
            this.width, 0, 0,
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

    changeWeapon(type: IWeaponData) {
        if (this.weaponID != type.id) {
            this.weaponID = type.id;
            this.fireRate = type.attackSpeed;
            this.auto = type.auto;
            this.range = type.range;
            this.shootID = type.shootID;
            this.damage = type.damage;
            this.needAmmo = type.needAmmo;
            this.makeNoise = type.makeNoise;
            this.audioName = type.audioName;

            this.highestWeaponID = Math.max(type.id, this.highestWeaponID);

            this.animManger.remove(this);
            this.animManger.add(this, animNames.WEAPON_DEFAULT);
        }
    }

    onForceChange() {
        if (this.forceChange == true) {
            this.forceChange = false;
            this.changeWeapon(weaponTypes.KNIFE);
        }
    }

    changeStatus(status: string) {
        this.status = status;
    }

    update() {

    }
}
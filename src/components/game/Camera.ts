import { animNames, AudioNames, config, weaponTypes } from "../Config";
import Box2D from "./boxHelper/Box2D";
import BoxLine, { LINE_TYPE } from "./boxHelper/BoxLine";
import BoxPoint from "./boxHelper/BoxPoint";
import { animationData, animationsData, BoxLines, IweaponTypes } from "../Interfaces";
import Matrix4 from "./Matrix4";
import Enemy from "./objects/Enemy";
import Object3D from "./objects/Object3D";
import Scene from "./Scene";
import Vector3 from "./Vector3";
import Weapon from "./objects/Weapon";
import DataDisplay from "../HUDElements/helpers/DataDisplay";
import MyAudio from "../MyAudio";

export default class Camera {
    pos: Vector3
    rotation: Vector3
    movementSpeed: number
    rotateSpeed: number
    FOV: number
    zNear: number;
    zFar: number;
    collisionRadius: number;
    projectionMatrix: Matrix4;

    weapon: Weapon;
    ammo: number;
    hp: number;
    points: number;
    lives: number;
    level: number;

    dead: boolean;
    killer: Enemy;

    smoothRotateSpeed: number;

    hitted: boolean;

    goldKey: boolean;
    silverKey: boolean;
    startTime: number;
    killCount: number;
    treasuresFound: number;
    hiddenWalls: number;

    constructor() {
        this.pos = new Vector3(0, 0, 0);
        this.rotation = new Vector3(0, 0, 0);
        this.movementSpeed = 4 * config.wallSize;
        this.rotateSpeed = Math.PI / 1.6
        this.collisionRadius = 0.3 * config.wallSize;
        this.FOV = Math.PI / 3;
        this.zNear = 1;
        this.zFar = 20 * config.wallSize;
        this.projectionMatrix;

        this.hp = 100;
        this.ammo = 8;
        this.points = 0;
        this.lives = 3;
        this.level = 1;
        this.dead = false;
        this.killer = undefined;

        this.killCount = 0;
        this.treasuresFound = 0;
        this.hiddenWalls = 0;

        this.startTime = Date.now();

        this.hitted = false;
        this.smoothRotateSpeed = 2;

        this.goldKey = false;
        this.silverKey = false;
    }

    updateProjectionMatrix(aspect: number) {
        this.projectionMatrix = new Matrix4().perspective(this.FOV, aspect, this.zNear, this.zFar);
    }

    move(dir: Vector3, deltaTime: number, blockObj: Object3D[]) {
        let matRot = new Matrix4().yRotate(this.rotation.y);

        let deltaPos = dir.clone().normalize().multiply(-this.movementSpeed * deltaTime).transformMat4(matRot);

        let futurePosX = this.pos.clone().translate(deltaPos.x, deltaPos.y, 0);
        // this.pos.set(futurePosX)
        this.pos.set(this.checkColliding(futurePosX, blockObj))

        let futurePosZ = this.pos.clone().translate(0, 0, deltaPos.z);
        // this.pos.set(futurePosZ)
        this.pos.set(this.checkColliding(futurePosZ, blockObj))
    }

    rotate(dir: Vector3, deltaTime: number) {
        this.rotation.rotateY((this.rotateSpeed * deltaTime * dir.y))
    }

    angleTo(target: Vector3) {
        let lookDir = Vector3.fromAngle(this.rotation.y);
        let toTargetDir = target.clone().sub(this.pos).normalize();

        let angleToLook = Math.atan2(lookDir.z, lookDir.x);
        let angleToTarget = Math.atan2(toTargetDir.z, toTargetDir.x);

        let diff = angleToLook - angleToTarget;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;

        return diff
    }

    isLookingAt(enemy: Object3D): Boolean {
        let lookDir = Vector3.fromAngle(this.rotation.y);
        let targetXDir = Vector3.cross(lookDir, Vector3.up()).normalize();

        let enemyLeftPoint = enemy.pos.clone().sub(targetXDir.clone().multiply(enemy.width / 2));
        let enemyRightPoint = enemy.pos.clone().add(targetXDir.clone().multiply(enemy.width / 2));

        let angleLeft = this.angleTo(enemyLeftPoint);
        let angleRight = this.angleTo(enemyRightPoint);

        let look = 0 < angleLeft && angleLeft < Math.PI / 2 && -Math.PI / 2 < angleRight && angleRight < 0

        return look;
    }

    checkColliding(futPos: Vector3, obj: Object3D[]): Vector3 {
        let closestPointDistance: number = Infinity;
        let closestOb: Object3D = null;
        let closestLine: string = null;

        let futurePos = futPos.clone();

        let futurePoint = new BoxPoint(futurePos.x, futurePos.z)

        obj.forEach(ob => {
            if (Vector3.distance(futurePos, ob.pos) <= config.wallSize * 1.5) {
                let box = new Box2D(ob);


                Object.keys(box.lines).forEach(line => {
                    let len = box.lines[line].distanceToPoint(futurePoint)
                    if (len < closestPointDistance) {
                        closestPointDistance = len; closestOb = ob; closestLine = line;
                    }
                })
                if (box.checkPointInBox(futurePoint)) { closestPointDistance = 0 }

            }
        })

        if (closestPointDistance <= this.collisionRadius) {
            let box = new Box2D(closestOb);
            let closestPoint: BoxPoint;

            if (box.isCornerCollision(futurePoint)) {

                let closestCorner: string;
                let closestDst: number = Infinity;

                Object.keys(box.corners).forEach(point => {
                    let dst = box.corners[point].distancePointToPoint(futurePoint);
                    if (dst < closestDst) { closestDst = dst; closestCorner = point }
                })

                let vec = this.pos.sub(new Vector3(box.corners[closestCorner].x, 0, box.corners[closestCorner].z))

                if (closestCorner == "TOP_LEFT") {
                    return Math.abs(vec.x) > Math.abs(vec.z) ?
                        new Vector3(box.corners[closestCorner].x - this.collisionRadius, 0, futurePoint.z) :
                        new Vector3(futurePoint.x, 0, box.corners[closestCorner].z - this.collisionRadius)
                }

                else if (closestCorner == "TOP_RIGHT") {
                    return Math.abs(vec.x) > Math.abs(vec.z) ?
                        new Vector3(box.corners[closestCorner].x + this.collisionRadius, 0, futurePoint.z) :
                        new Vector3(futurePoint.x, 0, box.corners[closestCorner].z - this.collisionRadius)
                }

                else if (closestCorner == "BOTTOM_LEFT") {
                    return Math.abs(vec.x) > Math.abs(vec.z) ?
                        new Vector3(box.corners[closestCorner].x - this.collisionRadius, 0, futurePoint.z) :
                        new Vector3(futurePoint.x, 0, box.corners[closestCorner].z + this.collisionRadius)
                }

                else if (closestCorner == "BOTTOM_RIGHT") {
                    return Math.abs(vec.x) > Math.abs(vec.z) ?
                        new Vector3(box.corners[closestCorner].x + this.collisionRadius, 0, futurePoint.z) :
                        new Vector3(futurePoint.x, 0, box.corners[closestCorner].z + this.collisionRadius)
                }


            } else {
                closestPoint = new BoxLine(futurePoint, new BoxPoint(closestOb.pos.x, closestOb.pos.z)).calcCrossPoint(box.lines[closestLine])
                if (closestPoint && closestLine) {
                    if (closestLine == "TOP") { return new Vector3(futurePos.x, 0, closestPoint.z - this.collisionRadius) }
                    else if (closestLine == "BOTTOM") { return new Vector3(futurePos.x, 0, closestPoint.z + this.collisionRadius) }
                    else if (closestLine == "LEFT") { return new Vector3(closestPoint.x - this.collisionRadius, 0, futurePos.z) }
                    else if (closestLine == "RIGHT") { return new Vector3(closestPoint.x + this.collisionRadius, 0, futurePos.z) }
                }
            }
        }

        return futurePos;
    }

    inRenderingRange(object: Object3D) {
        return Vector3.distance(this.pos, object.pos) <= this.zFar * 1.1;
    }

    preparePlayer() {
        this.ammo = 9;
        this.hp = 100;
    }

    onShoot() {
        if (this.weapon.needAmmo) {
            this.ammo--;
            if (this.ammo <= 0) {
                this.ammo = 0;
                this.weapon.forceChange = true;
            }
        }
    }

    addHP(hp: number) {
        this.hp = Math.min(100, this.hp + hp);
    }

    addAMMO(ammo: number) {
        if (this.ammo == 0) {
            this.checkToRetriveWeapon();
        }
        MyAudio.instance.playAudio(AudioNames.PICKUP_AMMO)
        this.ammo = Math.min(99, this.ammo + ammo);
    }

    addPOINTS(points: number, enemy = false) {
        this.points = this.points + points;
        if (enemy == false) {
            this.treasuresFound++;
        }
    }

    addLIFE() {
        this.lives += 1;
    }

    addKEY(type: 'SILVER' | 'GOLD') {
        if (type == 'SILVER') { this.silverKey = true }
        else { this.goldKey = true }
    }

    extraLife() {
        this.hp = 100;
        this.addAMMO(25);
        this.addLIFE();
        this.treasuresFound++;
    }

    checkToRetriveWeapon() {
        if (this.weapon.weaponID < this.weapon.highestWeaponID) {
            for (let type in weaponTypes) {
                if (this.weapon.highestWeaponID == weaponTypes[type as keyof IweaponTypes].id) {
                    this.weapon.changeWeapon(weaponTypes[type as keyof IweaponTypes]);
                }
            }
        }
    }

    hit(enemy: Enemy) {
        let dist = Vector3.distance(this.pos, enemy.pos);
        let correctlyHit;

        if (dist < config.enemyMissRange) { correctlyHit = this.isEnemyCorrectlyHit(100) }
        else { correctlyHit = this.isEnemyCorrectlyHit(25) }

        if (correctlyHit) {

            let dmg = Math.round((0.80 + Math.random() * 0.4) * enemy.DMG);

            this.hp -= dmg;
            this.hitted = true;

            if (this.hp <= 0) {
                this.hp = 0;
                this.dead = true;
                this.killer = enemy;
                MyAudio.instance.playAudio(AudioNames.PLAYER_DEAD);
            } else {
                MyAudio.instance.playAudio(AudioNames.PLAYER_HIT);
            }
        }
    }

    isEnemyCorrectlyHit(chance: number) {
        let rand = Math.random() * 100;
        if (rand < chance) { return true }
        else { return false }
    }

    smoothLookAt(obj: Object3D, deltaTime: number) {
        let dirToTarget = obj.pos.clone().sub(this.pos).normalize();
        let angleToTarget = Math.atan2(dirToTarget.z, dirToTarget.x);

        let dir = Vector3.fromAngle(this.rotation.y);
        let angleToLook = Math.atan2(dir.z, dir.x);

        let diff = angleToTarget - angleToLook;

        let move = Math.sign(-diff) * Math.min(Math.abs(diff), this.smoothRotateSpeed * deltaTime);
        this.rotation.rotateY(move)

        let isLook = Math.abs(diff) <= 0.001;
        return isLook

        // return move <= 0.01 ? true : false
    }

    respawn(newGame: boolean = false) {
        this.refresh();

        this.lives = Math.max(0, this.lives - 1);

        newGame ? this.lives = 3 : null;
    }

    refresh() {
        this.hitted = false;
        this.hp = 100;
        this.ammo = 9;
        this.points = 0;
        this.killCount = 0;
        this.treasuresFound = 0;
        this.hiddenWalls = 0;
        if (this.weapon) {
            this.weapon.changeWeapon(weaponTypes.PISTOL);
        }
        this.dead = false;
        this.startTime = Date.now();
    }
}


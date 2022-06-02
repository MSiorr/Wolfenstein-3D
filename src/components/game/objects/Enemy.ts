import Camera from '../Camera';
import Matrix4 from '../Matrix4';
import Object3D from './Object3D';
import Vector3 from '../Vector3';
import Vector4 from '../Vector4';
import AnimationManager from '../AnimationManager';
import { animNames, AudioNames, config, enemyActionTypes, enemyAngleStatus } from '../../Config';
import Animation from '../Animation';
import { animationData, enemyData, IEnemyAngleStatus } from '../../Interfaces';
import DataDisplay from '../../HUDElements/helpers/DataDisplay';
import PathFinder from '../PathFinder/PathFinder';
import PathField from '../PathFinder/PathField';
import Raycaster from '../Raycaster';
import LevelCreator from '../LevelCreator';
import MyAudio from '../../MyAudio';

export default class Enemy extends Object3D {
  pos: Vector3;
  rotation: Vector3;

  width: number;
  deep: number
  texture: string;
  textureName: string;
  count: number;

  spotted: boolean;
  moveSpeed: number;
  startPos: Vector3;
  patrolTarget: Vector3;
  targetPos: Vector3;

  action: string;
  angleStatus: number;

  lastShoot: number
  DMG: number;

  posArray: Float32Array;
  startTextureCoords: Array<number>;
  tempTextureCoords: Array<number>;
  textureArray: Float32Array;

  lookAtOb?: Camera;
  hp: number;
  dead: boolean;
  animManager: AnimationManager;
  pathFinder: PathFinder;
  lastTarget: Vector3;
  path: Vector3[];
  pathIndex: number;
  lvlCreator: LevelCreator;
  attackRange: number;
  dropAmmo: boolean;
  name: string;
  constructor(lvlCreator: LevelCreator, pathFinder: PathFinder, animManager: AnimationManager, x: number, y: number, z: number, width: number, action: string, enemyData: enemyData) {
    super();
    this.pos = new Vector3(x, y, z);
    this.rotation = new Vector3(0, 0, 0);
    this.scale = new Vector3(1, 1, 1);

    this.width = width;
    this.deep = 0;
    this.texture = enemyData.texture;
    this.name = enemyData.name;
    // this.texture = 'ENEMY';
    this.textureName = '';
    this.count = 6 * 2;

    this.spotted = false;

    this.moveSpeed = enemyData.moveSpeed * config.wallSize;
    this.startPos = new Vector3(x, y, z);
    this.patrolTarget = undefined;
    this.targetPos = new Vector3(x, y, z);
    this.lastTarget = new Vector3(x, y, z);
    this.path = [];
    this.pathIndex = 0;

    this.action = action;
    this.angleStatus = enemyAngleStatus.FRONT;

    this.lastShoot = 0;
    this.DMG = enemyData.dmg;
    this.attackRange = enemyData.attackRange * config.wallSize;
    this.dropAmmo = enemyData.dropAmmo;

    this.lvlCreator = lvlCreator;
    this.pathFinder = pathFinder;
    this.animManager = animManager;
    this.hp = enemyData.hp;
    this.dead = false;

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

      0,
      0,
      this.width / 2,
      this.width,
      0,
      this.width / 2,
      0,
      this.width,
      this.width / 2,
      0,
      this.width,
      this.width / 2,
      this.width,
      0,
      this.width / 2,
      this.width,
      this.width,
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
    let tab = [];
    tab.push(...[
      0, 0,
      0, 1,
      1, 0,
      0, 1,
      1, 1,
      1, 0
    ]);
    tab.push(...[
      0, 0,
      1, 0,
      0, 1,
      1, 1,
      1, 0,
      1, 1,
    ]);

    this.startTextureCoords = Array.from(tab);
    this.tempTextureCoords = Array.from(tab);
  }

  update(deltaTime: number, camera: Camera) {
    if (this.dead == false) {
      if (this.action == enemyActionTypes.RUN || this.action == enemyActionTypes.STAND) {
        this.moveManager(deltaTime, camera);
        let ang = this.checkViewAngleToTarget(camera);
        this.toAngleStatus(ang);
      }
      if (this.spotted == true) {
        this.checkShoot(camera) == false && this.checkDistancedShoot(camera) ? this.shootManage(camera) : null;
      }

      this.checkSpot(camera);
    }
  }

  checkDistancedShoot(camera: Camera) {
    if ((Vector3.distance(camera.pos, this.pos) <= this.attackRange && this.name == "DOG") || this.name == "GUARD") {
      return true
    } else {
      return false
    }
  }

  setDMG(numb: number) {
    this.DMG = numb;
  }

  moveManager(deltaTime: number, camera: Camera) {
    if (this.spotted) {
      this.goToPlayer(camera)
      if (this.pos.isEval(this.targetPos) == false) {
        if (Vector3.distance(this.pos, camera.pos) > this.attackRange || this.checkShoot(camera) == true) {
          this.changeAction(enemyActionTypes.RUN)
          this.enemyLookAt(this.targetPos);
          this.move(deltaTime);
        } else {
          this.changeAction(enemyActionTypes.STAND)
          this.enemyLookAt(camera.pos)
        }
      } else {
        this.nextPathTarget();
      }
    } else if (this.patrolTarget) {
      // this.patrolArea();
      if (this.pos.isEval(this.targetPos) == false) {
        this.enemyLookAt(this.targetPos);
        this.move(deltaTime, true);
      } else {
        this.nextPathTarget(true);
      }
    }
  }

  changeAction(actionName: string, camera?: Camera) {
    this.action = actionName;
    switch (actionName) {
      case enemyActionTypes.HIT: {
        this.animManager.change(this, animNames.ENEMY_HIT, (aD: animationData) => { if (aD.animation.index == 0 && aD.animation.fullPlayed) { this.changeAction(enemyActionTypes.RUN); return false } return true })
        break;
      }
      case enemyActionTypes.DEAD: {
        this.animManager.change(this, animNames.ENEMY_DEAD, (animD: animationData) => { if (animD.animation.index == 0 && animD.animation.fullPlayed) { this.animManager.remove(this); return false } return true });
        break;
      }
      case enemyActionTypes.RUN: {
        this.animManager.change(this, animNames.ENEMY_RUN); break;
      }
      case enemyActionTypes.STAND: {
        this.animManager.change(this, animNames.ENEMY_STAND); break;
      }
      case enemyActionTypes.SHOOT: {
        this.animManager.change(this, animNames.ENEMY_SHOOT, (animD: animationData) => {
          // let lastAction = this.action;
          if (animD.animation.index == 0 && animD.animation.fullPlayed) {
            this.changeAction(enemyActionTypes.STAND); return false
          } else if (animD.animation.index == 2) {
            this.shootPlayer(camera)
          }
          return true;
        }); break;
      }
    }
  }

  shootManage(camera: Camera) {
    // if (Date.now() > this.lastShoot + config.enemyReloadTime && rayData.collide == false && this.action != enemyActionTypes.HIT) {
    if (Date.now() > this.lastShoot + config.enemyReloadTime && this.action != enemyActionTypes.HIT) {
      this.changeAction(enemyActionTypes.SHOOT, camera);
    }
  }

  checkShoot(camera: Camera) {
    let blocks = [...this.lvlCreator.objects.walls, ...this.lvlCreator.objects.doors];
    let raycaster = new Raycaster(camera);
    let rayData = raycaster.create(this.pos, 1, blocks, camera.pos)
    return rayData.collide;
  }

  shootPlayer(camera: Camera) {
    this.lastShoot = Date.now() + config.enemyReloadTime;
    MyAudio.instance.playAudio(this.name == 'GUARD' ? AudioNames.GUARD_ATTACK : AudioNames.DOG_ATTACK);
    camera.hit(this);
  }

  nextPathTarget(patrol = false) {
    if (this.pathIndex + 1 < this.path.length) {
      this.pathIndex++;

      this.targetPos = this.path[this.pathIndex];

      this.checkToDoorsOpen();

      this.enemyLookAt(this.targetPos)

    } else if (patrol == true) {
      this.patrolArea();
    }
  }

  checkToDoorsOpen() {
    this.lvlCreator.objects.doors.forEach(e => {
      if (e.startPos.isEval(this.targetPos)) {
        e.forceOpen();
      }
    })
  }

  move(deltaTime: number, slow = false) {
    this.pos.x += Math.sign(this.targetPos.x - this.pos.x) * Math.min(deltaTime * (this.moveSpeed / (slow ? 2 : 1)), Math.abs(this.targetPos.x - this.pos.x));
    this.pos.z += Math.sign(this.targetPos.z - this.pos.z) * Math.min(deltaTime * (this.moveSpeed / (slow ? 2 : 1)), Math.abs(this.targetPos.z - this.pos.z));
  }

  checkSpot(camera: Camera) {
    if (this.spotted == false) {
      let angleString = this.angleStatusToString();
      let spotRange = config.enemyFrontSpotRange;
      if (angleString) {
        if (angleString.indexOf("FRONT") == -1) {
          spotRange = config.enemyBackSpotRange;
        }

        let blocks = [...this.lvlCreator.objects.walls, ...this.lvlCreator.objects.doors];
        let raycaster = new Raycaster(camera);
        let rayData = raycaster.create(this.pos, spotRange, blocks, camera.pos);


        if (rayData.collide == false && rayData.dist < spotRange) {
          this.detectPlayer(camera);
        }
      }
    }
  }

  angleStatusToString(): String | undefined {
    let angle = undefined
    Object.keys(enemyAngleStatus).forEach(e => {
      if (enemyAngleStatus[e as keyof IEnemyAngleStatus] == this.angleStatus) {
        angle = e;
      }
    })
    return angle
  }

  checkViewAngleToTarget(obj: Object3D | Camera) {
    let lookDir = Vector3.fromAngle(this.rotation.y);
    let targetPos = obj.pos.clone().sub(this.pos)

    let angleToLook = Math.atan2(lookDir.z, lookDir.x);
    let angleToTarget = Math.atan2(targetPos.z, targetPos.x);

    let diff = angleToLook - angleToTarget;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    return diff + Math.PI;
  }

  toAngleStatus(angle: number) {
    angle = angle * 180 / Math.PI
    if (angle >= 157.5 && angle <= 202.5) this.changeAngle(enemyAngleStatus.FRONT);
    else if (angle >= 202.5 && angle <= 247.5) this.changeAngle(enemyAngleStatus.FRONT_LEFT);
    else if (angle >= 247.5 && angle <= 292.5) this.changeAngle(enemyAngleStatus.LEFT);
    else if (angle >= 292.5 && angle <= 337.5) this.changeAngle(enemyAngleStatus.BACK_LEFT);
    else if (angle <= 22.5 || angle >= 337.5) this.changeAngle(enemyAngleStatus.BACK);
    else if (angle >= 22.5 && angle <= 67.5) this.changeAngle(enemyAngleStatus.BACK_RIGHT);
    else if (angle >= 67.5 && angle <= 112.5) this.changeAngle(enemyAngleStatus.RIGHT);
    else if (angle >= 112.5 && angle <= 157.5) this.changeAngle(enemyAngleStatus.FRONT_RIGHT);
  }

  changeAngle(angleStatus: number) {
    if (this.angleStatus != angleStatus) {
      this.angleStatus = angleStatus;
      this.animManager.changeEnemyAnimationTextures(this);
    }
  }

  detectPlayer(camera: Camera) {
    if (this.spotted == false) {
      MyAudio.instance.playAudio(this.name == 'GUARD' ? AudioNames.GUARD_DETECT : AudioNames.DOG_DETECT);

      this.spotted = true;
      this.goToPlayer(camera);
      this.changeAction(enemyActionTypes.RUN)
      this.lastShoot = Date.now() + (config.enemyReloadTime / 2);
    }
    // this.animManager.change(this, animNames.ENEMY_RUN);
  }

  goToPlayer(camera: Camera) {

    if (this.pathFinder.toAdvancePathPosition(camera.pos).isEval(this.lastTarget) == false) {
      this.lastTarget = this.pathFinder.toAdvancePathPosition(camera.pos);

      let tab = this.pathFinder.findPath(this.pos, camera.pos);
      let path = this.pathToPos(tab);
      if (path.length > 0) {

        this.path = Array.from(path);
        this.targetPos = this.path[0];
        this.pathIndex = 0;
        this.checkToDoorsOpen();
        this.enemyLookAt(this.targetPos)
      }
    }
  }

  enemyLookAt(vec: Vector3) {
    this.rotation.y = -this.angleToTarget(vec) + Math.PI;
  }

  pathToPos(tab: PathField[]) {
    let pos: Vector3[] = [];
    tab.map(e => pos.push(new Vector3(e.x * config.wallSize, 0, e.z * config.wallSize)));
    return pos;
  }

  setPatrol(pos: Vector3) {
    this.patrolTarget = pos;
    // this.patrolArea();
  }

  patrolArea() {
    if (this.patrolTarget) {
      let path;
      if (this.path.length == 0 || this.path[this.path.length - 1].isEval(this.startPos)) {
        let tab = this.pathFinder.findPath(this.pos, this.patrolTarget);
        path = this.pathToPos(tab);
      } else {
        let tab = this.pathFinder.findPath(this.pos, this.startPos);
        path = this.pathToPos(tab);
      }
      if (path.length > 0) {
        this.path = Array.from(path);
        this.targetPos = this.path[0];
        this.pathIndex = 0;
        this.checkToDoorsOpen();
        this.enemyLookAt(this.targetPos);
      }
    }
  }

  hit(dmg: number) {
    dmg = (9.5 + Math.random()) / 10 * dmg
    let angleString = this.angleStatusToString();
    if (angleString.indexOf("BACK") != -1) { dmg *= 2 }
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.changeAction(enemyActionTypes.DEAD)
      if (this.name == "DOG") MyAudio.instance.playAudio(AudioNames.DOG_DEATH)
      else this.randomEnemyDeadSound();
    } else {
      this.changeAction(enemyActionTypes.HIT)
    }

    return this.dead;
  }

  randomEnemyDeadSound() {
    let rand = Math.ceil(Math.random() * 8);
    if (rand == 1) MyAudio.instance.playAudio(AudioNames.GUARD_DEAD_1);
    else if (rand == 2) MyAudio.instance.playAudio(AudioNames.GUARD_DEAD_2);
    else if (rand == 3) MyAudio.instance.playAudio(AudioNames.GUARD_DEAD_3);
    else if (rand == 4) MyAudio.instance.playAudio(AudioNames.GUARD_DEAD_4);
    else if (rand == 5) MyAudio.instance.playAudio(AudioNames.GUARD_DEAD_5);
    else if (rand == 6) MyAudio.instance.playAudio(AudioNames.GUARD_DEAD_6);
    else if (rand == 7) MyAudio.instance.playAudio(AudioNames.GUARD_DEAD_7);
    else MyAudio.instance.playAudio(AudioNames.GUARD_DEAD_8);
  }
}

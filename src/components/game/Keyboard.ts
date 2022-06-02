import { animNames, AudioNames, config, enemyAngleStatus, HUDStatus, Scene2DStatus, weaponStatus, weaponTypes } from "../Config";
import AnimationManager from "./AnimationManager";
import Camera from "./Camera";
import { mapObjects } from "../Interfaces";
import Door from "./objects/Door";
import Enemy from "./objects/Enemy";
import Raycaster from "./Raycaster";
import Vector3 from "./Vector3";
import LevelCreator from "./LevelCreator";
import Furniture from "./objects/Furniture";
import Wall from "./objects/Wall";
import Scene2D from "../HUDElements/Scene2D";
import End from "./objects/End";
import MyAudio from "../MyAudio";

enum KEYS {
    "left" = "KeyA",
    "up" = "KeyW",
    "right" = "KeyD",
    "down" = "KeyS",
    "shoot" = "Space",
    "action" = "KeyE",
    "Digit1" = "Digit1",
    "Digit2" = "Digit2",
    "Digit3" = "Digit3",
    "Digit4" = "Digit4",
    "ctrl" = "ControlLeft",
    "ArrowUp" = "ArrowUp",
    "ArrowDown" = "ArrowDown",
    "Escape" = "Escape"
}

export interface buttonManage {
    status: boolean,
    offset: number,
    nextAction: number
}

export interface bools {
    up: buttonManage
    down: buttonManage
    left: buttonManage
    right: buttonManage
    shoot: buttonManage
    action: buttonManage
    ctrl: buttonManage,
    ArrowUp: buttonManage
    ArrowDown: buttonManage,
    Escape: buttonManage
}


export default class Keyboard {
    camera: Camera
    animManager: AnimationManager
    levelCreator: LevelCreator
    objects: mapObjects
    bools: bools
    scene2D: Scene2D
    constructor(camera: Camera, animManager: AnimationManager, levelCreator: LevelCreator, scene2D: Scene2D) {
        this.camera = camera;
        this.animManager = animManager;
        this.levelCreator = levelCreator;
        this.objects = null;
        this.scene2D = scene2D;
        this.bools = {
            up: { status: false, offset: 1, nextAction: 0 },
            down: { status: false, offset: 1, nextAction: 0 },
            left: { status: false, offset: 1, nextAction: 0 },
            right: { status: false, offset: 1, nextAction: 0 },
            shoot: { status: false, offset: 300, nextAction: 0 },
            action: { status: false, offset: 300, nextAction: 0 },
            ctrl: { status: false, offset: 1, nextAction: 0 },
            ArrowUp: { status: false, offset: 300, nextAction: 0 },
            ArrowDown: { status: false, offset: 300, nextAction: 0 },
            Escape: { status: false, offset: 300, nextAction: 0 }
        }

        this.addEvents();
    }

    addEvents() {
        document.body.onkeydown = (e: KeyboardEvent) => {
            switch (e.code) {
                case KEYS.up:
                    this.bools.up.status = true
                    break;
                case KEYS.down:
                    this.bools.down.status = true
                    break;
                case KEYS.left:
                    this.bools.left.status = true
                    break;
                case KEYS.right:
                    this.bools.right.status = true
                    break;
                case KEYS.shoot:
                    if (this.bools.shoot.status == false && this.scene2D.sceneStatus == Scene2DStatus.GAME && this.scene2D.HUD.status == HUDStatus.GAMEPLAY) {
                        this.startShoot();
                    }
                    this.bools.shoot.status = true
                    break;
                case KEYS.action:
                    this.bools.action.status = true
                    break;
                case KEYS.Digit1:
                    this.camera.weapon.changeWeapon(weaponTypes.KNIFE);
                    break;
                case KEYS.Digit2:
                    this.camera.weapon.changeWeapon(weaponTypes.PISTOL);
                    break;
                case KEYS.Digit3:
                    this.camera.weapon.changeWeapon(weaponTypes.MACHINEGUN);
                    break;
                case KEYS.Digit4:
                    this.camera.weapon.changeWeapon(weaponTypes.CHAINGUN);
                    break;
                case KEYS.ctrl:
                    this.bools.ctrl.status = true;
                    break;
                case KEYS.ArrowUp:
                    this.bools.ArrowUp.status = true;
                    break;
                case KEYS.ArrowDown:
                    this.bools.ArrowDown.status = true;
                    break;
                case KEYS.Escape:
                    this.bools.Escape.status = true;
                    break;
            }
        }
        document.body.onkeyup = (e: KeyboardEvent) => {
            switch (e.code) {
                case KEYS.up:
                    this.bools.up.status = false
                    break;
                case KEYS.down:
                    this.bools.down.status = false
                    break;
                case KEYS.left:
                    this.bools.left.status = false
                    break;
                case KEYS.right:
                    this.bools.right.status = false
                    break;
                case KEYS.shoot:
                    if (this.bools.shoot.status == true) {
                        this.endShoot();
                    }
                    this.bools.shoot.status = false
                    break;
                case KEYS.action:
                    this.bools.action.status = false
                    break;
                case KEYS.ctrl:
                    this.bools.ctrl.status = false;
                    break;
                case KEYS.ArrowUp:
                    this.bools.ArrowUp.status = false;
                    break;
                case KEYS.ArrowDown:
                    this.bools.ArrowDown.status = false;
                    break;
                case KEYS.Escape:
                    this.bools.Escape.status = false;
                    break;
            }
        }
    }

    deleteNoCollideFurnitures(objList: Furniture[]) {
        let tab: Furniture[] = [];
        objList.forEach(e => config.noCollideFurnitures.includes(e.textureName) == false ? tab.push(e) : null);
        return tab;
    }

    update(deltaTime: number, objects: mapObjects) {
        if (this.scene2D.smoothAction) { return; }
        this.objects = objects;
        let collisionObjects = [...objects.walls, ...objects.doors, ...this.deleteNoCollideFurnitures(objects.furnitures)];
        let actionObjects = [...objects.doors, ...objects.end, ...objects.walls.filter(e => e.secretWall == true)];


        if (this.bools.up.status) { this.camera.move(Vector3.forward(), deltaTime, collisionObjects.filter(e => this.camera.inRenderingRange(e))) }
        if (this.bools.down.status) { this.camera.move(Vector3.backward(), deltaTime, collisionObjects.filter(e => this.camera.inRenderingRange(e))) }
        if (this.bools.left.status) { this.camera.rotate(Vector3.up(), deltaTime) }
        if (this.bools.right.status) { this.camera.rotate(Vector3.down(), deltaTime) }

        if (this.scene2D.sceneStatus == Scene2DStatus.MENU || (this.scene2D.sceneStatus == Scene2DStatus.GAME && this.scene2D.HUD.status == HUDStatus.ENDSCREEN)) {
            if (this.bools.shoot.status && Date.now() > this.bools.shoot.nextAction) {
                this.scene2D.enter();
                this.bools.shoot.nextAction = Date.now() + this.bools.shoot.offset;
            }
        } else {
            if (this.scene2D.HUD.status == HUDStatus.GAMEPLAY) {
                if (this.bools.shoot.status && this.camera.weapon.status == weaponStatus.DEFAULT && this.camera.weapon.auto == true) {
                    this.startShoot();
                }
            }
        }

        if (this.bools.action.status && Date.now() > this.bools.action.nextAction && this.scene2D.sceneStatus == Scene2DStatus.GAME && this.scene2D.HUD.status == HUDStatus.GAMEPLAY) {
            actionObjects.forEach(e => {
                if (e instanceof Door) {
                    let dist = Vector3.distance(this.camera.pos, e.startPos);
                    if (dist <= config.actionDistance) {
                        e.move(this.camera);
                    }
                } else if (e instanceof Wall) {
                    let dist = Vector3.distance(this.camera.pos, e.pos);
                    if (dist < config.actionDistance * 1.2) {
                        e.move();
                    }
                } else if (e instanceof End) {
                    if (e.playerIn) {
                        e.change();
                        setTimeout(() => {
                            this.scene2D.enableSmoothAction(() => { this.scene2D.HUD.status = HUDStatus.ENDSCREEN; MyAudio.instance.stopAll(); MyAudio.instance.playAudio(AudioNames.THEME_SPLASH) });
                        }, 500)
                    }
                }

            })
            this.bools.action.nextAction = Date.now() + this.bools.action.offset;
        }

        if (this.bools.ArrowUp.status && Date.now() > this.bools.ArrowUp.nextAction) {
            this.scene2D.moveUp();
            this.bools.ArrowUp.nextAction = Date.now() + this.bools.ArrowUp.offset;
        }

        if (this.bools.ArrowDown.status && Date.now() > this.bools.ArrowDown.nextAction) {
            this.scene2D.moveDown();

            this.bools.ArrowDown.nextAction = Date.now() + this.bools.ArrowDown.offset;
        }

        if (this.bools.Escape.status && Date.now() > this.bools.Escape.nextAction && this.scene2D.sceneStatus == Scene2DStatus.GAME && this.scene2D.HUD.status == HUDStatus.GAMEPLAY) {
            this.scene2D.enableOptions();

            this.bools.Escape.nextAction = Date.now() + this.bools.Escape.offset;
        }
    }

    startShoot() {
        this.animManager.change(this.camera.weapon, animNames.WEAPON_SHOOT, this.weaponShoot.bind(this));
    }

    weaponShoot() {
        MyAudio.instance.playAudio(this.camera.weapon.audioName);

        let collisionObjects = [...this.objects.walls, ...this.objects.doors];
        let enemies = [...this.objects.enemies.filter(e => e.dead == false)]

        let raycaster = new Raycaster(this.camera);
        let rayData = raycaster.create(this.camera.pos, this.camera.weapon.range, collisionObjects);

        enemies.filter(e => e.dead == false).forEach(e => {
            if (e instanceof Enemy) {
                let dist = Vector3.distance(this.camera.pos, e.pos)
                if (dist <= rayData.dist) {
                    let look = this.camera.isLookingAt(e);

                    if (look) {
                        let isDead = e.hit(this.camera.weapon.damage);
                        if (isDead) {
                            if (e.dropAmmo) {
                                this.levelCreator.addUsedClip(e.pos.clone())
                            }
                            this.camera.addPOINTS(100, true);
                            this.camera.killCount++;
                        } else {
                            e.detectPlayer(this.camera);
                        }
                    }
                }
                if (this.camera.weapon.makeNoise) {
                    if (e.spotted == false && dist < config.enemyDetectShootRange && e.dead == false) {
                        e.detectPlayer(this.camera);
                    }
                }
            }
        })
        this.bools.shoot.nextAction = Date.now() + this.bools.shoot.offset;

        this.camera.onShoot();
    }

    endShoot() {
        this.animManager.change(this.camera.weapon, animNames.WEAPON_DEFAULT);
    }
}
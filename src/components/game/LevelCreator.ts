import { animNames, config, enemyActionTypes, EnemyData, pickablesNames, pickablesTypes, weaponTypes } from "../Config";
import AnimationManager from "./AnimationManager";
import Camera from "./Camera";
import { IEnemyData, IPickablesTypes, MapCreatorFieldData, MapData, mapObjects } from "../Interfaces";
import Door from "./objects/Door";
import Enemy from "./objects/Enemy";
import Wall from "./objects/Wall";
import Scene from "./Scene";
import Vector3 from "./Vector3";
import Weapon from "./objects/Weapon";
import Pickable from "./objects/Pickable";
import PathFinder from "./PathFinder/PathFinder";
import Furniture from "./objects/Furniture";
import End from "./objects/End";
import Vector2 from "./Vector2";
import Object3D from "./objects/Object3D";


export default class LevelCreator {
    scene: Scene;
    objects: mapObjects;
    camera: Camera;
    animManager: AnimationManager;
    pathFinder: PathFinder;
    mapSizeX: number;
    mapSizeZ: number;
    difficulty: number;
    enemiesCount: number;
    treasuresCount: number;
    secretsCount: number;
    constructor(scene: Scene, camera: Camera, animationManager: AnimationManager) {
        this.scene = scene;
        this.camera = camera;
        this.animManager = animationManager;

        this.difficulty = 1;

        this.enemiesCount = 0;
        this.treasuresCount = 0;
        this.secretsCount = 0;

        this.mapSizeX = 0;
        this.mapSizeZ = 0;

        this.objects = {
            walls: [],
            enemies: [],
            doors: [],
            pickables: [],
            furnitures: [],
            end: []
        }

        this.pathFinder = new PathFinder(this);
    }

    reset() {
        this.scene.clear();
        this.animManager.animations = [];
        this.enemiesCount = 0;
        this.treasuresCount = 0;
        this.secretsCount = 0;
        this.objects = {
            walls: [],
            enemies: [],
            doors: [],
            pickables: [],
            furnitures: [],
            end: []
        }
    }

    setDifficulty(num: number) {
        this.difficulty = num;
    }

    createLvl(data: string, newGame: boolean = false) {
        this.reset();
        let mapData: MapData = JSON.parse(data);

        this.mapSizeX = mapData.sizeX;
        this.mapSizeZ = mapData.sizeY;


        mapData.objectData.forEach((e, i) => {
            switch (e.type) {
                case "player": {
                    this.camera.pos = new Vector3(e.x * config.wallSize, this.camera.pos.y, e.z * config.wallSize);
                    this.camera.respawn(newGame);
                    if (e.look) {
                        switch (e.look) {
                            case 'UP': this.camera.rotation.y = 0; break;
                            case 'LEFT': this.camera.rotation.y = Math.PI / 2; break;
                            case 'DOWN': this.camera.rotation.y = Math.PI; break;
                            case 'RIGHT': this.camera.rotation.y = 3 * Math.PI / 2; break;
                        }
                    }
                    break;
                }
                case "wall": {
                    let wall = new Wall(e.x * config.wallSize, 0, e.z * config.wallSize, config.wallSize);
                    wall.textureSet(wall.texture, e.texture)

                    if (e.goTo) {
                        wall.setAsSecretWall(new Vector3(e.goTo.x * config.wallSize, 0, e.goTo.z * config.wallSize));
                        this.secretsCount++;
                    }

                    this.scene.add(wall);
                    this.objects.walls.push(wall);
                    break;
                }
                case "enemy": {
                    if (e.difficulty == undefined || e.difficulty <= this.difficulty) {
                        let name = e.name ? e.name : "GUARD";
                        let enemy = new Enemy(this, this.pathFinder, this.animManager, e.x * config.wallSize, 0, e.z * config.wallSize, config.wallSize, enemyActionTypes.RUN, EnemyData[name as keyof IEnemyData]);
                        enemy.textureSet(enemy.texture, e.texture);
                        enemy.setDMG(config.enemyDMG / (5 - this.difficulty));

                        if (e.alive == false) {
                            enemy.dead = true;
                            enemy.textureSet(enemy.texture, 'enemy_dead_5');
                        } else {
                            this.enemiesCount++;
                            if (e.goTo) {
                                this.animManager.add(enemy, animNames.ENEMY_RUN)
                                enemy.setPatrol(new Vector3(e.goTo.x * config.wallSize, 0, e.goTo.z * config.wallSize))
                            } else {
                                this.animManager.add(enemy, animNames.ENEMY_STAND)
                            }

                            if (e.look) {
                                switch (e.look) {
                                    case 'UP': enemy.rotation.y = 0; break;
                                    case 'LEFT': enemy.rotation.y = Math.PI / 2; break;
                                    case 'DOWN': enemy.rotation.y = Math.PI; break;
                                    case 'RIGHT': enemy.rotation.y = 3 * Math.PI / 2; break;
                                }
                            }
                        }

                        this.scene.add(enemy);
                        this.objects.enemies.push(enemy);
                    }

                    break;
                }
                case "door": {
                    this.checkDoorConditions(e);
                    break;
                }
                case "pickable": {
                    let pickable = new Pickable(pickablesNames[e.name as keyof IPickablesTypes].action, e.x * config.wallSize, 0, e.z * config.wallSize, config.wallSize);
                    pickable.textureSet(pickable.texture, e.texture);
                    this.scene.add(pickable);
                    this.objects.pickables.push(pickable);

                    if (config.treasuresNames.includes(e.name)) { this.treasuresCount++ }

                    break;
                }
                case "furniture": {
                    let furnit = new Furniture(e.x * config.wallSize, 0, e.z * config.wallSize, config.wallSize);
                    furnit.textureSet(furnit.texture, e.texture);
                    this.scene.add(furnit);
                    this.objects.furnitures.push(furnit);
                    break;
                }
                case "end": {
                    let neighPos = [
                        new Vector3((e.x - 1) * config.wallSize, 0, e.z * config.wallSize),
                        new Vector3((e.x + 1) * config.wallSize, 0, e.z * config.wallSize),
                        new Vector3(e.x * config.wallSize, 0, (e.z - 1) * config.wallSize),
                        new Vector3(e.x * config.wallSize, 0, (e.z + 1) * config.wallSize)
                    ]
                    let neigh: Object3D[] = [];
                    let objL = [...this.objects.walls, ...this.objects.doors];
                    neighPos.forEach(e => {
                        let ob = objL.find(o => o.pos.isEval(e));
                        if (ob) neigh.push(ob);
                    })
                    let end = new End(e.x * config.wallSize, 0, e.z * config.wallSize, config.wallSize, neigh);
                    this.objects.end.push(end);
                    break;
                }
                default: {
                    console.log(`NEW OBJECT ${e.type}. MAYBE ADD?`);
                }
            }
        })

        for (let i = 0; i <= mapData.sizeX + 1; i++) {
            for (let j = 0; j <= mapData.sizeY + 1; j++) {
                if (i == 0 || i == mapData.sizeX + 1 || j == 0 || j == mapData.sizeY + 1) {
                    let wall = new Wall(i * config.wallSize, 0, j * config.wallSize, config.wallSize);
                    wall.textureSet(wall.texture, 'wall_wood')
                    this.scene.add(wall);
                    this.objects.walls.push(wall);
                }
            }
        }

        let weapon = new Weapon(weaponTypes.PISTOL, this.animManager);
        weapon.textureSet(weapon.texture, `weapon_default_${weapon.weaponID}`);
        this.animManager.add(weapon, animNames.WEAPON_DEFAULT);
        this.scene.add(weapon);
        this.camera.weapon = weapon;

        this.camera.preparePlayer();

        this.pathFinder.updateObjects([...this.objects.walls, ...this.objects.furnitures.filter(e => config.noCollideFurnitures.includes(e.textureName) == false)]);

        this.objects.enemies.forEach(e => {
            if (e.patrolTarget) {
                e.patrolArea();
            }
        })
    }

    checkDoorConditions(data: MapCreatorFieldData) {
        let rotated = this.objects.walls.find(e => e.pos.x == data.x * config.wallSize - config.wallSize && e.pos.z == data.z * config.wallSize) === undefined;
        let door = new Door(data.x * config.wallSize, 0, data.z * config.wallSize, config.wallSize, 0.08 * config.wallSize, rotated);
        door.textureSet(door.texture, data.texture)

        this.scene.add(door);
        this.objects.doors.push(door);

        if (rotated == false) {
            door.textureSet(door.texture, data.texture, door.wallTypes.FRONT);
            door.textureSet(door.texture, data.texture, door.wallTypes.BACK);
            door.textureSet(door.texture, data.texture == 'door_front_1' ? 'door_side_1' : 'door_side_2', door.wallTypes.LEFT, false);
            door.textureSet(door.texture, data.texture == 'door_front_1' ? 'door_side_1' : 'door_side_2', door.wallTypes.RIGHT, false);
            let leftWall = this.objects.walls.find(e => e.pos.x == door.pos.x - config.wallSize && e.pos.z == door.pos.z);
            let rightWall = this.objects.walls.find(e => e.pos.x == door.pos.x + config.wallSize && e.pos.z == door.pos.z);

            if (leftWall && leftWall instanceof Wall) { leftWall.textureSet(door.texture, 'wall_door', leftWall.wallTypes.RIGHT) }
            if (rightWall && rightWall instanceof Wall) { rightWall.textureSet(door.texture, 'wall_door', rightWall.wallTypes.LEFT) }


        } else {
            door.rotation.rotateY(-Math.PI / 2);
            door.textureSet(door.texture, data.texture, door.wallTypes.FRONT, true)
            door.textureSet(door.texture, data.texture, door.wallTypes.BACK, true)
            door.textureSet(door.texture, data.texture == 'door_front_1' ? 'door_side_1' : 'door_side_2', door.wallTypes.LEFT);
            door.textureSet(door.texture, data.texture == 'door_front_1' ? 'door_side_1' : 'door_side_2', door.wallTypes.RIGHT);
            let topWall = this.objects.walls.find(e => e.pos.x == door.pos.x && e.pos.z == door.pos.z - config.wallSize);
            let bottomWall = this.objects.walls.find(e => e.pos.x == door.pos.x && e.pos.z == door.pos.z + config.wallSize);

            if (topWall && topWall instanceof Wall) { topWall.textureSet(door.texture, 'wall_door', topWall.wallTypes.FRONT) }
            if (bottomWall && bottomWall instanceof Wall) { bottomWall.textureSet(door.texture, 'wall_door', bottomWall.wallTypes.BACK) }
        }

    }

    addUsedClip(deathPoint: Vector3) {
        let minX = deathPoint.x - (deathPoint.x % config.wallSize) + config.wallSize * 0.05;
        let maxX = deathPoint.x - (deathPoint.x % config.wallSize) + config.wallSize * 0.95;

        let minZ = deathPoint.z - (deathPoint.z % config.wallSize) + config.wallSize * 0.05;
        let maxZ = deathPoint.z - (deathPoint.z % config.wallSize) + config.wallSize * 0.95;

        let randX = (Math.random() * config.usedAmmoSpawnRange * 2) - config.usedAmmoSpawnRange;
        let randZ = (Math.random() * config.usedAmmoSpawnRange * 2) - config.usedAmmoSpawnRange;

        let spawnX = Math.max(minX, Math.min(maxX, deathPoint.x + randX));
        let spawnZ = Math.max(minZ, Math.min(maxZ, deathPoint.z + randZ));

        let spawnPoint = new Vector3(spawnX, 0, spawnZ);

        let pickable = new Pickable(pickablesNames.USED_CLIP.action, spawnPoint.x, spawnPoint.y, spawnPoint.z, config.wallSize);
        pickable.textureSet(pickable.texture, "pickable_clip");
        this.scene.add(pickable);
        this.objects.pickables.push(pickable);
    }
}
import { animationData, animationFunction, animationsData, graphicsData, LibraryData } from '../Interfaces';
import Object3D from './objects/Object3D';
import Animation from './Animation';
import Weapon from './objects/Weapon';
import { animNames, weaponStatus } from '../Config';
import Enemy from './objects/Enemy';

export default class AnimationManager {
    graphicsData: graphicsData
    animationsData: animationsData
    animations: animationData[]
    constructor(data: LibraryData) {
        this.graphicsData = data.graphicsData;
        this.animationsData = data.animationsData;

        this.animations = [];
    }

    update() {
        this.animations.forEach(e => {
            if (Date.now() > e.lastPlay + e.animation.offset) {
                let funRet = e.function != null ? e.function(e) : true
                if (funRet) {
                    e.lastPlay = Date.now();
                    e.animation.play(e.object);
                }
            }
        })
    }

    add(object: Object3D, animName: string, func: animationFunction | null = null) {
        if (this.animations.find(e => e.object == object) == undefined) {
            let anim;
            if (object instanceof Weapon) {
                let tab = this.animationsData[animName].textures.map(e => e.replace("_id", `_${object.weaponID}`));

                let offset = 1000 / object.fireRate / (object.auto ? 2 : 4);
                anim = new Animation(tab, offset);
            } else if (object instanceof Enemy) {
                let tab = this.animationsData[animName].textures.map(e => e.replace("_angle", `_${object.angleStatus}`));

                anim = new Animation(tab, this.animationsData[animName].offset);
            } else {
                anim = new Animation(this.animationsData[animName].textures, this.animationsData[animName].offset);
            }
            this.animations.push({
                object: object,
                animName: animName,
                animation: anim,
                lastPlay: 0,
                function: func
            })
        }
    }

    remove(object: Object3D) {
        this.animations = this.animations.filter(e => e.object != object)
    }

    change(object: Object3D, animName: string, func: animationFunction | null = null) {
        let ob = this.animations.find(e => e.object == object);
        if (ob == undefined || ob.animName != animName) {
            if (object instanceof Weapon && ob != undefined) {
                this.weaponAnimation(ob, object, animName, func);
            } else {
                this.changeAnimation(object, animName, func);
            }
        }
    }

    private changeAnimation(object: Object3D, animName: string, func: animationFunction | null = null) {
        this.remove(object);
        this.add(object, animName, func);
    }

    changeEnemyAnimationTextures(object: Enemy) {
        let ob = this.animations.find(e => e.object == object);
        if (ob != undefined && ob.animName == animNames.ENEMY_RUN || ob.animName == animNames.ENEMY_STAND) {
            let tab = this.animationsData[ob.animName].textures.map(e => e.replace("_angle", `_${object.angleStatus}`));
            ob.animation.textures = tab;
        }
    }

    changeAnimFunction(object: Object3D, func: animationFunction) {
        let ob = this.animations.find(e => e.object == object);
        if (ob != undefined) {
            ob.function = func;
        }
    }

    weaponAnimation(ob: animationData, weapon: Weapon, animName: string, func: animationFunction | null = null) {
        if (animName == animNames.WEAPON_SHOOT) {
            if (weapon.auto || ob.animName == animNames.WEAPON_DEFAULT) {
                let newFunc: animationFunction = (aD: animationData) => {
                    if (aD.animName == animNames.WEAPON_PICK) {
                        if (aD.animation.index == 0 && aD.animation.fullPlayed == true) {
                            weapon.changeStatus(weaponStatus.SHOOT);
                            this.changeAnimation(weapon, animNames.WEAPON_SHOOT, newFunc)
                            return false;
                        }
                    } else if (aD.animName == animNames.WEAPON_SHOOT) {
                        if (aD.animation.index == 0 && aD.animation.fullPlayed == true) {
                            if (weapon.auto == false || weapon.forceStop || weapon.forceChange) {
                                weapon.forceStop = false;
                                weapon.changeStatus(weaponStatus.HIDE);
                                this.changeAnimation(weapon, animNames.WEAPON_HIDE, newFunc)
                                return false;
                            }
                        }
                        if (aD.animation.index == weapon.shootID || weapon.shootID == null) {
                            if (weapon.auto == true || aD.animation.fullPlayed == false) {
                                func(ob);
                            }
                        }
                    } else if (aD.animName == animNames.WEAPON_HIDE && aD.animation.fullPlayed == true) {
                        if (aD.animation.index == 0 && aD.animation.fullPlayed == true) {
                            weapon.changeStatus(weaponStatus.DEFAULT);
                            this.changeAnimation(weapon, animNames.WEAPON_DEFAULT)
                            weapon.onForceChange();
                            return false;
                        }
                    }
                    return true;
                }
                weapon.changeStatus(weaponStatus.PICK);
                this.changeAnimation(weapon, animNames.WEAPON_PICK, newFunc)
            }
        } else {
            weapon.forceStop = true;
        }
    }
}
import Camera from "./game/Camera"
import { IweaponTypes, IPickablesTypes, IEnemyAngleStatus, ImenuOptionOptions, IMenuDifficultyOptions, IEnemyData } from "./Interfaces"
import MyAudio from "./MyAudio";

let wallSize = 100;

export interface IConf {
    attributes: string[],
    uniforms: string[],
    wallSize: number,
    actionDistance: number,
    doorsAutoCloseTime: number,
    mapCreatorItems: string[],
    textureSize: number,
    usedAmmoSpawnRange: number,
    enemyDetectShootRange: number,
    enemyFrontSpotRange: number,
    enemyBackSpotRange: number,
    enemyShootRange: number,
    enemyReloadTime: number,
    enemyDMG: number,
    enemyMissRange: number,
    sceneBorderWidth: number,
    faceBaseChangeSpeed: number,
    faceRandomRangeSpeed: number,
    noCollideFurnitures: string[],
    redPixelsAmountInX: number,
    treasuresNames: string[]
}

export let config: IConf = {
    attributes: ["a_position", "a_color", "a_texcoord"],
    uniforms: ["u_color", "u_matrix", "u_texture"],
    wallSize: wallSize,
    actionDistance: 1 * wallSize,
    doorsAutoCloseTime: 5000,
    mapCreatorItems: ['player', 'wall', 'enemy', 'door', 'pickable'],
    textureSize: 64,
    usedAmmoSpawnRange: 50,
    enemyDetectShootRange: 7 * wallSize,
    enemyFrontSpotRange: 15 * wallSize,
    enemyBackSpotRange: 2 * wallSize,
    enemyShootRange: 2 * wallSize,
    enemyReloadTime: 500,
    enemyDMG: 25,
    enemyMissRange: 5 * wallSize,
    sceneBorderWidth: 4,
    faceBaseChangeSpeed: 750,
    faceRandomRangeSpeed: 400,
    noCollideFurnitures: ["furniture_hangingLamp", "furniture_hangingCandlestick", "furniture_skullsPile", "furniture_lyingSkeleton", "furniture_pot"],
    redPixelsAmountInX: 200,
    treasuresNames: ["CROSS", "CHALICE", "CHEST", "CROWN", "EXTRA_LIFE"]
}

export let Scene2DColors = {
    HIT: 'rgb(255,0,0)',
    PICK: 'rgb(213, 213, 31)'
}

export let AudioNames = {
    PICKUP_AMMO: "P_AMMO",
    PICKUP_MACHINEGUN: "P_MGUN",
    PICKUP_CHAINGUN: "P_CGUN",
    PICKUP_FOOD: "P_FOOD",
    PICKUP_MEDKIT: "P_MEDKIT",
    PICKUP_EXTRALIFE: "P_LIFE",
    TREASURE_CHEST: "T_CHEST",
    TREASURE_CROSS: "T_CROSS",
    TREASURE_CROWN: "T_CROWN",
    TREASURE_CUP: "T_CUP",
    DOORS_OPEN: "WSND0003",
    DOORS_CLOSE: "WSND0002",
    DOORS_SECRET: "WSND0015",
    ELEVATOR_SWITCH: "WSND0030",
    END_100_BONUS: "S_100",
    END_BONUS_POINTS: "S_BONUSC",
    WEAPON_KNIFE: "DSWKNIF",
    WEAPON_PISTOL: "WSND0005",
    WEAPON_MACHINEGUN: "WSND0004",
    WEAPON_CHAINGUN: "WSND0006",
    GUARD_ATTACK: "WSND0021",
    PLAYER_HIT: "WSND0014",
    PLAYER_DEAD: "DSDEATH",
    DOG_DETECT: "WSND0001",
    DOG_ATTACK: "WSND0029",
    DOG_DEATH: "WSND0016",
    GUARD_DEAD_1: "WSND0012",
    GUARD_DEAD_2: "WSND0013",
    GUARD_DEAD_3: "WSND0034",
    GUARD_DEAD_4: "WSND0035",
    GUARD_DEAD_5: "WSND0039",
    GUARD_DEAD_6: "WSND0040",
    GUARD_DEAD_7: "WSND0041",
    GUARD_DEAD_8: "WSND0042",
    GUARD_DETECT: "WSND0000",
    MENU_SELECT: "M_SELECT",
    MENU_MOVE: "M_MOVE",
    THEME_SPLASH: "THEME_SPLASH",
    THEME_MENU: "THEME_MENU",
    THEME_LEVEL: "THEME_LEVEL"
}

export let animNames = {
    ENEMY_SHOOT: "ENEMY_SHOOT",
    ENEMY_DEAD: "ENEMY_DEAD",
    ENEMY_RUN: "ENEMY_RUN",
    ENEMY_STAND: "ENEMY_STAND",
    ENEMY_HIT: "ENEMY_HIT",
    WEAPON_DEFAULT: "WEAPON_DEFAULT",
    WEAPON_PICK: "WEAPON_PICK",
    WEAPON_SHOOT: "WEAPON_SHOOT",
    WEAPON_HIDE: "WEAPON_HIDE"
}

export let enemyActionTypes = {
    STAND: "STAND",
    RUN: "RUN",
    HIT: "HIT",
    DEAD: "DEAD",
    SHOOT: "SHOOT"
}

export let enemyAngleStatus: IEnemyAngleStatus = {
    FRONT: 1,
    FRONT_LEFT: 2,
    LEFT: 3,
    BACK_LEFT: 4,
    BACK: 5,
    BACK_RIGHT: 6,
    RIGHT: 7,
    FRONT_RIGHT: 8,
}

export let weaponStatus = {
    DEFAULT: "DEFAULT",
    PICK: "PICK",
    SHOOT: "SHOOT",
    HIDE: "HIDE"
}

export let weaponTypes: IweaponTypes = {
    KNIFE: { id: 1, attackSpeed: 2.4, auto: false, range: 1 * config.wallSize, shootID: 0, damage: 50, needAmmo: false, makeNoise: false, audioName: AudioNames.WEAPON_KNIFE },
    PISTOL: { id: 2, attackSpeed: 2.4, auto: false, range: 10 * config.wallSize, shootID: 1, damage: 100, needAmmo: true, makeNoise: true, audioName: AudioNames.WEAPON_PISTOL },
    MACHINEGUN: { id: 3, attackSpeed: 6, auto: true, range: 14 * config.wallSize, shootID: 1, damage: 100, needAmmo: true, makeNoise: true, audioName: AudioNames.WEAPON_MACHINEGUN },
    CHAINGUN: { id: 4, attackSpeed: 6, auto: true, range: 20 * config.wallSize, shootID: null, damage: 100, needAmmo: true, makeNoise: true, audioName: AudioNames.WEAPON_CHAINGUN },
}

export let pickablesTypes: IPickablesTypes = {
    CLIP: { action: (camera: Camera) => { if (camera.ammo < 99) { camera.addAMMO(8); MyAudio.instance.playAudio(AudioNames.PICKUP_AMMO); return true } return false } },
    USED_CLIP: { action: (camera: Camera) => { if (camera.ammo < 99) { camera.addAMMO(4); MyAudio.instance.playAudio(AudioNames.PICKUP_AMMO); return true } return false } },
    DOG_FOOD: { action: (camera: Camera) => { if (camera.hp < 100) { camera.addHP(4); MyAudio.instance.playAudio(AudioNames.PICKUP_FOOD); return true } return false } },
    CHICKEN_MEAL: { action: (camera: Camera) => { if (camera.hp < 100) { camera.addHP(10); MyAudio.instance.playAudio(AudioNames.PICKUP_FOOD); return true } return false } },
    BLOOD: { action: (camera: Camera) => { if (camera.hp < 10) { camera.addHP(1); MyAudio.instance.playAudio(AudioNames.PICKUP_FOOD); return true } return false } },
    BLOODY_SKELETON: { action: (camera: Camera) => { if (camera.hp < 10) { camera.addHP(1); MyAudio.instance.playAudio(AudioNames.PICKUP_FOOD); return true } return false } },
    FIRST_AID_KIT: { action: (camera: Camera) => { if (camera.hp < 100) { camera.addHP(25); MyAudio.instance.playAudio(AudioNames.PICKUP_MEDKIT); return true } return false } },
    CROSS: { action: (camera: Camera) => { camera.addPOINTS(100); MyAudio.instance.playAudio(AudioNames.TREASURE_CROSS); return true } },
    CHALICE: { action: (camera: Camera) => { camera.addPOINTS(500); MyAudio.instance.playAudio(AudioNames.TREASURE_CUP); return true } },
    CHEST: { action: (camera: Camera) => { camera.addPOINTS(1000); MyAudio.instance.playAudio(AudioNames.TREASURE_CHEST); return true } },
    CROWN: { action: (camera: Camera) => { camera.addPOINTS(5000); MyAudio.instance.playAudio(AudioNames.TREASURE_CROWN); return true } },
    EXTRA_LIFE: { action: (camera: Camera) => { camera.extraLife(); MyAudio.instance.playAudio(AudioNames.PICKUP_EXTRALIFE); return true } },
    KEY_SILVER: { action: (camera: Camera) => { if (!camera.silverKey) { camera.addKEY('SILVER'); return true } return false } },
    KEY_GOLD: { action: (camera: Camera) => { if (!camera.goldKey) { camera.addKEY('GOLD'); return true } return false } },
    MACHINEGUN: { action: (camera: Camera) => { if (camera.weapon.weaponID <= weaponTypes.MACHINEGUN.id) { camera.weapon.changeWeapon(weaponTypes.MACHINEGUN); MyAudio.instance.playAudio(AudioNames.PICKUP_MACHINEGUN); } camera.addAMMO(6); return true } },
    CHAINGUN: { action: (camera: Camera) => { camera.weapon.changeWeapon(weaponTypes.CHAINGUN); MyAudio.instance.playAudio(AudioNames.PICKUP_CHAINGUN); camera.addAMMO(6); return true } },
}

export let pickablesNames = {
    "CLIP": pickablesTypes.CLIP,
    "USED_CLIP": pickablesTypes.USED_CLIP,
    "DOG_FOOD": pickablesTypes.DOG_FOOD,
    "BLOOD": pickablesTypes.BLOOD,
    "CROSS": pickablesTypes.CROSS,
    "CHALICE": pickablesTypes.CHALICE,
    "CHEST": pickablesTypes.CHEST,
    "CROWN": pickablesTypes.CROWN,
    "CHICKEN_MEAL": pickablesTypes.CHICKEN_MEAL,
    "EXTRA_LIFE": pickablesTypes.EXTRA_LIFE,
    "BLOODY_SKELETON": pickablesTypes.BLOODY_SKELETON,
    "KEY_SILVER": pickablesTypes.KEY_SILVER,
    "KEY_GOLD": pickablesTypes.KEY_GOLD,
    "FIRST_AID_KIT": pickablesTypes.FIRST_AID_KIT,
    "MACHINEGUN": pickablesTypes.MACHINEGUN,
    "CHAINGUN": pickablesTypes.CHAINGUN,
}

export let hudImgNames = {
    HUDBAR: "hudBar",
    WEAPON_KNIFE: "weapon_knife",
    WEAPON_PISTOL: "weapon_pistol",
    WEAPON_MACHINEGUN: "weapon_machingeun",
    WEAPON_CHAINGUN: "weapon_chaingun",
    KEY_GOLD: "key_gold",
    KEY_SILVER: "key_silver",
    LOADER: "loader",
    PAUSE: "pause",
    FACE: "face_dir_id",
    END_PLAYER: "end_player_id"
}

export let MenuImgNames = {
    BLUE_SCREEN_INFO: "blueScreenInfo",
    GAME_TITLE_SCREEN: "gameTitleScreen",
    CREDITS_SCREEN: "creditsScreen",
    EPISODE_PICTURE: "episode_picture_id",
    MENU_PISTOL_1: "menu_pistol_1",
    MENU_PISTOL_2: "menu_pistol_2",
    OPTIONS_DOWN_BANNER: "options_down_banner",
    DIFFICULTY_FACE: "difficulty_face_id",
    OPTION_ACTIVE: "option_active",
    OPTION_DISACTIVE: "option_disactive",
    TITLE_OPTIONS: "title_options",
    TITLE_LOADING: "title_loading",
    TITLE_HIGHSCORE: "title_highScore",
    HIGHSCORE_CODE: "highScore_code",
    HIGHSCORE_CODE2: "highScore_code2",
    HIGHSCORE_LEVEL: "highScore_level",
    HIGHSCORE_NAME: "highScore_name",
    HIGHSCORE_SCORE: "highScore_score"
}

export let MenuScreens = {
    BLUEINFO: 1,
    GAME_TITLE: 2,
    CREDITS: 3,
    OPTIONS: 4,
    CHOOSE_EPISODE: 5,
    CHOOSE_DIFFICULTY: 6
}

export let menuFontColors = {
    active: 'rgb(152,152,152)',
    inactive: 'rgb(121,10,0)',
    special: 'rgb(255,233,0)'
}

export let MenuOptionsOptions: ImenuOptionOptions = {
    NEW_GAME: { id: 1, active: true },
    SOUND: { id: 2, active: false },
    CONTROL: { id: 3, active: false },
    LOAD_GAME: { id: 4, active: false },
    SAVE_GAME: { id: 5, active: false },
    CHANGE_VIEW: { id: 6, active: false },
    END_GAME: { id: 7, active: false },
    BACK_TO_GAME: { id: 8, active: false, special: true },
    QUIT: { id: 9, active: true }
}

export let MenuDifficultyOptions: IMenuDifficultyOptions = {
    "Can I play, Daddy?": { id: 1, active: true },
    "Don't hurt me.": { id: 2, active: true },
    "Bring 'em on!": { id: 3, active: true },
    "I am Death incarnate!": { id: 4, active: true }
}

export let Scene2DStatus = {
    MENU: "MENU",
    GAME: "GAME"
}

export let HUDStatus = {
    LOADING: "LOADING",
    GAMEPLAY: "GAMEPLAY",
    ENDSCREEN: "ENDSCREEN"
}

export let EnemyData: IEnemyData = {
    GUARD: { texture: "ENEMY", name: "GUARD", dmg: 20, hp: 100, moveSpeed: 3, dropAmmo: true, attackRange: 2 },
    DOG: { texture: "DOG", name: "DOG", dmg: 10, hp: 1, moveSpeed: 5, dropAmmo: false, attackRange: 0.5 }
}
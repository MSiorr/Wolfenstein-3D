import BoxLine from "./game/boxHelper/BoxLine";
import BoxPoint from "./game/boxHelper/BoxPoint";
import Camera from "./game/Camera";
import Door from "./game/objects/Door";
import End from "./game/objects/End";
import Enemy from "./game/objects/Enemy";
import Furniture from "./game/objects/Furniture";
import Object3D from "./game/objects/Object3D";
import Pickable from "./game/objects/Pickable";
import Wall from "./game/objects/Wall";
import Element2D from "./HUDElements/Element2D";
import Field from "./mapCreator/Field";

export interface Shaders {
    vertShader: string
    fragShader: string
}

export interface AttribLocation {
    [id: string]: number
}
export interface UniformLocation {
    [id: string]: WebGLUniformLocation
}

export interface Locations {
    attributes: AttribLocation,
    uniforms: UniformLocation
}

export interface Graphics {
    [id: string]: HTMLImageElement
}

export interface Levels {
    level1: MapData
}

export interface graphicsDataPos {
    [id: string]: { x: number, y: number }
}

export interface graphicsData {
    WALL: { sizeX: number, sizeY: number, pos: graphicsDataPos },
    ENEMY: { sizeX: number, sizeY: number, pos: graphicsDataPos },
    DOG: { sizeX: number, sizeY: number, pos: graphicsDataPos },
    WEAPON: { sizeX: number, sizeY: number, pos: graphicsDataPos },
    OBJECT: { sizeX: number, sizeY: number, pos: graphicsDataPos },
    PLAYER: { sizeX: number, sizeY: number, pos: graphicsDataPos },
    MAPCREATOR: { sizeX: number, sizeY: number, pos: graphicsDataPos },
}

export interface graphics2DPos {
    x: number,
    y: number,
    w: number,
    h: number
}

export interface graphics2DDataPos {
    [id: string]: graphics2DPos
}

export interface graphics2DData {
    HUD: { sizeX: number, sizeY: number, pos: graphics2DDataPos },
    MENU: { sizeX: number, sizeY: number, pos: graphics2DDataPos },
    MENUFONT: { sizeX: number, sizeY: number, pos: graphics2DDataPos },
    ENDFONT: { sizeX: number, sizeY: number, pos: graphics2DDataPos },
}

export interface animationsData {
    [id: string]: { textures: string[], offset: number }
}

export interface LibraryData {
    graphicsData: graphicsData,
    graphics2DData: graphics2DData,
    animationsData: animationsData
}

export interface MapCreatorFieldData {
    x: number,
    z: number,
    type: string,
    name?: string,
    goTo?: { x: number, z: number },
    look?: string,
    alive?: boolean,
    difficulty?: number,
    texture: string
}

export interface MapData {
    sizeX: number,
    sizeY: number,
    objectData: MapCreatorFieldData[]
}

export interface mapObjects {
    walls: Wall[],
    enemies: Enemy[],
    doors: Door[],
    pickables: Pickable[],
    furnitures: Furniture[],
    end: End[]
}

export interface BoxCorners {
    [index: string]: BoxPoint
}

export interface BoxLines {
    [index: string]: BoxLine
}

export interface Object3DWallsTypes {
    [index: string]: number
}

export interface animation {
    textures: string[],
    index: number,
    offset: number,
    fullPlayed: boolean,
    play(obj: Object3D): void
}

export interface animationData {
    object: Object3D,
    animName: string,
    animation: animation,
    lastPlay: number,
    function: animationFunction | null
}

export interface animationFunction {
    (aD: animationData): boolean
}

export interface animation2D {
    textures: string[],
    index: number,
    offset: number,
    play(el: Element2D): void
}

export interface animation2DData {
    element: Element2D,
    animName: string,
    animation2D: animation2D,
    lastPlay: number,
    function: Function | null
}

export interface IWeaponData {
    id: number,
    attackSpeed: number,
    auto: boolean,
    range: number,
    shootID: number,
    damage: number,
    needAmmo: boolean,
    makeNoise: boolean,
    audioName: string
}

export interface IweaponTypes {
    KNIFE: IWeaponData;
    PISTOL: IWeaponData;
    MACHINEGUN: IWeaponData;
    CHAINGUN: IWeaponData;
}

export interface pickableAction {
    (camera: Camera): boolean
}

export interface pickableObj {
    action: pickableAction
}

export interface IPickablesTypes {
    CLIP: pickableObj,
    USED_CLIP: pickableObj,
    DOG_FOOD: pickableObj,
    BLOOD: pickableObj,
    CROSS: pickableObj,
    CHALICE: pickableObj,
    CHEST: pickableObj,
    CROWN: pickableObj,
    CHICKEN_MEAL: pickableObj,
    EXTRA_LIFE: pickableObj,
    BLOODY_SKELETON: pickableObj,
    KEY_SILVER: pickableObj,
    KEY_GOLD: pickableObj,
    FIRST_AID_KIT: pickableObj,
    MACHINEGUN: pickableObj,
    CHAINGUN: pickableObj,
}

export interface IEnemyAngleStatus {
    FRONT: number;
    FRONT_LEFT: number;
    LEFT: number;
    BACK_LEFT: number;
    BACK: number;
    BACK_RIGHT: number;
    RIGHT: number;
    FRONT_RIGHT: number;
}

export interface IPoint2D {
    x: number,
    y: number
}

export interface destinationDrawData {
    dx: number;
    dy: number;
    dWidth: number;
    dHeight: number;
}

export interface mapCreatorTextureData {
    type: string,
    name: string,
    imgUrl: string,
    imgX: number,
    imgY: number,
    x: number,
    y: number
}

export interface mapCreatorBtnsData {
    SPECIAL: mapCreatorTextureData[],
    CREATURES: mapCreatorTextureData[],
    WALLS: mapCreatorTextureData[],
    PICKABLES: mapCreatorTextureData[],
    FURNITURES: mapCreatorTextureData[],
}

export interface mapCreatorActiveElement {
    type: string,
    texture: string,
    imgUrl: string,
    imgSizeX: number,
    imgSizeY: number,
    x: number,
    y: number,
    name?: string,
    look?: string,
    from?: Field,
    alive: boolean,
    difficulty: number
}

export interface optionsInfo {
    id: number,
    active: boolean,
    special?: boolean
}

export interface ImenuOptionOptions {
    NEW_GAME: optionsInfo,
    SOUND: optionsInfo,
    CONTROL: optionsInfo,
    LOAD_GAME: optionsInfo,
    SAVE_GAME: optionsInfo,
    CHANGE_VIEW: optionsInfo,
    END_GAME: optionsInfo,
    BACK_TO_GAME: optionsInfo,
    QUIT: optionsInfo
}

export interface IMenuDifficultyOptions {
    [index: string]: optionsInfo
}

export interface EndNeighbours {
    FRONT: Wall,
    LEFT: Wall,
    RIGHT: Wall
}

export interface enemyData {
    texture: string,
    dmg: number,
    hp: number,
    moveSpeed: number,
    dropAmmo: boolean,
    attackRange: number,
    name: string
}

export interface IEnemyData {
    GUARD: enemyData,
    DOG: enemyData
}
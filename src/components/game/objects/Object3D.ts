import Vector3 from "../Vector3";
import Vector2 from "../Vector2";
import Library from "../../Library";
import Camera from "../Camera";

export default abstract class Object3D {
    pos: Vector3;
    scale: Vector3;
    rotation: Vector3;

    texture: string;
    textureName: string;

    width: number
    deep: number

    posArray: Float32Array;
    startTextureCoords: Array<number>;
    tempTextureCoords: Array<number>;
    textureArray: Float32Array;

    count: number;
    constructor() {
    }

    textureSet(type: string, name: string, wall?: number, shadow = false) {
        let texData = this.getTextureData(type);

        if (texData != null) {
            if (wall == undefined) {
                this.textureName = name;

                let newPos = this.CalculateNewTexture(this.startTextureCoords, texData.sizeX, texData.sizeY, texData.pos[name].x, texData.pos[name].y, true)

                this.tempTextureCoords = Array.from(newPos);
            } else {
                let tab = this.startTextureCoords.filter((e, i) => i >= wall * 12 && i < (wall + 1) * 12);
                let newPos = this.CalculateNewTexture(tab, texData.sizeX, texData.sizeY, texData.pos[name].x + (wall == 3 || wall == 4 ? 1 : 0), texData.pos[name].y, false, shadow)
                let newPosTab = [...this.tempTextureCoords.filter((e, i) => i < wall * 12), ...newPos, ...this.tempTextureCoords.filter((e, i) => i >= (wall + 1) * 12)]


                this.tempTextureCoords = Array.from(newPosTab);
            }
        }

        this.applyTexture();

    }

    private CalculateNewTexture(array: number[], width: number, height: number, x: number, y: number, checkShadow: boolean = false, forceShadow: boolean = false): number[] {
        let tab = [];
        for (let i = 0; i < array.length; i += 2) {
            let v2 = new Vector2(array[i], array[i + 1]);
            v2.multiplyX(1 / width);
            v2.multiplyZ(1 / height);

            let tX = forceShadow == true ? 1 / width * (x + 1) : checkShadow == false ? 1 / width * x : i >= 3 * 12 && i < 5 * 12 ? 1 / width * (x + 1) : 1 / width * x;

            let tY = 1 / height * y;

            v2.add(new Vector2(tX, tY));
            tab.push(...[this.RoundTo(1 / width, v2.x), this.RoundTo(1 / height, v2.z)]);
        }

        return tab;
    }

    private RoundTo(by: number, value: number) {
        return value - (value % by)
    }

    private getTextureData(type: string) {
        if (Library.instance.data.graphicsData) {
            if (type == "WALL") { return Library.instance.data.graphicsData.WALL }
            else if (type == "ENEMY") { return Library.instance.data.graphicsData.ENEMY }
            else if (type == "DOG") { return Library.instance.data.graphicsData.DOG }
            else if (type == "ENEMY") { return Library.instance.data.graphicsData.ENEMY }
            else if (type == "WEAPON") { return Library.instance.data.graphicsData.WEAPON }
            else if (type == "OBJECT") { return Library.instance.data.graphicsData.OBJECT }
        }
        return null;
    }

    applyTexture() {
        this.textureArray = new Float32Array(this.tempTextureCoords);
    }

    lookAtCamera(target: Object3D | Camera) {
        this.rotation.y = target.rotation.y;
    }

    angleToTarget(pos: Vector3) {
        let targetPos = pos.clone().sub(this.pos)

        let angleToTarget = Math.atan2(targetPos.z, targetPos.x);

        let diff = angleToTarget - Math.PI / 2;

        return diff;
    }

    abstract update(...args: any): void
}
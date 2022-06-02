import { animation } from "../Interfaces";
import Enemy from "./objects/Enemy";
import Object3D from "./objects/Object3D";

export default class Animation implements animation {
    textures: string[];
    offset: number;
    index: number;
    fullPlayed: boolean;
    constructor(textures: string[], offset: number, index: number = 0) {
        this.textures = textures;
        this.offset = offset

        this.index = index;
        this.fullPlayed = false;
    }

    play(obj: Object3D) {
        let type = obj.texture;
        obj.textureSet(type, this.textures[this.index]);

        this.index++;
        if (this.index >= this.textures.length) { this.index = 0; this.fullPlayed = true };
    }
}
import { config, hudImgNames } from "../Config";
import Camera from "../game/Camera";
import { destinationDrawData } from "../Interfaces";

export default class HudBarFace {
    faceStatusIndex: number;
    direction: number;
    currentGraphic: string;
    nextChange: number;
    constructor() {
        this.faceStatusIndex = 1;
        this.direction = 2;
        this.currentGraphic = undefined;

        this.nextChange = Date.now() + config.faceRandomRangeSpeed * 4;

        this.randomGraphic();
    }

    randomGraphic() {
        if (this.faceStatusIndex == 8) { this.direction = 2 }
        else {
            let tab = [1, 2, 3].filter(e => e != this.direction);
            this.direction = tab[Math.floor(Math.random() * tab.length)];
        }
        this.currentGraphic = hudImgNames.FACE.replace("_dir", `_${this.direction}`).replace("_id", `_${this.faceStatusIndex}`);
        this.nextChange = Date.now() + (Math.random() * config.faceRandomRangeSpeed * 2) - config.faceRandomRangeSpeed + config.faceBaseChangeSpeed;
    }

    checkFaceStatus(camera: Camera) {
        if (camera.hp > 90) return 1;
        else if (camera.hp > 75) return 2;
        else if (camera.hp > 60) return 3;
        else if (camera.hp > 45) return 4;
        else if (camera.hp > 30) return 5;
        else if (camera.hp > 15) return 6;
        else if (camera.hp > 0) return 7;
        else return 8;
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera) {
        let stat = this.checkFaceStatus(camera);
        if (stat != this.faceStatusIndex) {
            this.faceStatusIndex = stat;
            this.randomGraphic();
        } else if (Date.now() > this.nextChange) {
            this.randomGraphic();
        }
    }
}
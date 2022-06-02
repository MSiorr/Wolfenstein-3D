import { hudImgNames } from "../Config";
import Camera from "../game/Camera";
import { destinationDrawData } from "../Interfaces";
import Library from "../Library";
import Element2D from "./Element2D";
import HudBarFace from "./HudBarFace";

export default class HudBar extends Element2D {
    img: HTMLImageElement;
    x: number;
    y: number;
    w: number;
    h: number;

    hudBarFace: HudBarFace;

    dyDigit: number
    sizeMultip: number;
    constructor() {
        super();
        this.img = Library.instance.graphics.HUD;
        this.x = Library.instance.data.graphics2DData.HUD.pos[hudImgNames.HUDBAR].x;
        this.y = Library.instance.data.graphics2DData.HUD.pos[hudImgNames.HUDBAR].y;
        this.w = Library.instance.data.graphics2DData.HUD.pos[hudImgNames.HUDBAR].w;
        this.h = Library.instance.data.graphics2DData.HUD.pos[hudImgNames.HUDBAR].h;

        this.hudBarFace = new HudBarFace();

        this.sizeMultip = 0;
        this.dyDigit = 0;
    }

    update(ctx: CanvasRenderingContext2D, dest: destinationDrawData, camera: Camera, updFace: boolean = true) {
        if (updFace) {
            this.hudBarFace.update(ctx, camera);
        }
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h, dest.dx, dest.dy, dest.dWidth, dest.dHeight);

        this.sizeMultip = dest.dWidth / this.w;
        this.dyDigit = dest.dy + ((16 / 40) * dest.dHeight);

        this.drawLevel(ctx, dest, camera);
        this.drawScore(ctx, dest, camera);
        this.drawLives(ctx, dest, camera);
        this.drawHealt(ctx, dest, camera);
        this.drawAmmo(ctx, dest, camera);
        this.drawKeys(ctx, dest, camera);
        this.drawWeapon(ctx, dest, camera);
        this.drawFace(ctx, dest);
    }

    drawLevel(ctx: CanvasRenderingContext2D, dest: destinationDrawData, camera: Camera) {
        let boxWidth = dest.dWidth / 9.6;
        let boxX = dest.dWidth / 35;
        let imgData = Library.instance.data.graphics2DData.HUD.pos[camera.level.toString()];

        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;
        let dx = boxX + (boxWidth / 2 - dWidth / 2);

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dx, this.dyDigit, dWidth, dHeight)
    }

    drawScore(ctx: CanvasRenderingContext2D, dest: destinationDrawData, camera: Camera) {
        let boxWidth = dest.dWidth / 5.84;
        let boxX = dest.dWidth / 7.62;
        let strScore = camera.points.toString().split('').reverse().join('');
        this.drawDigits(ctx, strScore, boxWidth, boxX);
    }

    drawLives(ctx: CanvasRenderingContext2D, dest: destinationDrawData, camera: Camera) {
        let boxWidth = dest.dWidth / 10.32;
        let boxX = dest.dWidth / 3.165;
        let imgData = Library.instance.data.graphics2DData.HUD.pos[camera.lives.toString()];

        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;
        let dx = boxX + (boxWidth / 2 - dWidth / 2);

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dx, this.dyDigit, dWidth, dHeight)
    }

    drawHealt(ctx: CanvasRenderingContext2D, dest: destinationDrawData, camera: Camera) {
        let boxWidth = dest.dWidth / 12.3;
        let boxX = dest.dWidth / 1.93;
        let strHp = camera.hp.toString().split('').reverse().join('');
        this.drawDigits(ctx, strHp, boxWidth, boxX);
    }

    drawAmmo(ctx: CanvasRenderingContext2D, dest: destinationDrawData, camera: Camera) {
        let boxWidth = dest.dWidth / 11.42;
        let boxX = dest.dWidth / 1.56;
        let strAmmo = camera.ammo.toString().split('').reverse().join('');
        this.drawDigits(ctx, strAmmo, boxWidth, boxX);
    }

    drawKeys(ctx: CanvasRenderingContext2D, dest: destinationDrawData, camera: Camera) {
        let boxX = dest.dWidth / 1.3333;
        let boxY = dest.dWidth / 80;

        let keyTab = [camera.goldKey, camera.silverKey];

        for (let i = 0; i < keyTab.length; i++) {
            if (keyTab[i]) {
                let key = i == 0 ? hudImgNames.KEY_GOLD : hudImgNames.KEY_SILVER;
                let imgData = Library.instance.data.graphics2DData.HUD.pos[key];

                let dWidth = imgData.w * this.sizeMultip;
                let dHeight = imgData.h * this.sizeMultip;
                let dx = boxX;
                let dy = dest.dy + boxY + (i * (dHeight + this.sizeMultip));

                ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dx, dy, dWidth, dHeight)
            }
        }

    }

    drawWeapon(ctx: CanvasRenderingContext2D, dest: destinationDrawData, camera: Camera) {
        let boxWidth = dest.dWidth / 5.818;
        let boxX = dest.dWidth / 1.285;
        let boxY = dest.dWidth / 35.5;

        let wID = camera.weapon.weaponID;
        let weapon = wID == 1 ? hudImgNames.WEAPON_KNIFE : wID == 2 ? hudImgNames.WEAPON_PISTOL : wID == 3 ? hudImgNames.WEAPON_MACHINEGUN : hudImgNames.WEAPON_CHAINGUN;
        let imgData = Library.instance.data.graphics2DData.HUD.pos[weapon];

        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;
        let dx = boxX + boxWidth - dWidth;
        let dy = dest.dy + boxY

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dx, dy, dWidth, dHeight)
    }

    drawFace(ctx: CanvasRenderingContext2D, dest: destinationDrawData) {
        let boxX = dest.dWidth / 2.353;
        let boxY = dest.dWidth / 64;

        let imgData = Library.instance.data.graphics2DData.HUD.pos[this.hudBarFace.currentGraphic];

        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;
        let dx = boxX;
        let dy = dest.dy + boxY

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dx, dy, dWidth, dHeight)
    }

    private drawDigits(ctx: CanvasRenderingContext2D, digits: string, boxWidth: number, boxX: number) {
        for (let i = 0; i < digits.length; i++) {
            let digit = digits[i];
            let imgData = Library.instance.data.graphics2DData.HUD.pos[digit];

            let dWidth = imgData.w * this.sizeMultip;
            let dHeight = imgData.h * this.sizeMultip;
            let dx = boxX + boxWidth - ((i + 1) * dWidth);

            ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dx, this.dyDigit, dWidth, dHeight)
        }
    }
}
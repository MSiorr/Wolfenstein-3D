import { hudImgNames, HUDStatus, MenuImgNames } from "../Config";
import Camera from "../game/Camera";
import LevelCreator from "../game/LevelCreator";
import Scene from "../game/Scene";
import Vector2 from "../game/Vector2";
import { destinationDrawData } from "../Interfaces";
import Library from "../Library";
import DataDisplay from "./helpers/DataDisplay";
import HudBar from "./HudBar";
import Scene2D from "./Scene2D";

export default class HUD {
    scene2D: Scene2D;
    img: HTMLImageElement;
    fontImg: HTMLImageElement;
    hudBar: HudBar;
    status: string;
    loaderBar: number;
    sizeMultip: number;

    endScreenLettersCanvas: HTMLCanvasElement;
    lettersPrepared: boolean;
    lettersSize: number;
    addesBonusPoint: boolean

    endPlayerImg: number;
    endPlayerChangeSpeed: number;
    lastEndPlayerChange: number;
    endScreenStart: number;
    endScreenVisible: boolean;
    endTime: number;

    constructor(scene2d: Scene2D) {
        this.scene2D = scene2d;
        this.img = Library.instance.graphics.HUD;
        this.fontImg = Library.instance.graphics.ENDFONT;
        this.hudBar = new HudBar();
        this.status = HUDStatus.LOADING;

        this.endScreenLettersCanvas = document.createElement('canvas');
        this.lettersPrepared = false;
        this.lettersSize = 0;

        this.addesBonusPoint = false;

        this.endPlayerImg = 1;
        this.lastEndPlayerChange = 0;
        this.endPlayerChangeSpeed = 500;
        this.endTime = 0;

        this.endScreenStart = 0;
        this.endScreenVisible = false;

        this.loaderBar = 0;
        this.sizeMultip = 0;
    }

    prepareLetters(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.lettersSize = Library.instance.data.graphics2DData.ENDFONT.pos['A'].h * this.sizeMultip;
        let fastCTX1 = this.endScreenLettersCanvas.getContext('2d');
        this.endScreenLettersCanvas.width = ctx.canvas.width;
        this.endScreenLettersCanvas.height = ctx.canvas.height;

        this.drawLetters(fastCTX1, "FLOOR 1", ctx.canvas.width / 2.857, ctx.canvas.height / 12.5);
        this.drawLetters(fastCTX1, "COMPLETED", ctx.canvas.width / 2.857, ctx.canvas.height / 6.25);
        this.drawLetters(fastCTX1, "BONUS", ctx.canvas.width / 2.857, ctx.canvas.height / 3.571);
        this.drawLetters(fastCTX1, "TIME", ctx.canvas.width / 2.5, ctx.canvas.height / 2.5);
        this.drawLetters(fastCTX1, "PAR 01:30", ctx.canvas.width / 2.2222, ctx.canvas.height / 2.08333);
        this.drawLetters(fastCTX1, "    KILL RATIO", ctx.canvas.width / 40, ctx.canvas.height / 1.7857);
        this.drawLetters(fastCTX1, "  SECRET RATIO", ctx.canvas.width / 40, ctx.canvas.height / 1.562);
        this.drawLetters(fastCTX1, "TREASURE RATIO", ctx.canvas.width / 40, ctx.canvas.height / 1.3888);

        for (let i = 0; i < 3; i++) {
            this.drawLetters(fastCTX1, "%", ctx.canvas.width / 1.0738, (ctx.canvas.height / 1.7857) + i * this.lettersSize);
        }

        this.lettersPrepared = true;
    }

    startLoader() {
        this.status = HUDStatus.LOADING;
        this.loaderBar = 0;
    }

    drawHUD(ctx: CanvasRenderingContext2D, deltaTime: number, camera: Camera, scene3D: Scene, lvlCreator: LevelCreator) {
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;

        let barH = width / 8;
        this.sizeMultip = ctx.canvas.width / 320;

        if (this.lettersPrepared == false) {
            this.prepareLetters(ctx, camera);
        }

        ctx.beginPath();

        ctx.fillStyle = 'rgb(0,64,64)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();

        let barDest: destinationDrawData = { dx: 0, dy: height - barH, dWidth: width, dHeight: barH };
        this.hudBar.update(ctx, barDest, camera, this.status == HUDStatus.GAMEPLAY);

        switch (this.status) {
            case HUDStatus.LOADING: { if (this.scene2D.smoothAction == false) { this.loader(deltaTime) } this.drawLoader(ctx); this.endScreenVisible = false; break; }
            case HUDStatus.GAMEPLAY: { this.drawScene3D(ctx, scene3D); this.endScreenVisible = false; break; }
            case HUDStatus.ENDSCREEN: { this.checkToChangeEndPlayer(); this.drawEndScreen(ctx, camera, lvlCreator); break; }
        }
        // this.drawScene3D(ctx, scene3D);

        ctx.fill();
        ctx.closePath();
    }

    checkToChangeEndPlayer() {
        if (Date.now() > this.lastEndPlayerChange + this.endPlayerChangeSpeed) {
            this.endPlayerImg = this.endPlayerImg == 1 ? 2 : 1;
            this.lastEndPlayerChange = Date.now();
        }
    }

    loader(deltaTime: number) {
        this.loaderBar = Math.min(1, this.loaderBar += 0.8 * deltaTime);
        if (this.loaderBar == 1) this.scene2D.enableSmoothAction(() => { this.status = HUDStatus.GAMEPLAY });
    }

    drawScene3D(ctx: CanvasRenderingContext2D, scene3D: Scene) {
        // rgb(56,56,56) 50%, rgb(112,112,112) 50%
        let sceneW = scene3D.goodWidth;
        let sceneH = scene3D.goodHeight;
        let sceneBorderW = (sceneW / 388) * 3 / 2;
        let sceneBorderH = sceneW / 388;
        this.drawTriangle(
            ctx,
            new Vector2(scene3D.marginHorizontal - sceneBorderW, scene3D.marginVertical - sceneBorderH),
            new Vector2(scene3D.marginHorizontal + sceneW + sceneBorderW, scene3D.marginVertical - sceneBorderH),
            new Vector2(scene3D.marginHorizontal - sceneBorderW, scene3D.marginVertical + sceneH + sceneBorderH),
            'rgb(0,0,0)'
        )
        this.drawTriangle(
            ctx,
            new Vector2(scene3D.marginHorizontal + sceneW + sceneBorderW, scene3D.marginVertical - sceneBorderH),
            new Vector2(scene3D.marginHorizontal - sceneBorderW, scene3D.marginVertical + sceneH + sceneBorderH),
            new Vector2(scene3D.marginHorizontal + sceneW + sceneBorderW, scene3D.marginVertical + sceneH + sceneBorderH),
            'rgb(0,102,113)'
        )
        ctx.fillStyle = 'rgb(0,102,113)';
        ctx.fillRect(scene3D.marginHorizontal - sceneBorderW, scene3D.marginVertical + sceneH, sceneBorderW, sceneBorderH);
        ctx.fillRect(scene3D.marginHorizontal + sceneW, scene3D.marginVertical - sceneBorderH, sceneBorderW, sceneBorderH);
        ctx.fillStyle = "rgb(56,56,56)";
        ctx.fillRect(scene3D.marginHorizontal, scene3D.marginVertical, sceneW, sceneH / 2);
        ctx.fillStyle = "rgb(112,112,112)";
        ctx.fillRect(scene3D.marginHorizontal, scene3D.marginVertical + sceneH / 2, sceneW, sceneH / 2);
        ctx.drawImage(scene3D.scene, scene3D.marginHorizontal, scene3D.marginVertical, sceneW, sceneH);
    }

    drawTriangle(ctx: CanvasRenderingContext2D, p1: Vector2, p2: Vector2, p3: Vector2, color: string) {
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.z);
        ctx.lineTo(p2.x, p2.z);
        ctx.lineTo(p3.x, p3.z);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
    }

    drawLoader(ctx: CanvasRenderingContext2D) {
        let imgData = Library.instance.data.graphics2DData.HUD.pos[hudImgNames.LOADER];
        let fullH = ctx.canvas.height * 7 / 8;

        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;

        let dX = ctx.canvas.width / 2 - dWidth / 2;
        let dY = fullH / 2 - dHeight / 2;

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dX, dY, dWidth, dHeight);

        let progMargin = dWidth / 44.8;
        let progWidth = (dWidth - 2 * progMargin) * this.loaderBar;
        let progHeight = dHeight / 24;

        let progDX = dX + progMargin;
        let progDY = dY + (dHeight / 1.0666);

        ctx.fillStyle = 'rgb(255,26,0)';
        ctx.fillRect(progDX, progDY, progWidth, progHeight);

        ctx.fillStyle = 'rgb(255,168,156)';
        ctx.fillRect(progDX, progDY, progWidth - (dWidth / 320), progHeight / 2);
    }

    drawEndScreen(ctx: CanvasRenderingContext2D, camera: Camera, lvlCreator: LevelCreator) {
        ctx.beginPath();
        ctx.drawImage(this.endScreenLettersCanvas, 0, 0);
        ctx.closePath();

        if (this.endScreenVisible == false) { this.endScreenStart = Date.now(); this.endScreenVisible = true; this.endTime = Date.now(); this.addesBonusPoint = false };

        let time = new Date(this.endTime - camera.startTime);
        let min = time.getMinutes().toString().padStart(2, '0');
        let sec = time.getSeconds().toString().padStart(2, '0');
        let bonus = 0;

        this.drawLetters(ctx, `${min}:${sec}`, ctx.canvas.width / 1.5384, ctx.canvas.height / 2.5);

        let killPercent = Math.min(100, Math.round(camera.killCount / lvlCreator.enemiesCount * 100)).toString().padStart(3, ' ');
        let secretPercent = Math.min(100, Math.round(lvlCreator.objects.walls.filter(e => e.moved).length / lvlCreator.secretsCount * 100)).toString().padStart(3, ' ');
        // let secretPercent = '100'.padStart(3, ' ');
        let treasurePercent = Math.min(100, Math.round(camera.treasuresFound / lvlCreator.treasuresCount * 100)).toString().padStart(3, ' ');

        [killPercent, secretPercent, treasurePercent].forEach((e, i) => {
            if (Date.now() > this.endScreenStart + 1000 + (i * 500)) {
                this.drawLetters(ctx, e, ctx.canvas.width / 1.29, (ctx.canvas.height / 1.7857) + i * this.lettersSize)
            }
            if (e == '100') { bonus += 10000 };
        })

        let timeBonus = Math.max(0, 90000 - (this.endTime - camera.startTime));
        bonus += Math.ceil(timeBonus / 1000) * 500;

        if (this.addesBonusPoint == false) { camera.points += bonus; this.addesBonusPoint = true };

        let strBonus = bonus.toString().padStart(5, ' ')

        this.drawLetters(ctx, strBonus, ctx.canvas.width / 1.5384, ctx.canvas.height / 3.5714)


        this.drawPlayerSelfImage(ctx, ctx.canvas.width / 16, ctx.canvas.height / 12.5)
    }

    private drawPlayerSelfImage(ctx: CanvasRenderingContext2D, dX: number, dY: number) {
        let imgData = Library.instance.data.graphics2DData.HUD.pos[hudImgNames.END_PLAYER.replace("_id", `_${this.endPlayerImg}`)];
        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;

        ctx.fillStyle = 'rgb(0, 102, 113)';
        ctx.fillRect((dX + dWidth / imgData.w), (dY + dHeight / imgData.h), dWidth, dHeight)
        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dX, dY, dWidth, dHeight);
    }

    private drawLetters(ctx: CanvasRenderingContext2D, letters: string, dX: number, dY: number) {
        let neededCanvas = document.createElement('canvas');
        neededCanvas.width = ctx.canvas.width;
        neededCanvas.height = ctx.canvas.height;

        let neededCTX = neededCanvas.getContext('2d');
        //@ts-ignore
        neededCTX.mozImageSmoothingEnabled = false;
        neededCTX.imageSmoothingEnabled = false;

        let pos = 0;
        for (let i = 0; i < letters.length; i++) {
            let letter = letters[i];
            if (letter == " ") {
                pos += 16 * this.sizeMultip;
            } else {
                let imgData = Library.instance.data.graphics2DData.ENDFONT.pos[letter];
                let dWidth = imgData.w * this.sizeMultip;
                let dHeight = imgData.h * this.sizeMultip;

                let newDX = dX + pos;
                pos += dWidth;

                neededCTX.drawImage(this.fontImg, imgData.x, imgData.y, imgData.w, imgData.h, newDX, dY, dWidth, dHeight);
            }
        }

        ctx.beginPath();
        ctx.drawImage(neededCanvas, 0, 0)
        ctx.closePath();
    }
}
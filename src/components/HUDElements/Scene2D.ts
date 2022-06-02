import Crosshair from "./helpers/Crosshair";
import FPS from "./helpers/FPS";
import Main from "../Main";
import Element2D from "./Element2D";
import DataDisplay from "./helpers/DataDisplay";
import HudBar from "./HudBar";
import Scene from "../game/Scene";
import Camera from "../game/Camera";
import { destinationDrawData, IPoint2D } from "../Interfaces";
import Point2D from "./helpers/Point2D";
import { AudioNames, config, HUDStatus, MenuOptionsOptions, MenuScreens, Scene2DColors, Scene2DStatus } from "../Config";
import HUD from "./HUD";
import RedPixel from "./helpers/RedPixel";
import Menu from "./Menu";
import Library from "../Library";
import MyAudio from "../MyAudio";

export default class Scene2D {
    root: HTMLElement
    parent: Main;
    camera: Camera;
    scene3D: Scene;
    scene: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    FPS: FPS;
    hudBar: HudBar;
    dataDisplay: DataDisplay;
    HUD: HUD;
    Menu: Menu;

    renderColorScreen: boolean
    colorScreenToRender: string;
    colorScreenOpacity: number;

    deathCam: boolean;
    removePixels: boolean;
    randomRedPixels: RedPixel[];
    leftPixels: RedPixel[];
    pixelsPerFrameDivider: number;
    pixelsPerFrame: number;
    sceneStatus: string;
    smoothAction: boolean;
    currAlpha: number;
    targetOption: number;
    actionOnChange: Function;
    targetReached: boolean;
    alphaChangeSpeed: number;
    fastCanvas: HTMLCanvasElement;
    fastCTX: CanvasRenderingContext2D;

    constructor(parent: Main, root: HTMLElement, scene3D: Scene) {
        this.root = root;
        this.parent = parent;
        this.camera = parent.camera;
        this.scene3D = scene3D;

        this.scene = document.createElement('canvas');
        this.scene.id = "hudCanvas";

        this.fastCanvas = document.createElement('canvas');
        this.fastCTX = this.fastCanvas.getContext('2d');

        this.ctx = this.scene.getContext('2d');

        this.HUD = new HUD(this);

        this.FPS = new FPS();
        this.Menu = new Menu();

        this.sceneStatus = Scene2DStatus.MENU;

        this.renderColorScreen = true;
        this.colorScreenToRender = Scene2DColors.HIT;
        this.colorScreenOpacity = 0;

        this.smoothAction = false;
        this.currAlpha = 1;
        this.targetReached = false;
        this.actionOnChange = undefined;
        this.alphaChangeSpeed = 1.75;

        this.deathCam = false;
        this.removePixels = false;
        this.randomRedPixels = [];
        this.leftPixels = [];
        this.pixelsPerFrameDivider = 100;
        this.pixelsPerFrame = 20;

        root.appendChild(this.scene)
        this.fixSize(document.body.clientWidth, document.body.clientHeight);
        // this.fixSize();
    }


    enableSmoothAction(action: Function) {
        this.smoothAction = true;
        this.currAlpha = 1;
        this.targetReached = false;
        this.actionOnChange = action;
    }

    render(deltaTime: number) {
        this.baseSettings();

        // this.FPS.updateFPS(1 / deltaTime);

        if (this.smoothAction) this.smoothCanvasAction(this.ctx, deltaTime);

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.fastCTX.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();

        this.ctx.globalAlpha = this.currAlpha;

        if (this.sceneStatus == Scene2DStatus.MENU) {
            this.Menu.draw(this.fastCTX, deltaTime);
        } else {
            this.HUD.drawHUD(this.fastCTX, deltaTime, this.camera, this.scene3D, this.parent.levelCreator);
            // this.drawHUD();

            if (this.deathCam == false) {
                if (this.renderColorScreen) {
                    this.drawColorScreen(this.fastCTX, deltaTime);
                }
                if (this.randomRedPixels.length > 0) {
                    this.drawRanomRedPixels(this.fastCTX);
                }

            } else {
                this.drawRanomRedPixels(this.fastCTX);
            }
        }

        this.ctx.drawImage(this.fastCanvas, 0, 0);
        this.ctx.closePath();
    }

    smoothCanvasAction(ctx: CanvasRenderingContext2D, deltaTime: number) {
        let alpha;
        if (this.targetReached == false) {
            alpha = Math.max(0, Math.min(1, this.currAlpha - this.alphaChangeSpeed * deltaTime))
            if (alpha == 0) { this.targetReached = true; if (this.actionOnChange) this.actionOnChange(); };
        } else {
            alpha = Math.max(0, Math.min(1, this.currAlpha + this.alphaChangeSpeed * deltaTime))
            if (alpha == 1) { this.smoothAction = false }
        }
        this.currAlpha = alpha;
    }

    drawRanomRedPixels(ctx: CanvasRenderingContext2D) {
        let anyLeft = this.removePixels ? this.removeRedPixels() : this.addRedPixels();

        ctx.fillStyle = 'red';
        if (anyLeft) {
            this.randomRedPixels.forEach(e => {
                ctx.fillRect(Math.max(this.scene3D.marginHorizontal, this.scene3D.marginHorizontal + (e.x * e.width) - 1), Math.max(this.scene3D.marginVertical, this.scene3D.marginVertical + (e.y * e.width) - 1), e.width + 1.1, e.width + 1.1);
            })
        } else {
            if (this.removePixels == false) {
                ctx.fillRect(this.scene3D.marginHorizontal, this.scene3D.marginVertical, this.scene3D.scene.width, this.scene3D.scene.height);
                this.parent.restartLvl();
            } else {
                this.deathCam = false;
                this.parent.inRestartProcess = false;
            }
        }
    }

    addRedPixels() {
        for (let i = 0; i < this.pixelsPerFrame; i++) {
            if (this.leftPixels.length > 0) {
                let rand = Math.floor(Math.random() * this.leftPixels.length);
                this.randomRedPixels.push(this.leftPixels[rand])
                this.leftPixels.splice(rand, 1);
            } else {
                return false;
            }
        }
        return true;
    }

    removeRedPixels() {
        for (let i = 0; i < this.pixelsPerFrame; i++) {
            if (this.randomRedPixels.length > 0) {
                let rand = Math.floor(Math.random() * this.randomRedPixels.length);
                this.randomRedPixels.splice(rand, 1);
            } else {
                return false
            }
        }
        return true
    }

    drawColorScreen(ctx: CanvasRenderingContext2D, deltaTime: number) {
        this.colorScreenOpacity -= 12 * deltaTime;

        let opacity = Math.max(0, (1 - Math.abs(this.colorScreenOpacity)) / 4);
        ctx.globalAlpha = opacity
        ctx.fillStyle = this.colorScreenToRender;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (opacity <= 0) {
            this.renderColorScreen = false;
        }
    }

    baseSettings() {
        this.ctx.canvas.width = this.scene.clientWidth;
        this.ctx.canvas.height = this.scene.clientHeight;
        //@ts-ignore
        this.ctx.webkitImageSmoothingEnabled = false;
        //@ts-ignore
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;


        this.fastCanvas.width = this.ctx.canvas.width;
        this.fastCanvas.height = this.ctx.canvas.height;
        //@ts-ignore
        this.fastCTX.mozImageSmoothingEnabled = false;
        this.fastCTX.imageSmoothingEnabled = false;
    }


    fixSize(width: number, height: number) {

        let size1 = { w: width, h: 10 / 16 * width };
        let size2 = { w: 16 / 10 * height, h: height };

        if (size1.w < size2.w) {
            this.scene.style.width = (size1.w - 10) + "px";
            this.scene.style.height = (size1.h - 10) + "px";
        } else {
            this.scene.style.width = (size2.w - 10) + "px";
            this.scene.style.height = (size2.h - 10) + "px";
        }

        let barH = this.scene.clientWidth / 8;

        let marginHorizontal = this.scene.clientWidth / 45;
        let marginVertical = (this.scene.clientHeight - barH) / 54;

        let scene1 = { w: this.scene.clientWidth - 2 * marginHorizontal, h: (1 / 2) * (this.scene.clientWidth - 2 * marginHorizontal) }
        let scene2 = { w: (2 / 1) * ((this.scene.clientHeight - barH) - 2 * marginVertical), h: (this.scene.clientHeight - barH) - 2 * marginVertical }

        let sceneW;
        let sceneH;

        if (scene1.w < scene2.w) {
            sceneW = scene1.w;
            sceneH = scene1.h;
            marginVertical = ((this.scene.clientHeight - barH) - sceneH) / 2
        } else {
            sceneW = scene2.w;
            sceneH = scene2.h;
            marginHorizontal = (this.scene.clientWidth - sceneW) / 2
        }

        this.scene3D.marginHorizontal = marginHorizontal;
        this.scene3D.marginVertical = marginVertical;

        this.scene3D.scene.style.width = sceneW + 'px';
        this.scene3D.scene.style.height = sceneH + 'px';

        this.scene3D.goodWidth = sceneW;
        this.scene3D.goodHeight = sceneH;
        this.scene3D.scene.width = sceneW;
        this.scene3D.scene.height = sceneH;

        this.scene3D.updateCamera();
        this.deathCam ? this.fixRedPixels() : null

    }

    fixRedPixels() {
        let width = this.scene3D.scene.width / config.redPixelsAmountInX;
        this.randomRedPixels.flat().map(e => e.width = width);
    }

    setColorScreenRender(color: string, startOpacity: number = 0.1) {
        this.renderColorScreen = true;
        this.colorScreenToRender = color;
        this.colorScreenOpacity = 1 - startOpacity;
    }

    enableDeathCam() {
        if (this.deathCam == false) {
            this.randomRedPixels = [];
            this.leftPixels = [];
            this.deathCam = true;
            this.removePixels = false;
            let totalPixels = config.redPixelsAmountInX * (config.redPixelsAmountInX / 2);
            let width = this.scene3D.scene.width / config.redPixelsAmountInX;
            for (let i = 0; i < config.redPixelsAmountInX; i++) {
                for (let j = 0; j < config.redPixelsAmountInX / 2; j++) {
                    this.leftPixels.push(new RedPixel(i, j, width));
                }
            }
            this.pixelsPerFrame = totalPixels / this.pixelsPerFrameDivider
        }
    }

    disableDeathCam() {
        this.removePixels = true;
    }

    moveDown() {
        if (this.inMovebleScreen() && this.smoothAction == false) {
            this.Menu.selectedOption++;
            MyAudio.instance.playAudio(AudioNames.MENU_MOVE);
            if (this.Menu.selectedOption > Object.keys(this.Menu.currentOptions).length) {
                this.Menu.selectedOption = 1;
            } else if (this.checkThisDisabled(this.Menu.selectedOption)) {
                this.moveDown()
            }
        }
    }

    moveUp() {
        if (this.inMovebleScreen() && this.smoothAction == false) {
            this.Menu.selectedOption--;
            MyAudio.instance.playAudio(AudioNames.MENU_MOVE);
            if (this.Menu.selectedOption < 1) {
                this.Menu.selectedOption = Object.keys(this.Menu.currentOptions).length;
            } else if (this.checkThisDisabled(this.Menu.selectedOption)) {
                this.moveUp()
            }
        }
    }

    enter() {
        if (this.smoothAction == false) {
            if (this.sceneStatus == Scene2DStatus.MENU) {
                switch (this.Menu.screenID) {
                    case MenuScreens.BLUEINFO: {
                        MyAudio.instance.playAudio(AudioNames.THEME_SPLASH);
                        this.enableSmoothAction(() => { this.Menu.screenID = MenuScreens.GAME_TITLE })
                        break;
                    }
                    case MenuScreens.GAME_TITLE: {
                        this.enableSmoothAction(() => { this.Menu.screenID = MenuScreens.CREDITS })
                        break;
                    }
                    case MenuScreens.CREDITS: {
                        MyAudio.instance.stopAll();
                        MyAudio.instance.playAudio(AudioNames.THEME_MENU);
                        this.Menu.lettersPrepared = false;
                        this.enableSmoothAction(() => { this.Menu.screenID = MenuScreens.OPTIONS })
                        break;
                    }
                    case MenuScreens.OPTIONS: {
                        MyAudio.instance.playAudio(AudioNames.MENU_SELECT);
                        if (this.Menu.selectedOption == MenuOptionsOptions.NEW_GAME.id) {
                            this.Menu.lettersPrepared = false;
                            this.enableSmoothAction(() => { this.Menu.screenID = MenuScreens.CHOOSE_DIFFICULTY; this.Menu.selectedOption = 3 })
                        } else if (this.Menu.selectedOption == MenuOptionsOptions.BACK_TO_GAME.id) {
                            this.enableSmoothAction(() => { this.sceneStatus = Scene2DStatus.GAME; this.Menu.screenID = MenuScreens.OPTIONS; this.Menu.selectedOption = 1; })
                            MyAudio.instance.stopAll();
                            MyAudio.instance.playAudio(AudioNames.THEME_LEVEL);
                        } else {
                            window.location.reload();
                        }
                        break;
                    }
                    case MenuScreens.CHOOSE_DIFFICULTY: {
                        MyAudio.instance.stopAll();
                        MyAudio.instance.playAudio(AudioNames.THEME_LEVEL);
                        MyAudio.instance.playAudio(AudioNames.MENU_SELECT);
                        this.parent.levelCreator.setDifficulty(this.Menu.selectedOption)
                        this.parent.createLevel(JSON.stringify(Library.instance.levels.level1), true)
                        this.enableSmoothAction(() => {
                            this.sceneStatus = Scene2DStatus.GAME;
                            this.HUD.startLoader();
                            this.Menu.screenID = MenuScreens.OPTIONS; this.Menu.selectedOption = 1;
                        })
                        break;
                    }
                }
            } else {
                if (this.HUD.status == HUDStatus.ENDSCREEN) {
                    this.Menu.prepareLettersCanvas(this.ctx, false);
                    this.enableSmoothAction(() => { this.sceneStatus = Scene2DStatus.MENU; this.Menu.screenID = MenuScreens.OPTIONS; this.Menu.selectedOption = 1; this.Menu.enableSpecial = false })
                    MyAudio.instance.stopAll();
                    MyAudio.instance.playAudio(AudioNames.THEME_MENU);
                }
            }
        }
    }

    checkThisDisabled(id: number) {
        let it = this.Menu.currentOptions.find(e => e.id == id);
        if (this.Menu.enableSpecial == true && it.special) {
            return false
        } else {
            return !it.active
        }
    }

    inMovebleScreen() {
        if (this.Menu.screenID == MenuScreens.OPTIONS || this.Menu.screenID == MenuScreens.CHOOSE_EPISODE || this.Menu.screenID == MenuScreens.CHOOSE_DIFFICULTY) {
            return true;
        } else {
            return false;
        }
    }

    enableOptions() {
        if (this.sceneStatus != Scene2DStatus.MENU) {
            MyAudio.instance.stopAll();
            MyAudio.instance.playAudio(AudioNames.THEME_MENU);
            this.Menu.lettersPrepared = false;
            this.enableSmoothAction(() => {
                this.sceneStatus = Scene2DStatus.MENU;
                this.Menu.selectedOption = 1;
                this.Menu.enableSpecial = true;
                this.Menu.screenID = MenuScreens.OPTIONS
                this.Menu.prepareLettersCanvas(this.ctx, true);
            })
        }
    }
}
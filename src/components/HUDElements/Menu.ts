import { MenuDifficultyOptions, menuFontColors, MenuImgNames, MenuOptionsOptions, MenuScreens } from "../Config";
import { graphics2DDataPos, graphics2DPos, IMenuDifficultyOptions, ImenuOptionOptions, optionsInfo } from "../Interfaces";
import Library from "../Library";

export default class Menu {
    screenID: number;
    sizeMultip: number;
    img: HTMLImageElement;
    fontImg: HTMLImageElement;
    optionsLettersCanvas: HTMLCanvasElement;
    episodesLettersCanvas: HTMLCanvasElement;
    difficultiesLettersCanvas: HTMLCanvasElement;
    lettersPrepared: boolean;
    selectedOption: number;
    lettersSize: number;
    currentOptions: optionsInfo[]
    pistolTexture: string;
    pistolAnimChange: number;
    lastPistolChange: number;
    enableSpecial: boolean;
    constructor() {
        // this.screenID = MenuScreens.CHOOSE_DIFFICULTY;
        this.screenID = MenuScreens.BLUEINFO;
        this.img = Library.instance.graphics.MENU;
        this.fontImg = Library.instance.graphics.MENUFONT;

        this.optionsLettersCanvas = document.createElement('canvas');
        this.episodesLettersCanvas = document.createElement('canvas');
        this.difficultiesLettersCanvas = document.createElement('canvas');

        this.lettersPrepared = false;
        this.lettersSize = 0;
        this.selectedOption = 1;

        this.currentOptions = undefined;
        this.enableSpecial = false;

        this.pistolTexture = MenuImgNames.MENU_PISTOL_1;
        this.pistolAnimChange = 1000;
        this.lastPistolChange = 0;

        this.sizeMultip = 0;
    }

    prepareLettersCanvas(ctx: CanvasRenderingContext2D, enableSpecial: boolean = false) {
        this.lettersSize = Library.instance.data.graphics2DData.MENUFONT.pos['A'].h * this.sizeMultip / 2;
        let fastCTX1 = this.optionsLettersCanvas.getContext('2d');
        this.optionsLettersCanvas.width = ctx.canvas.width;
        this.optionsLettersCanvas.height = ctx.canvas.height;
        Object.keys(MenuOptionsOptions).forEach((e, i) => {
            let optionInfo = MenuOptionsOptions[e as keyof ImenuOptionOptions];
            let color = enableSpecial && optionInfo.special ? menuFontColors.special : optionInfo.active == false ? menuFontColors.inactive : optionInfo.special ? menuFontColors.special : menuFontColors.active;
            this.drawLetters(fastCTX1, this.toMenuString(e), ctx.canvas.width / 3.2, ctx.canvas.height / 3.571, i, color);
        })

        let fastCTX2 = this.difficultiesLettersCanvas.getContext('2d');
        this.difficultiesLettersCanvas.width = ctx.canvas.width;
        this.difficultiesLettersCanvas.height = ctx.canvas.height;

        this.drawLetters(fastCTX2, 'How tought are you?', ctx.canvas.width / 4.6, ctx.canvas.height / 2.94, 0, menuFontColors.special);

        Object.keys(MenuDifficultyOptions).forEach((e, i) => {
            let color = menuFontColors.active;
            this.drawLetters(fastCTX2, e, ctx.canvas.width / 4.05, ctx.canvas.height / 2, i, color);
        })

        this.lettersPrepared = true;
    }

    draw(ctx: CanvasRenderingContext2D, deltaTime: number) {
        this.sizeMultip = ctx.canvas.width / 320;
        ctx.beginPath();

        switch (this.screenID) {
            case MenuScreens.BLUEINFO: this.drawBlueScreen(ctx); break;
            case MenuScreens.GAME_TITLE: this.drawGameTitleScreen(ctx); break;
            case MenuScreens.CREDITS: this.drawCreditsScreen(ctx); break;
            case MenuScreens.OPTIONS: this.drawOptionsScreen(ctx); break;
            case MenuScreens.CHOOSE_EPISODE: this.drawChooseEpisodeScreen(ctx); break;
            case MenuScreens.CHOOSE_DIFFICULTY: this.drawChooseDifficultyScreen(ctx); break;
        }
        if (this.lettersPrepared == false) {
            this.prepareLettersCanvas(ctx);
        }

        ctx.closePath();

        this.checkToChangePistol();
    }

    checkToChangePistol() {
        if (Date.now() > this.lastPistolChange) {
            this.pistolTexture = this.pistolTexture == MenuImgNames.MENU_PISTOL_1 ? MenuImgNames.MENU_PISTOL_2 : MenuImgNames.MENU_PISTOL_1;
            this.lastPistolChange = this.pistolAnimChange + Date.now()
        }
    }

    drawBlueScreen(ctx: CanvasRenderingContext2D) {
        let imgData = Library.instance.data.graphics2DData.MENU.pos[MenuImgNames.BLUE_SCREEN_INFO];
        let dx = ctx.canvas.width / 1.481;
        let dy = ctx.canvas.height / 1.818;

        this.drawBackground(ctx, 'rgb(32,168,252)')
        this.drawMyImg(ctx, imgData, dx, dy)
    }

    drawGameTitleScreen(ctx: CanvasRenderingContext2D) {
        let imgData = Library.instance.data.graphics2DData.MENU.pos[MenuImgNames.GAME_TITLE_SCREEN];
        let dx = 0;
        let dy = 0;

        this.drawMyImg(ctx, imgData, dx, dy)
    }

    drawCreditsScreen(ctx: CanvasRenderingContext2D) {
        let imgData = Library.instance.data.graphics2DData.MENU.pos[MenuImgNames.CREDITS_SCREEN];
        let dx = 0;
        let dy = 0;

        this.drawMyImg(ctx, imgData, dx, dy)
    }

    drawOptionsScreen(ctx: CanvasRenderingContext2D) {
        let tab: optionsInfo[] = [];
        Object.keys(MenuOptionsOptions).map(e => tab.push(MenuOptionsOptions[e as keyof ImenuOptionOptions]));
        this.currentOptions = Array.from(tab);

        this.drawBackground(ctx, 'rgb(147,14,0)');
        this.drawBlackTopLine(ctx);
        this.drawBanner(ctx, Library.instance.data.graphics2DData.MENU.pos[MenuImgNames.TITLE_OPTIONS]);
        this.drawShadowBox(ctx, 177 * this.sizeMultip, 135 * this.sizeMultip, ctx.canvas.height / 3.846);
        this.drawDownInfo(ctx);

        this.drawLettersCanvas(ctx, this.optionsLettersCanvas, ctx.canvas.height / 3.571);

        this.drawPickPistol(ctx, ctx.canvas.width / 4.3537, (ctx.canvas.height / 3.571) + ((this.selectedOption - 1) * this.lettersSize))

    }

    drawChooseEpisodeScreen(ctx: CanvasRenderingContext2D) {
        this.drawBackground(ctx, 'rgb(147,14,0)');
        this.drawShadowBox(ctx, 307 * this.sizeMultip, 161 * this.sizeMultip, ctx.canvas.height / 10.52);
        this.drawDownInfo(ctx);
    }

    drawChooseDifficultyScreen(ctx: CanvasRenderingContext2D) {
        let tab: optionsInfo[] = [];
        Object.keys(MenuDifficultyOptions).map(e => tab.push(MenuDifficultyOptions[e as keyof IMenuDifficultyOptions]));
        this.currentOptions = Array.from(tab);

        this.drawBackground(ctx, 'rgb(147,14,0)');
        this.drawShadowBox(ctx, 224 * this.sizeMultip, 66 * this.sizeMultip, ctx.canvas.height / 2.2222);
        this.drawDownInfo(ctx);

        this.drawLettersCanvas(ctx, this.difficultiesLettersCanvas, ctx.canvas.height / 2);

        this.drawPickPistol(ctx, ctx.canvas.width / 6.122, ctx.canvas.height / 2 + ((this.selectedOption - 1) * this.lettersSize));

        this.drawDifficultyFace(ctx, ctx.canvas.width / 1.38, ctx.canvas.height / 1.87);
    }


    private drawDifficultyFace(ctx: CanvasRenderingContext2D, dX: number, dY: number) {
        let imgData = Library.instance.data.graphics2DData.MENU.pos[MenuImgNames.DIFFICULTY_FACE.replace('_id', `_${this.selectedOption}`)];
        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dX, dY, dWidth, dHeight);
    }

    private drawLettersCanvas(ctx: CanvasRenderingContext2D, lettCanvas: HTMLCanvasElement, lettStart: number) {
        ctx.beginPath();
        ctx.globalAlpha = 0.7;
        ctx.drawImage(lettCanvas, 0, 0)
        ctx.globalAlpha = 1;
        let pickedY = lettStart + (this.lettersSize * (this.selectedOption - 1));
        ctx.drawImage(lettCanvas, 0, pickedY, ctx.canvas.width, this.lettersSize, 0, pickedY, ctx.canvas.width, this.lettersSize);
        ctx.closePath();
    }

    private drawPickPistol(ctx: CanvasRenderingContext2D, dX: number, dY: number) {
        let imgData = Library.instance.data.graphics2DData.MENU.pos[this.pistolTexture];
        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dX, dY, dWidth, dHeight);
    }

    private toMenuString(txt: string) {
        while (txt.indexOf('_') != -1) txt = txt.replace('_', ' ');
        let tab = txt.split(' ');
        tab.map(e => e[0].toUpperCase() + e.substring(1).toLowerCase());
        return tab.join(' ');
    }

    private drawBackground(ctx: CanvasRenderingContext2D, color: string) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    private drawMyImg(ctx: CanvasRenderingContext2D, imgData: graphics2DPos, dx: number, dy: number) {
        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dx, dy, dWidth, dHeight);
    }

    private drawBlackTopLine(ctx: CanvasRenderingContext2D) {
        let x = 0;
        let y = ctx.canvas.height / 20;
        let width = ctx.canvas.width;
        let height = ctx.canvas.height / 8.3333333

        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, width, height);

        let smallY = ctx.canvas.height / 6.25;
        let smallHeight = ctx.canvas.height / 200;

        ctx.fillStyle = 'rgb(107,10,0)';
        ctx.fillRect(x, smallY, width, smallHeight);
    }

    private drawBanner(ctx: CanvasRenderingContext2D, imgData: graphics2DPos) {
        let dx = (160 - (imgData.w / 2)) * this.sizeMultip;
        let dy = ctx.canvas.height / 33.3333;

        this.drawMyImg(ctx, imgData, dx, dy);
    }

    private drawShadowBox(ctx: CanvasRenderingContext2D, dWidth: number, dHeight: number, dy: number) {
        let border = ctx.canvas.width / 320;
        let dx = ctx.canvas.width / 2 - dWidth / 2;
        // rgb(229,22,0)   rgb(121,10,0)   rgb(94,9,0)
        ctx.fillStyle = 'rgb(229,22,0)';
        ctx.fillRect(dx - border, dy - border, dWidth + 2 * border, dHeight + 2 * border);

        ctx.fillStyle = 'rgb(121,10,0)';
        ctx.fillRect(dx - border, dy - border, dWidth + border, dHeight + border)

        ctx.fillStyle = 'rgb(94,9,0)';
        ctx.fillRect(dx, dy, dWidth, dHeight);
    }

    private drawDownInfo(ctx: CanvasRenderingContext2D) {
        let imgData = Library.instance.data.graphics2DData.MENU.pos[MenuImgNames.OPTIONS_DOWN_BANNER];
        let dWidth = imgData.w * this.sizeMultip;
        let dHeight = imgData.h * this.sizeMultip;
        let dx = ctx.canvas.width / 2 - dWidth / 2;
        let dy = ctx.canvas.height / 1.0416;

        ctx.drawImage(this.img, imgData.x, imgData.y, imgData.w, imgData.h, dx, dy, dWidth, dHeight);
    }

    private drawLetters(ctx: CanvasRenderingContext2D, letters: string, dX: number, dY: number, column: number, color: string) {
        let pos = 0;

        let fastCanvas = document.createElement('canvas');
        fastCanvas.width = ctx.canvas.width;
        fastCanvas.height = ctx.canvas.height;

        let fastCTX = fastCanvas.getContext('2d');
        //@ts-ignore
        fastCTX.mozImageSmoothingEnabled = false;
        fastCTX.imageSmoothingEnabled = false;

        let secfastCanvas = document.createElement('canvas');
        secfastCanvas.width = ctx.canvas.width;
        secfastCanvas.height = ctx.canvas.height;
        let secfastCTX = secfastCanvas.getContext('2d');

        for (let i = 0; i < letters.length; i++) {
            let letter = letters[i];
            if (letter == ' ') {
                pos += 16 * this.sizeMultip / 2;
            } else {
                let imgData = Library.instance.data.graphics2DData.MENUFONT.pos[letter];
                let dWidth = imgData.w * this.sizeMultip / 2;
                let dHeight = imgData.h * this.sizeMultip / 2;
                let newDX = dX + pos;
                let newDY = dY + column * dHeight;
                fastCTX.beginPath();
                fastCTX.drawImage(this.fontImg, imgData.x, imgData.y, imgData.w, imgData.h, newDX, newDY, dWidth, dHeight);
                fastCTX.closePath();
                pos += dWidth;
            }
        }
        secfastCTX.beginPath();
        secfastCTX.fillStyle = color;
        secfastCTX.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        secfastCTX.globalCompositeOperation = 'destination-in';
        secfastCTX.drawImage(fastCanvas, 0, 0);
        secfastCTX.closePath();


        ctx.beginPath();
        ctx.drawImage(secfastCanvas, 0, 0);
        ctx.closePath();

    }
}
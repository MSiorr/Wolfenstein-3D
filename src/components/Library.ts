import { Graphics, Shaders, LibraryData, Levels } from "./Interfaces";
import MyAudio from "./MyAudio";

export default class Library {
    static instance = new this;
    shaders: Shaders
    graphics: Graphics
    levels: Levels
    data: LibraryData
    audio: MyAudio;
    constructor() {
        this.shaders = {
            vertShader: null,
            fragShader: null
        }

        this.graphics = {
            WALL: null,
            ENEMY: null,
            DOG: null,
            WEAPON: null,
            OBJECT: null,
            HUD: null,
            PLAYER: null,
            MAPCREATOR: null,
            MENU: null,
            MENUFONT: null,
            ENDFONT: null
        }

        this.levels = {
            level1: null
        }

        this.data = {
            graphicsData: null,
            graphics2DData: null,
            animationsData: null
        }

        this.audio = new MyAudio();
    }

    Load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.LoadShaders()
                .then(() => {
                    resolve();
                })
        })
    }

    private async LoadShaders() {
        let vertS = await require("../shaders/shader.vert");
        let vertF = await require("../shaders/shader.frag");

        this.shaders.vertShader = vertS
        this.shaders.fragShader = vertF

        await this.LoadGraphics()
        await this.LoadData()
        await this.LoadLevels();
        await MyAudio.instance.LoadAudios();
    }

    private async LoadGraphics() {
        let renderTab = [];
        renderTab.push({ name: "WALL", src: await require("../assets/wallsMain.png").default })
        renderTab.push({ name: "ENEMY", src: await require("../assets/enemy.png").default })
        renderTab.push({ name: "DOG", src: await require("../assets/dog.png").default })
        renderTab.push({ name: "WEAPON", src: await require("../assets/weapons.png").default })
        renderTab.push({ name: "OBJECT", src: await require("../assets/objects.png").default })
        renderTab.push({ name: "HUD", src: await require("../assets/hud.png").default })
        renderTab.push({ name: "PLAYER", src: await require("../assets/player.png").default })
        renderTab.push({ name: "MAPCREATOR", src: await require("../assets/mapCreator.png").default })
        renderTab.push({ name: "MENU", src: await require("../assets/menu.png").default })
        renderTab.push({ name: "MENUFONT", src: await require("../assets/menuFont.png").default })
        renderTab.push({ name: "ENDFONT", src: await require("../assets/endFont.png").default })

        for (let i = 0; i < renderTab.length; i++) {
            let img = new Image();
            img.src = renderTab[i].src;
            await img.decode()
            this.graphics[renderTab[i].name] = img
        }
    }

    private async LoadData() {
        let textureData = await require("../textureData.json");
        let texture2DData = await require("../texture2DData.json");
        let animationsData = await require("../animationsData.json");

        this.data.graphicsData = textureData;
        this.data.graphics2DData = texture2DData;
        this.data.animationsData = animationsData;

    }

    private async LoadLevels() {
        // let level1 = await require('../levels/Level1Test.json');
        let level1 = await require('../levels/Level1.json');
        // let level1 = await require('../defaultMap.json');
        this.levels.level1 = level1;
    }
}
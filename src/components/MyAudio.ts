import { AudioNames } from "./Config";

export interface sounds {
    [index: string]: HTMLAudioElement
}

export default class MyAudio {
    static instance = new this;
    sounds: sounds
    constructor() {
        this.sounds = {
            P_AMMO: null,
            P_MGUN: null,
            P_CGUN: null,
            P_FOOD: null,
            P_MEDKIT: null,
            P_LIFE: null,
            T_CHEST: null,
            T_CROSS: null,
            T_CROWN: null,
            T_CUP: null,
            WSND0003: null,
            WSND0002: null,
            WSND0015: null,
            WSND0030: null,
            S_100: null,
            S_BONUSC: null,
            DSWKNIF: null,
            WSND0005: null,
            WSND0004: null,
            WSND0006: null,
            WSND0021: null,
            WSND0014: null,
            DSDEATH: null,
            WSND0001: null,
            WSND0029: null,
            WSND0016: null,
            WSND0012: null,
            WSND0013: null,
            WSND0034: null,
            WSND0035: null,
            WSND0039: null,
            WSND0040: null,
            WSND0041: null,
            WSND0042: null,
            WSND0000: null,
            M_SELECT: null,
            M_MOVE: null,
            THEME_SPLASH: null,
            THEME_MENU: null,
            THEME_LEVEL: null
        }
    }

    async LoadAudios() {
        let renderTab = [];
        for (let i = 0; i < Object.keys(this.sounds).length; i++) {
            let name = Object.keys(this.sounds)[i];
            renderTab.push({ name: name, src: await require(`../audio/${name}.${name.indexOf("THEME") == -1 ? "wav" : "mp3"}`).default })
        };

        renderTab.forEach(e => {
            let audio = new Audio(e.src);
            audio.volume = e.name.indexOf("THEME") == -1 ? 0.25 : 0.05;
            this.sounds[e.name] = audio
        })

    }

    playAudio(name: string, loop: boolean = false) {
        if (this.sounds[name].currentTime != 0) {
            this.stopAudio(name);
            this.restartAudio(name);
        }
        this.sounds[name].play();
        if (loop || name.indexOf("THEME") != -1) { this.sounds[name].loop = true }
    }

    stopAudio(name: string) {
        if (this.sounds[name].currentTime != 0) {
            this.sounds[name].pause();
            this.sounds[name].loop = false;
        }
    }

    restartAudio(name: string) {
        this.sounds[name].currentTime = 0;
    }

    stopAll() {
        for (let name in this.sounds) {
            this.stopAudio(name);
        }
    }
}
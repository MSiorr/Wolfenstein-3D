export default class FPS {
    div: HTMLDivElement;
    constructor() {
        this.div = document.createElement('div');
        this.div.id = "FPS";
        document.body.appendChild(this.div);
    }

    updateFPS(fps: number) {
        this.div.innerHTML = Math.floor(fps).toString() + " fps"
    }
}
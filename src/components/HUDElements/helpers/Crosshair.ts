import Element2D from "../Element2D";


export default class Crosshair extends Element2D {
    color: string;
    size: number;
    texture: WebGLTexture;
    constructor() {
        super();
        this.color = 'red';
        this.size = 10;
    }

    update(ctx: CanvasRenderingContext2D) {
        ctx.rect(ctx.canvas.width / 2 - (this.size / 2), ctx.canvas.height / 2 - (this.size / 2), this.size, this.size);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
}
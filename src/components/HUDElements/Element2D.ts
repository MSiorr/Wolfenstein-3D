export default abstract class Element2D {
    constructor() {

    }

    abstract update(ctx: CanvasRenderingContext2D, ...args: any[]): void
}
import { IPoint2D } from "../../Interfaces";

export default class Point2D implements IPoint2D {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
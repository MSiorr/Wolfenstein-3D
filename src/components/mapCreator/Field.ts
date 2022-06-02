import { mapCreatorActiveElement } from "../Interfaces";

export default class Field {
    x: number;
    y: number;
    div: HTMLDivElement;
    data?: { type: string, texture: string, name?: string, look?: string }
    lastActiveData?: mapCreatorActiveElement

    parent?: Field
    child?: Field
    alive?: boolean
    difficulty?: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.div = document.createElement('div');
        this.div.classList.add("field");
        this.div.style.backgroundColor = 'transparent';
    }

    setData(data: { type: string, texture: string, name?: string, look?: string }) {
        this.data = data;
    }

    removeData() {
        this.data = undefined;
        this.div.style.backgroundColor = 'transparent';
        this.div.style.backgroundImage = 'none';
        this.div.style.backgroundSize = '0';
        this.div.style.backgroundPosition = '0';
        this.div.style.backgroundPositionY = '0';
        this.div.style.transform = "rotate(0deg)";
        this.lastActiveData = undefined;
        this.difficulty = undefined;
        this.alive = undefined;
        if (this.child) {
            this.child.removeData();
            this.removeChild();
        }
        if (this.parent) {
            this.parent.removeChild();
            this.removeParent();
        }
    }

    setSize(size: number) {
        this.div.style.width = size + "px";
        this.div.style.height = size + "px";
    }

    setImg(activeElement: mapCreatorActiveElement) {
        this.lastActiveData = activeElement;
        this.div.style.backgroundImage = `url(${activeElement.imgUrl})`;
        this.div.style.backgroundSize = `${this.div.clientWidth * activeElement.imgSizeX}px ${this.div.clientHeight * activeElement.imgSizeY}px`
        this.div.style.backgroundPosition = `-${this.div.clientWidth * activeElement.x}px`
        this.div.style.backgroundPositionY = `-${this.div.clientHeight * activeElement.y}px`
    }

    updateBackgroundSize() {
        if (this.lastActiveData) {
            this.div.style.backgroundSize = `${this.div.clientWidth * this.lastActiveData.imgSizeX}px ${this.div.clientHeight * this.lastActiveData.imgSizeY}px`
            this.div.style.backgroundPosition = `-${this.div.clientWidth * this.lastActiveData.x}px`
            this.div.style.backgroundPositionY = `-${this.div.clientHeight * this.lastActiveData.y}px`
        }
    }

    rotateBackground(deg: number) {
        this.div.style.transform = `rotate(${deg}deg)`;
    }

    setParent(field: Field) {
        this.parent = field;
    }

    setChild(field: Field) {
        if (this.child) {
            this.child.removeData();
            this.removeChild();
        }
        this.child = field;
    }

    removeParent() {
        this.parent = undefined;
    }

    removeChild() {
        this.child = undefined;
    }

    setAlive(bool: boolean) {
        this.alive = bool;
    }

    setDifficulty(diff: number) {
        this.difficulty = diff;
    }

}
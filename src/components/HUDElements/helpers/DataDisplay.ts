export default class DataDisplay {
    static instance = new this;
    div: HTMLDivElement;
    secondDiv: HTMLDivElement;
    constructor() {
        this.div = document.createElement('div');
        this.div.id = "DATA";
        document.body.appendChild(this.div);

        this.secondDiv = document.createElement('div');
        this.secondDiv.id = "DATA2";
        document.body.appendChild(this.secondDiv);

    }

    updateData(hp: number, ammo: number, points: number) {
        this.div.innerHTML = `HP: ${hp} <br> AMMO: ${ammo} <br> SCORE: ${points}`
    }

    updateData2(...args: any[]) {
        this.secondDiv.innerHTML = '';
        args.forEach((e, i) => this.secondDiv.innerHTML += `${i}: ${e}<br>`)

    }
}
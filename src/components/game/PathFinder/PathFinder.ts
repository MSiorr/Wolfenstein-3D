import { config } from "../../Config";
import DataDisplay from "../../HUDElements/helpers/DataDisplay";
import LevelCreator from "../LevelCreator";
import Object3D from "../objects/Object3D";
import Vector3 from "../Vector3";
import PathField from "./PathField";

export default class PathFinder {
    levelCreator: LevelCreator;
    blockObj: Object3D[];
    baseTab: PathField[][];
    constructor(levelCreator: LevelCreator) {
        this.levelCreator = levelCreator;
        this.blockObj = [];

        this.baseTab = [];
    }

    updateObjects(ob: Object3D[]) {
        this.blockObj = ob;
        this.prepareBaseTab();
    }

    clearCosts() {
        this.baseTab.map(x => x.map(z => z.clearCosts()));
    }

    prepareBaseTab() {
        this.baseTab = [];
        for (let x = 0; x < (this.levelCreator.mapSizeX + 2); x++) {
            this.baseTab[x] = [];
            for (let z = 0; z < (this.levelCreator.mapSizeZ + 2); z++) {
                this.baseTab[x][z] = new PathField(x, z);
            }
        }

        this.blockObj.forEach(e => {
            let pos = this.toBasePathPosition(e.pos);

            this.baseTab[pos.x][pos.z].block = true;
        })
    }

    toBasePathPosition(vec: Vector3) {
        return new Vector3(vec.x / config.wallSize, vec.y, vec.z / config.wallSize);
    }

    toAdvancePathPosition(vec: Vector3) {
        vec = vec.clone().add(new Vector3(config.wallSize / 2, 0, config.wallSize / 2))
        let newX = (vec.x - (vec.x % config.wallSize)) / config.wallSize;
        let newZ = (vec.z - (vec.z % config.wallSize)) / config.wallSize;

        return new Vector3(newX, 0, newZ);
    }

    private inGoodRange(x: number, z: number) {
        if (x >= 0 && x <= this.baseTab.length - 1 && z >= 0 && z <= this.baseTab[x].length - 1) {
            return true
        } else {
            return false
        }
    }

    findPath(from: Vector3, target: Vector3) {
        this.clearCosts();
        let startPos = this.toAdvancePathPosition(from);
        let endPos = this.toAdvancePathPosition(target);

        let start = this.baseTab.flat().find(e => e.x == startPos.x && e.z == startPos.z);
        let end = this.baseTab.flat().find(e => e.x == endPos.x && e.z == endPos.z);

        let openTab: Array<PathField> = [start];
        let closeTab = [];
        let targetFound = false;

        do {

            let list = openTab.sort((a, b) => a.fCost - b.fCost);
            let current = list[0];

            openTab.splice(openTab.indexOf(current), 1);
            closeTab.push(current);

            if (current == end) { targetFound = true; openTab = [] }
            else {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (this.inGoodRange(current.x + i, current.z + j) && (i == 0 || j == 0)) {
                            if (i == 0 && j == 0) { }
                            else {
                                let neigh = this.baseTab[current.x + i][current.z + j]

                                if (neigh && current && start && end && neigh.block == false && closeTab.includes(neigh) == false) {
                                    let neighGCost = neigh.advanceDistance(current) + current.gCost;
                                    let neighHCost = neigh.advanceDistance(end);
                                    let neighFCost = neighGCost + neighHCost;
                                    if (openTab.includes(neigh) == false || neigh.fCost > neighFCost || (neigh.fCost == neighFCost && neighHCost < neigh.hCost)) {
                                        neigh.setGCost(neighGCost)
                                        neigh.setHCost(neighHCost)
                                        neigh.calcFCost();
                                        neigh.parent = current;
                                        if (openTab.includes(neigh) == false) {
                                            openTab.push(neigh)
                                        }
                                    }

                                }
                            }
                        }
                    }
                }
            }
        } while (openTab.length > 0)

        let tab = [];
        let field = end;

        while (field && field.parent) {
            tab.push(field);
            field = field.parent;
        }
        tab = tab.reverse();
        return tab
    }


}
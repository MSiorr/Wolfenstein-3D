import { config } from "../Config";
import { mapCreatorActiveElement, mapCreatorBtnsData, MapCreatorFieldData, mapCreatorTextureData, MapData } from "../Interfaces";
import Main from "../Main";
import Field from "./Field";
//@ts-ignore
import textureData from '../../../textureData.json'
import Library from "../Library";
import Keyboard from "../game/Keyboard";

export default class MapCreator {
  parent: Main;
  div: HTMLDivElement
  root: HTMLElement;
  keyboard: Keyboard
  mapSizeDiv: HTMLDivElement;
  board: HTMLDivElement;
  activeElement?: mapCreatorActiveElement
  fieldsList: Field[][];
  boardArea?: HTMLDivElement
  currX: number;
  currY: number;
  mouseDown: boolean;
  rightDown: boolean;
  constructor(parent: Main, root: HTMLElement, keyboard: Keyboard) {
    this.parent = parent;
    this.root = root
    this.keyboard = keyboard;

    this.div = document.createElement("div");
    this.div.id = "mapCreator";
    this.div.classList.add("displayNone");

    this.mapSizeDiv = document.createElement("div");
    this.mapSizeDiv.id = "mapSizeDiv";

    this.board = document.createElement("div");
    this.board.id = "creatorBoard";

    this.div.appendChild(this.mapSizeDiv);
    this.div.appendChild(this.board);

    this.mapSizeSetting();

    this.mouseDown = false;
    this.rightDown = false;

    this.currX = 0;
    this.currY = 0;
    this.fieldsList = []


    root.appendChild(this.div);
  }

  mapSizeSetting() {
    let fromJson = document.createElement("button"); fromJson.innerHTML = "FROM JSON"; this.mapSizeDiv.appendChild(fromJson);
    let inputX = document.createElement("input"); inputX.placeholder = "x"; inputX.value = '10'; this.mapSizeDiv.appendChild(inputX);
    let inputY = document.createElement("input"); inputY.placeholder = "y"; inputY.value = '10'; this.mapSizeDiv.appendChild(inputY);
    let btn = document.createElement("button"); btn.innerHTML = "CREATE"; this.mapSizeDiv.appendChild(btn);

    btn.onclick = () => {
      let x = parseInt(inputX.value);
      let y = parseInt(inputY.value);

      this.createCreator(x, y)
    }

    fromJson.onclick = () => {
      this.importJSON();
    }

  }

  active() {
    this.div.classList.toggle("displayNone");
  }

  createCreator(x: number, y: number) {
    this.boardArea = undefined;
    this.board.innerHTML = '';
    this.fieldsList = [];
    this.currX = x;
    this.currY = y;
    let menu = document.createElement('div'); menu.id = "creatorMenu"; this.board.appendChild(menu);
    this.boardArea = document.createElement('div'); this.boardArea.id = "creatorBoardArea"; this.board.appendChild(this.boardArea);

    let topMenu = document.createElement("div"); topMenu.id = "topMenu"; menu.appendChild(topMenu);

    let el = document.createElement('div'); el.innerHTML = 'CREATE'; el.classList.add('menuElement'); topMenu.appendChild(el);
    el.style.backgroundColor = '#455A64'; el.style.color = '#FF5252';
    el.onclick = () => { this.createNewGameMap() }

    let el2 = document.createElement('div'); el2.innerHTML = 'TO JSON'; el2.classList.add('menuElement'); topMenu.appendChild(el2);
    el2.style.backgroundColor = '#455A64'; el2.style.color = '#FF5252';
    el2.onclick = () => { this.generateJSON() }

    this.createButtons(menu);


    let fieldsBoard = document.createElement('div'); fieldsBoard.id = "fieldsBoard";
    let fieldSize = Math.min((this.boardArea.clientHeight - 20) / y, (this.boardArea.clientWidth - 20) / x);

    window.onmouseup = (e) => {
      if (e.button == 0) {
        this.mouseDown = false;
      } else if (e.button == 2) {
        this.rightDown = false;
      }
    };

    for (let i = 1; i <= x; i++) {
      let column = document.createElement('div'); column.classList.add('boardColumn');
      this.fieldsList[i] = [];
      for (let j = 1; j <= y; j++) {
        let field = new Field(i, j);
        field.setSize(fieldSize);
        column.appendChild(field.div);
        this.fieldsList[i][j] = field;

        field.div.onmousedown = (e) => {
          if (e.button == 0) {
            this.mouseDown = true; this.clickAction(e, field);
          } else if (e.button == 2) {
            field.removeData();
            this.rightDown = true;
          }
        }

        field.div.onmouseover = (e) => {
          this.fieldsList.forEach(e => e.forEach(p => p.div.classList.remove('helperClassAfter')))
          if (this.mouseDown == true && this.activeElement) {
            this.clickAction(e, field);
            // this.fillField(field);
          } else if (this.rightDown) {
            field.removeData();
          }

          if (field.parent) {
            field.parent.div.classList.add('helperClassAfter');
          }
          if (field.child) {
            field.child.div.classList.add('helperClassAfter');
          }
        }

        field.div.onclick = () => {
          // this.clickAction(field);
        }

        field.div.oncontextmenu = (e) => {
          e.preventDefault();
          field.removeData();
        }
      }
      fieldsBoard.appendChild(column);
    }

    this.boardArea.appendChild(fieldsBoard);
  }

  clickAction(e: MouseEvent, field: Field) {
    if (this.keyboard.bools.ctrl.status) {
      if (field.data && (field.data.type == 'wall' || field.data.type == 'enemy' || field.data.type == 'player')) {
        this.createAdditionalMenu(e, field);
      }
    } else if (this.activeElement) {
      this.fillField(field);
    }
  }

  createButtons(menuDiv: HTMLDivElement) {
    let walls = Library.instance.data.graphicsData.WALL.pos;
    let obj = Library.instance.data.graphicsData.OBJECT.pos;

    let btnsData: mapCreatorBtnsData = { SPECIAL: [], CREATURES: [], WALLS: [], PICKABLES: [], FURNITURES: [] };
    for (let name in walls) {
      let imgData = Library.instance.data.graphicsData.WALL;
      let type = name.indexOf('door') != 0 ? 'wall' : 'door'
      btnsData.WALLS.push({ type: type, name: name, x: walls[name].x, y: walls[name].y, imgUrl: Library.instance.graphics.WALL.src, imgX: imgData.sizeX, imgY: imgData.sizeY });
    }
    for (let name in obj) {
      let imgData = Library.instance.data.graphicsData.OBJECT;
      if (name.indexOf('pickable') == -1) {
        btnsData.FURNITURES.push({ type: 'furniture', name: name, x: obj[name].x, y: obj[name].y, imgUrl: Library.instance.graphics.OBJECT.src, imgX: imgData.sizeX, imgY: imgData.sizeY })
      } else {
        btnsData.PICKABLES.push({ type: 'pickable', name: name, x: obj[name].x, y: obj[name].y, imgUrl: Library.instance.graphics.OBJECT.src, imgX: imgData.sizeX, imgY: imgData.sizeY })
      }
    }
    btnsData.CREATURES.push({
      type: 'player',
      name: Object.keys(Library.instance.data.graphicsData.PLAYER.pos)[0],
      x: 0,
      y: 0,
      imgUrl: Library.instance.graphics.PLAYER.src,
      imgX: Library.instance.data.graphicsData.PLAYER.sizeX,
      imgY: Library.instance.data.graphicsData.PLAYER.sizeY,
    })
    btnsData.CREATURES.push({
      type: 'enemy',
      name: Object.keys(Library.instance.data.graphicsData.ENEMY.pos)[0],
      x: 0,
      y: 0,
      imgUrl: Library.instance.graphics.ENEMY.src,
      imgX: Library.instance.data.graphicsData.ENEMY.sizeX,
      imgY: Library.instance.data.graphicsData.ENEMY.sizeY,
    })

    btnsData.SPECIAL.push({
      type: 'end',
      name: 'end_game',
      x: Library.instance.data.graphicsData.MAPCREATOR.pos['end_game'].x,
      y: Library.instance.data.graphicsData.MAPCREATOR.pos['end_game'].y,
      imgUrl: Library.instance.graphics.MAPCREATOR.src,
      imgX: Library.instance.data.graphicsData.MAPCREATOR.sizeX,
      imgY: Library.instance.data.graphicsData.MAPCREATOR.sizeY,
    })

    for (let type in btnsData) {

      let groupTitle = document.createElement('div'); groupTitle.classList.add('mapBtnGroupTitle'); groupTitle.innerHTML = type; menuDiv.appendChild(groupTitle);
      let btnsGroup = document.createElement('div'); btnsGroup.classList.add('menuBtnGroup'); menuDiv.appendChild(btnsGroup);
      let tabData = btnsData[type as keyof mapCreatorBtnsData];

      tabData.forEach(btn => {
        let btnDiv = document.createElement('div'); btnDiv.classList.add('smallMenuBtn'); btnsGroup.appendChild(btnDiv);
        btnDiv.style.backgroundImage = `url(${btn.imgUrl})`;
        btnDiv.style.backgroundSize = `${btnDiv.clientWidth * btn.imgX}px ${btnDiv.clientHeight * btn.imgY}px`
        btnDiv.style.backgroundPosition = `-${btnDiv.clientWidth * btn.x}px`
        btnDiv.style.backgroundPositionY = `-${btnDiv.clientHeight * btn.y}px`

        btnDiv.onclick = () => {
          this.activeElement = {
            type: btn.type,
            texture: btn.name,
            imgUrl: btn.imgUrl,
            imgSizeX: btn.imgX,
            imgSizeY: btn.imgY,
            x: btn.x,
            y: btn.y,
            name: btn.type == "pickable" ? this.getPickableName(btn.name) : null,
            look: btn.type == "enemy" || btn.type == 'player' ? "DOWN" : null,
            alive: btn.type == 'enemy' ? true : null,
            difficulty: btn.type == 'enemy' ? 1 : null
          }
        }


      })
    }
  }

  getPickableName(textureName: string) {
    switch (textureName) {
      case "pickable_clip": return 'CLIP'
      case "pickable_dog_food": return 'DOG_FOOD'
      case "pickable_blood": return 'BLOOD'
      case "pickable_cross": return 'CROSS'
      case "pickable_chalice": return 'CHALICE'
      case "pickable_chest": return 'CHEST'
      case "pickable_crown": return 'CROWN'
      case "pickable_chicken_meal": return 'CHICKEN_MEAL'
      case "pickable_extra_life": return 'EXTRA_LIFE'
      case "pickable_bloody_skeleton": return 'BLOODY_SKELETON'
      case "pickable_key_silver": return 'KEY_SILVER'
      case "pickable_key_gold": return 'KEY_GOLD'
      case "pickable_first_aid_kit": return 'FIRST_AID_KIT'
      case "pickable_machinegun": return 'MACHINEGUN'
      case "pickable_chaingun": return 'CHAINGUN'
    }
  }

  fillField(field: Field) {
    if (this.activeElement.type == 'player' && this.inFields('player')) { return; }
    // if ((this.activeElement.type != 'player' || !this.inFields('player')) || (this.activeElement.type != 'end' && !this.inFields('end'))) || ( )) {
    field.setData({
      type: this.activeElement.type,
      texture: this.activeElement.texture,
      name: this.activeElement.name,
      look: this.activeElement.look
    })
    field.setImg(this.activeElement)
    if (this.activeElement.type == 'target') {
      field.setParent(this.activeElement.from)
      this.activeElement.from.setChild(field)
      this.activeElement = undefined;
    }
    // }
  }

  inFields(type: string) {
    return this.fieldsList.flat().filter(e => e.data && e.data.type == type).length != 0;
  }

  createNewGameMap() {
    let mapData = this.toMapObject();

    if (mapData != null) {
      this.board.innerHTML = ''
      this.active();
      this.parent.creatorActive = false;
      this.parent.createLevel(JSON.stringify(mapData))
    } else {
      alert("NIE STWORZONO PLAYERA")
    }

  }

  updateFieldsSize() {
    let fieldSize = Math.min((this.boardArea.clientHeight - 20) / this.currY, (this.boardArea.clientWidth - 20) / this.currX);
    this.fieldsList.flat().forEach(e => {
      e.setSize(fieldSize);
      e.updateBackgroundSize();
    })
  }

  toMapObject() {
    let array: MapCreatorFieldData[] = [];
    let playerFound = false

    this.fieldsList.flat().forEach(e => {
      if (e.data) {
        if (e.data.type == "player") playerFound = true
        if (e.data.type != 'target') {
          array.push({
            x: e.x,
            z: e.y,
            type: e.data.type,
            texture: e.data.texture,
            name: e.data.name ? e.data.name : undefined,
            look: e.data.look ? e.data.look : undefined,
            goTo: e.child ? { x: e.child.x, z: e.child.y } : undefined,
            alive: e.alive != undefined ? e.alive : undefined,
            difficulty: e.difficulty != undefined ? e.difficulty : undefined
          })
        }
      }
    })

    array = [...array.filter(e => e.type == 'wall'), ...array.filter(e => e.type == "door"), ...array.filter(e => e.type != 'wall' && e.type != "door")];

    let data: MapData = {
      sizeX: this.currX,
      sizeY: this.currY,
      objectData: array
    };

    return playerFound ? data : null;
  }

  generateJSON() {
    let mapData = this.toMapObject();

    if (mapData != null) {
      let name = prompt('Podaj nazwę pliku');
      name = name == '' ? 'level' : name;

      let jsonData = JSON.stringify(mapData);
      let blob = new Blob([jsonData], { type: "application/json" });
      let url = URL.createObjectURL(blob);

      let a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    } else {
      alert("NIE STWORZONO PLAYERA")
    }
  }

  importJSON() {
    let reader = new FileReader();
    reader.onload = (e) => {
      //@ts-ignore
      let newData = JSON.parse(e.currentTarget.result);
      this.generateMapFromJSON(newData)
    }

    let fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.onchange = () => {
      let file = fileInput.files[0];
      reader.readAsText(file, 'utf-8');
    }

    fileInput.click();
  }

  generateMapFromJSON(data: MapData) {
    this.createCreator(data.sizeX, data.sizeY)

    for (let item in data.objectData) {
      let currItem = data.objectData[item];
      let imgData = this.getImgInfo(currItem.type);

      let field = this.fieldsList.flat().find(e => e.x == currItem.x && e.y == currItem.z);
      if (field) {

        field.setData({
          type: currItem.type,
          texture: currItem.texture,
          name: currItem.name ? currItem.name : undefined,
          look: currItem.look ? currItem.look : undefined,
        })

        if (currItem.goTo) {
          let target = this.fieldsList.flat().find(e => e.x == currItem.goTo.x && e.y == currItem.goTo.z);
          if (target) {
            this.setSpecialTarget(field);
            this.fillField(target);
          }
        }

        if (currItem.alive != undefined) {
          this.changeAliveStatus(field, currItem.alive)
        }

        if (currItem.difficulty != undefined) {
          this.changeDifficulty(field, currItem.difficulty)
        }

        if (currItem.look) {
          this.changeDirection(field, currItem.look);
        }

        field.setImg({
          type: currItem.type,
          texture: currItem.texture,
          imgUrl: imgData.imgURL,
          imgSizeX: imgData.imgData.sizeX,
          imgSizeY: imgData.imgData.sizeY,
          x: imgData.imgData.pos[currItem.texture].x,
          y: imgData.imgData.pos[currItem.texture].y,
          name: currItem.name ? currItem.name : undefined,
          difficulty: null,
          alive: null
        })
      }
    }

  }

  getImgInfo(type: string) {
    switch (type) {
      case 'wall': {
        return { imgURL: Library.instance.graphics.WALL.src, imgData: Library.instance.data.graphicsData.WALL }
      }
      case 'door': {
        return { imgURL: Library.instance.graphics.WALL.src, imgData: Library.instance.data.graphicsData.WALL }
      }
      case 'player': {
        return { imgURL: Library.instance.graphics.PLAYER.src, imgData: Library.instance.data.graphicsData.PLAYER }
      }
      case 'enemy': {
        return { imgURL: Library.instance.graphics.ENEMY.src, imgData: Library.instance.data.graphicsData.ENEMY }
      }
      case 'pickable': {
        return { imgURL: Library.instance.graphics.OBJECT.src, imgData: Library.instance.data.graphicsData.OBJECT }
      }
      case 'furniture': {
        return { imgURL: Library.instance.graphics.OBJECT.src, imgData: Library.instance.data.graphicsData.OBJECT }
      }
      case 'end': {
        return { imgURL: Library.instance.graphics.MAPCREATOR.src, imgData: Library.instance.data.graphicsData.MAPCREATOR }
      }
    }
  }

  createAdditionalMenu(e: MouseEvent, field: Field) {
    let addMenu = document.getElementById('additionalMenu');
    if (addMenu) this.removeAddMenu(addMenu);

    let additionalMenu = document.createElement('div'); additionalMenu.id = "additionalMenu"; this.boardArea.appendChild(additionalMenu);
    let menuTitle = document.createElement('div'); menuTitle.id = 'additionalMenuTitle'; menuTitle.innerHTML = field.data.type.toUpperCase(); additionalMenu.appendChild(menuTitle);
    let closeBtn = document.createElement('div'); closeBtn.id = 'additionalMenuClose'; closeBtn.innerHTML = "X"; menuTitle.appendChild(closeBtn);
    let menuContext = document.createElement('div'); menuContext.id = 'additionalMenuContext'; additionalMenu.appendChild(menuContext);
    if (field.data.type != 'wall') {
      let direction = document.createElement('select'); direction.id = 'enemyDirection'; menuContext.appendChild(direction);
      ['UP', "LEFT", "DOWN", "RIGHT"].forEach(e => {
        let option = document.createElement('option'); option.value = e; option.innerHTML = e; field.data.look == e ? option.selected = true : null; direction.appendChild(option);
      })
      direction.onchange = () => { this.changeDirection(field, direction.value) }
    }
    if (field.data.type == 'enemy') {
      let alive = document.createElement('select'); alive.id = "enemyAlive"; menuContext.appendChild(alive);
      ['TRUE', 'FALSE'].forEach(e => {
        let option = document.createElement('option'); option.value = e; option.innerHTML = e; field.alive == false && e == 'FALSE' ? option.selected = true : null; alive.appendChild(option)
      })
      alive.onchange = () => { this.changeAliveStatus(field, alive.value == "TRUE") }
      let difficulty = document.createElement('select'); difficulty.id = 'enemySpawnDiff'; menuContext.appendChild(difficulty);
      [1, 2, 3, 4].forEach(e => {
        let option = document.createElement('option'); option.value = e.toString(); option.innerHTML = e.toString(); field.difficulty && e == field.difficulty ? option.selected = true : null; difficulty.appendChild(option);
      })
      difficulty.onchange = () => { this.changeDifficulty(field, parseInt(difficulty.value)) }
    }
    if (field.data.type != 'player') {
      let target = document.createElement('button'); target.id = 'additionalMenuTargetBtn'; target.innerHTML = "SET TARGET"; menuContext.appendChild(target);
      target.onclick = () => { this.setSpecialTarget(field, additionalMenu) }
    }

    closeBtn.onclick = () => {
      this.removeAddMenu(additionalMenu);
    }
  }

  removeAddMenu(menu: HTMLElement) {
    this.boardArea.removeChild(menu);
  }

  setSpecialTarget(field: Field, menu?: HTMLElement) {
    if (menu) this.removeAddMenu(menu);
    this.activeElement = {
      type: 'target',
      texture: field.data.type == 'wall' ? 'wall_target' : 'enemy_target',
      imgUrl: Library.instance.graphics.MAPCREATOR.src,
      imgSizeX: Library.instance.data.graphicsData.MAPCREATOR.sizeX,
      imgSizeY: Library.instance.data.graphicsData.MAPCREATOR.sizeY,
      x: field.data.type == 'wall' ? 1 : 0,
      y: 0,
      from: field,
      difficulty: undefined,
      alive: undefined
    }
  }

  changeDirection(field: Field, dir: string) {
    field.data.look = dir;
    if (dir == 'DOWN') { field.rotateBackground(0) }
    else if (dir == 'LEFT') { field.rotateBackground(90) }
    else if (dir == 'UP') { field.rotateBackground(180) }
    else { field.rotateBackground(270) };
  }

  changeDifficulty(field: Field, diff: number) {
    field.setDifficulty(diff);
  }

  changeAliveStatus(field: Field, bool: boolean) {
    field.setAlive(bool);
  }
}
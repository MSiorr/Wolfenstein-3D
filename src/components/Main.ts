import Camera from './game/Camera';
import Keyboard from './game/Keyboard';
import Library from './Library';
import Scene from './game/Scene';
import MapCreator from './mapCreator/MapCreator';
import LevelCreator from './game/LevelCreator';
//@ts-ignore
// import defaultMap from '../levels/Level1.json'
// import defaultMap from '../defaultMap3.json'
import Scene2D from './HUDElements/Scene2D';
import Crosshair from './HUDElements/helpers/Crosshair';
import Vector3 from './game/Vector3';
import BoxLine from './game/boxHelper/BoxLine';
import Raycaster from './game/Raycaster';
import BoxPoint from './game/boxHelper/BoxPoint';
import AnimationManager from './game/AnimationManager';
import Object3D from './game/objects/Object3D';
import Pickable from './game/objects/Pickable';
import DataDisplay from './HUDElements/helpers/DataDisplay';
import { AudioNames, HUDStatus, MenuScreens, Scene2DColors, Scene2DStatus } from './Config';
import MyAudio from './MyAudio';

export default class Main {
  root: HTMLElement;
  scene: Scene;
  camera: Camera;

  timeThen: number;
  animationFrame: number;
  library: Library;
  keyboard: Keyboard;

  raycaster: Raycaster
  animationManager: AnimationManager

  mapCreator: MapCreator;
  creatorActive: boolean;
  levelCreator: LevelCreator;
  Scene2D: Scene2D;

  inRestartProcess: boolean;
  levelCreated: boolean;

  constructor(root: HTMLElement) {
    this.root = root;
    this.library = new Library();
    this.inRestartProcess = false;

    Library.instance.Load().then(() => {

      this.camera = new Camera();
      this.scene = new Scene(this.root, this.camera);

      this.Scene2D = new Scene2D(this, this.root, this.scene);

      this.timeThen = 0;

      this.bodyEvents();
      this.creatorActive = false;
      this.levelCreated = false;

      this.scene.startProgram(Library.instance);
      this.animationManager = new AnimationManager(Library.instance.data)
      this.levelCreator = new LevelCreator(this.scene, this.camera, this.animationManager);
      this.keyboard = new Keyboard(this.camera, this.animationManager, this.levelCreator, this.Scene2D);
      this.mapCreator = new MapCreator(this, document.body, this.keyboard);
      this.mapCreateBtn();
      this.animationFrame = requestAnimationFrame(this.render.bind(this));
    });
  }

  bodyEvents() {
    window.onresize = (e) => {
      this.Scene2D.fixSize(document.body.clientWidth, document.body.clientHeight);
      this.Scene2D.Menu.lettersPrepared = false;
      this.Scene2D.HUD.lettersPrepared = false;
      if (this.creatorActive) {
        this.mapCreator.updateFieldsSize();
      }
    };
  }

  async createLevel(data = JSON.stringify(Library.instance.levels.level1), newGame: boolean = false) {
    this.levelCreated = false;
    console.log("NEW LEVEL CREATE");

    if (this.animationFrame) { cancelAnimationFrame(this.animationFrame); }
    await this.levelCreator.createLvl(data, newGame)
    this.levelCreated = true;
  }

  render(time = 0) {
    if (this.creatorActive == false) {
      let deltaTime = time * 0.001 - this.timeThen;
      this.timeThen = time * 0.001;

      this.Scene2D.render(deltaTime);

      this.scene.drawScene(deltaTime);

      if ((this.camera.dead == false && this.Scene2D.deathCam == false) || this.Scene2D.sceneStatus == Scene2DStatus.MENU) {

        this.keyboard.update(deltaTime, this.levelCreator.objects);
        if (this.Scene2D.sceneStatus == Scene2DStatus.GAME && this.levelCreated && this.Scene2D.smoothAction == false && this.Scene2D.HUD.status == HUDStatus.GAMEPLAY) {
          this.levelCreator.objects.doors.forEach(e => e.update(deltaTime));
          this.levelCreator.objects.pickables.forEach(e => {
            e.toDelete ? this.removePickable(e) : e.update(this.camera);
          })
          this.levelCreator.objects.enemies.forEach(e => {
            e.update(deltaTime, this.camera);
          })
          this.levelCreator.objects.furnitures.forEach(e => {
            e.update(deltaTime, this.camera);
          })
          this.levelCreator.objects.walls.forEach(e => e.update(deltaTime))

          this.levelCreator.objects.end.forEach(e => e.update(deltaTime, this.camera));

          this.onCameraHit();

          this.animationManager.update();
        }
      } else {
        if (this.inRestartProcess == false && this.camera.dead == true) {
          this.onDeadCamera(deltaTime);
        }
      }

    }

    this.animationFrame = requestAnimationFrame(this.render.bind(this));
  }

  onDeadCamera(deltaTime: number) {
    let look = this.camera.smoothLookAt(this.camera.killer, deltaTime);
    if (look) {
      setTimeout(e => {
        if (this.camera.dead == true) {
          this.Scene2D.enableDeathCam();
        }
      }, 1000)
    } else {
      this.Scene2D.setColorScreenRender(Scene2DColors.HIT, 1)
    }
  }

  removePickable(pick: Pickable) {
    this.levelCreator.objects.pickables = this.levelCreator.objects.pickables.filter(e => e != pick);
    this.scene.remove(pick);
    this.Scene2D.setColorScreenRender(Scene2DColors.PICK)
  }

  onCameraHit() {
    if (this.camera.hitted) {
      this.camera.hitted = false;
      this.Scene2D.setColorScreenRender(Scene2DColors.HIT);
    }
  }

  mapCreateBtn() {
    let btn = document.createElement('div');
    btn.innerHTML = "MAP CREATOR";
    btn.id = "mapCreatorBtn";
    btn.onclick = () => {
      this.mapCreator.active();
      this.creatorActive = !this.creatorActive;
    }

    document.body.appendChild(btn);
  }

  radToDeg(rad: number) {
    return rad * (180 / Math.PI)
  }

  restartLvl() {
    if (this.inRestartProcess == false) {
      this.inRestartProcess = true


      if (this.camera.lives > 0) {
        setTimeout(() => {
          this.levelCreator.createLvl(JSON.stringify(Library.instance.levels.level1))
          this.Scene2D.disableDeathCam();
        }, 1000)
      } else {
        this.Scene2D.enableSmoothAction(() => {
          this.camera.dead = false;
          this.Scene2D.disableDeathCam();
          this.camera.refresh();
          this.Scene2D.Menu.enableSpecial = false;
          this.Scene2D.Menu.lettersPrepared = false;
          this.Scene2D.sceneStatus = Scene2DStatus.MENU;
          this.Scene2D.Menu.screenID = MenuScreens.OPTIONS;
          this.Scene2D.deathCam = false;
          this.Scene2D.randomRedPixels = [];
          MyAudio.instance.stopAll();
          MyAudio.instance.playAudio(AudioNames.THEME_MENU);
        });
      }
    }
  }
}

import Camera from './Camera';
import { config } from '../Config';
import Wall from './objects/Wall';
import Enemy from './objects/Enemy';
import { Graphics, Locations, Shaders } from '../Interfaces';
import Library from '../Library';
import Matrix4 from './Matrix4';
import Vector3 from './Vector3';
import Object3D from './objects/Object3D';
import Crosshair from '../HUDElements/helpers/Crosshair';
import Weapon from './objects/Weapon';
import Pickable from './objects/Pickable';
import Furniture from './objects/Furniture';

export interface Textures {
  [index: string]: WebGLTexture;
}

export default class Scene {
  scene: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  locations: Locations;
  items: Object3D[];
  library: Library;
  camera: Camera;
  texture: WebGLTexture;
  textures: Textures;
  crosshair: Crosshair;
  positionBuffer: WebGLBuffer;
  texcoordBuffer: WebGLBuffer;
  marginHorizontal: number;
  marginVertical: number;
  goodWidth: number;
  goodHeight: number;
  lastTexture: string;
  lastTexcoords: Float32Array;
  constructor(root: HTMLElement, camera: Camera) {
    this.scene = document.createElement('canvas');
    this.scene.id = 'scene';
    // root.appendChild(this.scene);

    this.camera = camera;

    this.gl = this.scene.getContext('webgl', { antialias: false });
    this.program;
    this.locations = { attributes: {}, uniforms: {} };
    this.items = [];
    this.textures = {};
    this.library;

    this.marginHorizontal = 0;
    this.marginVertical = 0;
    this.goodWidth = 0;
    this.goodHeight = 0;

    this.crosshair = new Crosshair();

    this.lastTexture = null;
    this.lastTexcoords = null

    this.updateCamera();
  }

  add(item: Object3D) {
    this.items.push(item);
    this.items = this.items.sort((a, b) => {
      if (a.texture > b.texture) {
        return -1;
      }
      if (b.texture > a.texture) {
        return 1;
      }
      return 0;
    })

  }

  remove(item: Object3D) {
    this.items = this.items.filter(e => e != item);
  }

  clear() {
    this.items = [];
  }

  startProgram(library: Library) {
    this.library = library;
    this.updateCamera();

    let vertexShader = this.createShader(this.gl, this.gl.VERTEX_SHADER, this.library.shaders.vertShader);
    let fragShader = this.createShader(this.gl, this.gl.FRAGMENT_SHADER, this.library.shaders.fragShader);

    this.program = this.createProgram(this.gl, vertexShader, fragShader);

    this.positionBuffer = this.gl.createBuffer();
    this.texcoordBuffer = this.gl.createBuffer();

    this.getLocations();
    this.CreateTextures();
  }


  drawScene(deltaTime: number) {
    this.applyBaseSettings();
    let viewProjectionMatrix = this.CalcViewProjectionMatrix();

    this.lastTexture = null;
    let lastPosArray: Float32Array = null;

    this.items.forEach((e, i) => {
      if (this.camera.inRenderingRange(e) || e instanceof Weapon) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        if (!this.FloatArrayIsEval(e.posArray, lastPosArray)) {
          this.gl.bufferData(this.gl.ARRAY_BUFFER, e.posArray, this.gl.STATIC_DRAW);
          lastPosArray = e.posArray.slice(0);
        }

        this.gl.vertexAttribPointer(this.locations.attributes['a_position'], 3, this.gl.FLOAT, false, 0, 0);

        this.prepareImg(e, this.texcoordBuffer);

        let matrix;
        if (e instanceof Weapon) {
          matrix = this.camera.projectionMatrix.clone();
        } else {
          matrix = viewProjectionMatrix.clone();
        }
        matrix.translate(e.pos.x, e.pos.y, e.pos.z);
        if (e instanceof Enemy || e instanceof Pickable || e instanceof Furniture) {
          matrix.yRotate(this.camera.rotation.y)
        } else {
          matrix.yRotate(e.rotation.y);
        }
        matrix.xRotate(e.rotation.x);
        matrix.zRotate(e.rotation.z);
        matrix.scale(e.scale.x, e.scale.y, e.scale.z);

        this.gl.uniformMatrix4fv(this.locations.uniforms['u_matrix'], false, matrix.matrix);

        this.gl.uniform1i(this.locations.uniforms['u_texture'], 0);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, e.count);
      }
    });
  }

  private prepareImg(element: Object3D, buffer: WebGLBuffer) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    if (element.texture != this.lastTexture || !this.FloatArrayIsEval(element.textureArray, this.lastTexcoords)) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[element.texture]);
      this.lastTexture = element.texture
      this.lastTexcoords = element.textureArray.slice(0);
      this.gl.vertexAttribPointer(this.locations.attributes['a_texcoord'], 2, this.gl.FLOAT, false, 0, 0);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        element.textureArray,
        this.gl.STATIC_DRAW
      );
    }

  }

  private CreateTextures() {
    for (let key in this.library.graphics) {

      let image = this.library.graphics[key];
      let texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);

      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

      if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
      }

      this.textures[key] = texture;
    }
  }


  private CalcViewProjectionMatrix(): Matrix4 {
    let cameraMatrix = new Matrix4();

    cameraMatrix.translate(
      this.camera.pos.x,
      this.camera.pos.y,
      this.camera.pos.z
    );

    cameraMatrix.yRotate(this.camera.rotation.y);

    cameraMatrix.inverse();

    return this.camera.projectionMatrix.clone().multiply(cameraMatrix);
  }

  updateCamera() {
    if (this.camera && this.gl) {
      this.camera.updateProjectionMatrix(this.scene.width / this.scene.height);
    }
  }

  private getLocations() {
    config.attributes.forEach(
      (e: string) =>
      (this.locations.attributes[e] = this.gl.getAttribLocation(
        this.program,
        e
      ))
    );
    config.uniforms.forEach(
      (e: string) =>
      (this.locations.uniforms[e] = this.gl.getUniformLocation(
        this.program,
        e
      ))
    );

    this.gl.enableVertexAttribArray(this.locations.attributes['a_position']);
    this.gl.enableVertexAttribArray(this.locations.attributes['a_texcoord']);
  }


  private applyBaseSettings() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.useProgram(this.program);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  private createShader(gl: WebGLRenderingContext, type: number, source: string) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  private createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  private isPowerOf2(val: number): boolean {
    return (val & (val - 1)) == 0;
  }

  private FloatArrayIsEval(array1: Float32Array, array2: Float32Array) {
    if (array1 == null || array2 == null) { return false }
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] != array2[i]) { return false }
    }
    return true
  }
}

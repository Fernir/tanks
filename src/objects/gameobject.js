import * as mat4 from 'gl-matrix/src/gl-matrix/mat4';
import {mat4Rotate, mat4Scal, mat4Trans} from './../game/helpers/helpers';
import game from './../game/game';
import Vector from './../game/helpers/vector';
import Shader, {vertexShader} from './../game/helpers/shader';
import wallsManager from './../game/level/levelDraw';
import Texture from './../game/helpers/texture';
import unitManager from './managers/unitmanager';

export default class GameObject {
  pos = new Vector();
  angle = 0;
  rotate = 0;
  guid = 0;
  speed = 0;
  shader = null;
  vert = null;
  image = new Texture();
  imageShadow = new Texture();
  size = new Vector(1, 1);
  vel = new Vector();
  direction = new Vector();
  shadowPos = new Vector();

  frag = `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform sampler2D tex;
    uniform sampler2D texVisible;
    uniform sampler2D texVisibleRiver;
    varying vec4 texcoord;

    void main()
    {
        vec4 col = texture2D(tex, texcoord.xy);
        vec4 visible = texture2D(texVisible, texcoord.zw);
        vec4 visibleRiver = texture2D(texVisibleRiver, texcoord.zw);
        
        float shadow = clamp((1.0 - (visible.g + visibleRiver.g)) * 6.0 - 3.0, 0.5, 1.0);
        float contur = abs(col.a * 2.0 - 1.0);
        
        col.rgb *= (1.0 - (visible.r + visibleRiver.r)) * shadow * contur * col.a;
        gl_FragColor = col;
    }
  `;

  fragShadow = `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec4 texcoord;
    uniform sampler2D tex;
    uniform sampler2D texVisible;

    void main()
    {
        float alpha = texture2D(tex, texcoord.xy).a;
        vec4 visible = texture2D(texVisible, texcoord.zw);
        float shadow = clamp((1.0 - visible.b) * 6.0 - 3.0, 0.5, 1.0);
        shadow = (shadow - 0.5) * 2.0;;
        alpha *= 0.5 * shadow;
        gl_FragColor = vec4(1.0 - alpha);
    }`;


  constructor(x = 0, y = 0, angle = 0, speed = 1) {
    this.pos.set(x, y);
    this.speed = speed;
    this.angle = angle;

    this.vert = vertexShader(true, false, 'gl_Position');

    this.shader = new Shader(this.vert, this.frag, [
      'matPos', 'tex', 'texVisible', 'texVisibleRiver'
    ]);

    this.shaderShadow = new Shader(this.vert, this.fragShadow, [
      'matPos', 'tex', 'texVisible'
    ]);
  }

  collide = (dyn, size) => {
    const minDist = (this.size.x + size);

    const dx = dyn.pos.x - this.pos.x;
    const dy = dyn.pos.y - this.pos.y;
    const len2 = (dx * dx) + (dy * dy);

    return len2 < minDist * minDist ? new Vector(dx, dy) : null;
  };

  collideObjects = () => {
    let res = null;

    unitManager.objects.forEach((unit) => {
      if (unit !== this) {
        const norm = this.collide(unit, unit.size.x);

        if (norm !== null) {
          norm.normalize();

          const dot = norm.dot(this.vel);
          if (dot !== 0) {
            const delta = norm.mul(dot);
            dot > 0 ? this.pos.sub(delta) : this.pos.add(delta);
          }
          res = unit;
        }
      }
    });

    return res;
  };

  cameraCulling = (offsetX = 32, offsetTop = 22, offsetBottom = -15) => {
    const objectRadius = this.size.length() * 0.5;
    const vec = this.pos.clone().sub(game.camera.pos).rotate(game.camera.angle);

    return Math.abs(vec.x) - objectRadius > offsetX || (vec.y - objectRadius > offsetTop || vec.y + objectRadius < offsetBottom);
  };

  calculate = () => {};

  draw = () => {};

  render = (camera, image, shader, pos, size, angle) => {
    if (this.cameraCulling()) {
      return;
    }

    shader.use();
    shader.texture(shader.tex, image.getId(), 0);
    shader.texture(shader.texVisible, wallsManager.texVisible_id, 1);
    shader.texture(shader.texVisibleRiver, wallsManager.texriver_id, 2);

    const aspect = game.canvas.width / game.canvas.height;
    const hRatio = 16 / 9;
    const koef = 1 / 12;

    const matPos = mat4.create();
    mat4Trans(matPos, [0, -game.tankOffset]);

    if (aspect < hRatio) {
      mat4Scal(matPos, [koef / aspect, koef]);
    } else {
      mat4Scal(matPos, [koef / hRatio, koef * (aspect / hRatio)]);
    }

    const mat = mat4.create();
    const vec = pos.clone().sub(camera.pos).div(game.zPos);
    mat4Trans(mat, [vec.x, -vec.y]);
    const rotate = mat4.create();
    mat4Rotate(rotate, -game.camera.angle);
    mat4.mul(mat, rotate, mat);
    mat4.mul(matPos, matPos, mat);

    mat4Rotate(matPos, angle);
    mat4Scal(matPos, size);
    shader.matrix(shader.matPos, matPos);

    game.gl.drawArrays(game.gl.TRIANGLE_STRIP, 0, 4);
  };
}

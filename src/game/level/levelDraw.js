import * as mat4 from 'gl-matrix/src/gl-matrix/mat4';
import game from '../game';

import unitManager from '../../objects/managers/unitmanager';
import Shader, {vertexShader} from '../helpers/shader';
import Buffer, {createTexture, loadImage} from '../helpers/buffer';
import {mat4Rotate, mat4Scal, mat4Trans} from '../helpers/helpers';
import Texture from '../helpers/texture';
import Framebuffer from '../helpers/framebuffer';
import Vector2D from '../helpers/vector';

class LevelDraw {
  canvas = null;
  level = [];
  size = 0;
  shader = null;
  shaderRiver = null;
  shaderWave = null;
  shaderMinimap = null;
  vert = vertexShader(false, true, 'position');
  vert_simple = vertexShader(true, false);
  tex_ground1 = null;
  tex_ground2 = null;
  tex_ground3 = null;
  tex_noise = null;
  tex_river = null;
  tex_wall = null;
  mat_tex = null;
  tex_velocity = null;

  mask = null;
  shadow = null;
  texture = null;
  fboVisible = null;
  shaderVisible = null;
  texVisible_id = null;
  fboRiver = null;
  fboWave = null;

  fragLevel = `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform sampler2D levelmap;
    uniform sampler2D tex_river;
    uniform sampler2D tex_ground_1;
    uniform sampler2D tex_ground_2;
    uniform sampler2D tex_ground_3;
    uniform sampler2D tex_wall;
    uniform sampler2D tex_visible;
    uniform vec4 scale;
    varying vec4 texcoord;

    void main()
    {
        vec4 level = texture2D(levelmap, texcoord.xy);
        vec4 river = texture2D(tex_river, texcoord.zw);
        vec4 visible = texture2D(tex_visible, texcoord.zw);
        vec4 ground_1 = texture2D(tex_ground_1, texcoord.xy * scale.xy);
        vec4 ground_2 = texture2D(tex_ground_2, texcoord.xy * scale.xy);
        vec4 ground_3 = texture2D(tex_ground_3, texcoord.xy * scale.xy);
        vec4 wall = texture2D(tex_wall, texcoord.xy * scale.xy);

        float shadow = clamp((1.0 - visible.g) * 6.0 - 3.0, 0.5, 1.0);

        float ground_mask = clamp((ground_2.a - level.b + 0.2) * 2.5, 0.0, 1.0);
        vec4 ground = mix(ground_2, ground_1, ground_mask);
        
        ground_mask = clamp((ground_3.a - river.a + 0.3) * 2.5, 0.0, 1.0);
        ground = mix(ground_3, ground_2, ground_mask);
        
        ground = mix(ground, river, river.a - 0.2) * shadow;
        wall.rgb *= 2.0 * (0.9 - level.g) * shadow;
        vec2 level_mask = clamp((level.rg * 2.0 - 1.0) * 30.0, 0.0, 1.0);
        float visible_mask = 1.0 - visible.r;
        gl_FragColor = vec4(visible_mask * mix(ground.rgb, wall.rgb, level_mask.g), 1.0);
    }
`;

  vertVisible = (offset) => `
    attribute vec4 position;
    uniform mat4 mat_tex;
    varying vec4 texcoord;
    
    void main(void) 
    {
        gl_Position = position;
        texcoord = mat_tex * position;
        vec4 tc = mat_tex * vec4(0.0, -${offset}, 0.0, 1.0);
        texcoord.zw = tc.xy;
    }`;

  fragVisible = `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec4 texcoord;
    uniform sampler2D levelmap;
    //uniform sampler2D shadow;
    
    void main(void) 
    {
        vec2 d = (texcoord.zw - texcoord.xy) / 12.0;
        float res = 0.0;
        const float min_val = 0.6;
        vec4 level = texture2D(levelmap, texcoord.xy);
        res += clamp(level.g,                                      min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d).g,       min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 2.0).g, min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 3.0).g, min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 4.0).g, min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 5.0).g, min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 6.0).g, min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 7.0).g, min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 8.0).g, min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 9.0).g, min_val, 1.0);
        res += clamp(texture2D(levelmap, texcoord.xy + d * 10.0).g, min_val, 1.0);
        // res += clamp(texture2D(levelmap, texcoord.xy + d * 11.0).g, min_val, 1.0);
        gl_FragColor = vec4((res - min_val * 12.0) * 2.5, level.aaa);
    }`;

  fragRiver = `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec4 texcoord;
    uniform sampler2D levelmap;
    uniform sampler2D tex_river;
    uniform sampler2D tex_wave;
    uniform sampler2D tex_velocity;
    uniform vec4 scale_time;
    
    void main(void) 
    {
        vec2 scale = scale_time.xy;
        vec2 time = scale_time.zw;
        vec4 lev = texture2D(levelmap, texcoord.xy);
        vec4 vel = texture2D(tex_velocity, texcoord.xy);
        vel = (vel * 2.0 - 1.0) * 0.25;
        vec4 wave = texture2D(tex_wave, texcoord.zw);
        vec4 col1 = texture2D(tex_river, texcoord.xy * scale.xy + wave.rg * 0.1 + vel.xy * time.x);
        vec4 col2 = texture2D(tex_river, texcoord.xy * scale.xy + wave.rg * 0.1 - vel.xy + vel.xy * time.x);
        vec4 col = mix(col1, col2, time.x);
        float ng = (wave.b - 0.5) * 0.3;
        float k = clamp(((lev.r + ng) * 2.0 - 1.0) * 1.1, 0.0, 1.0);
        gl_FragColor = vec4(col.rgb * k, k + lev.r);
    }
   `;

  fragWave = `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec4 texcoord;
    uniform sampler2D noise;
    uniform vec4 scale_time;
    
    void main(void) 
    {
        vec2 scale = scale_time.xy;
        vec2 time = scale_time.zw;
        vec4 n = texture2D(noise, 1.5 * texcoord.xy * scale.xy);
        vec4 d1 = texture2D(noise, (texcoord.xy * scale.xy + time.xy));
        vec4 d2 = texture2D(noise, (texcoord.xy * scale.xy + time.yx) * 2.0);
        vec4 d3 = texture2D(noise, (texcoord.xy * scale.xy + vec2(1.0 - time.x, 1.0)) * 4.0);
        vec4 d4 = texture2D(noise, (texcoord.xy * scale.xy + vec2(1.0, 1.0 - time.x)) * 8.0);
        vec2 d = (d1.rg + d2.gr + d3.rg + d4.gr) * 0.25;
        gl_FragColor = vec4(d.rg, n.g, 0.0);
    }`;

  fragMinimap = `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec4 texcoord;
    uniform sampler2D levelmap;
    uniform vec4 pos;
    
    void main(void) 
    {
        vec4 level = texture2D(levelmap, texcoord.xy);
        float koef = clamp(0.05 / length((texcoord.xy * 2.0 - 1.0) - 2.0 * pos.xy), 0.9, 1.0);
        koef = (koef - 0.9) * 10.0;
        level = clamp((level * 2.0 - 1.0) * 1.0, 0.0, 1.0);
        float alpha = (level.g + level.r) * 0.5 + koef;
        gl_FragColor = vec4(level.g + level.r + koef, level.gg + vec2(koef), alpha);
    }`;

  init = () => {
    this.tex_ground1 = new Texture('/img/tex_ground.jpg');
    this.tex_wall = new Texture('/img/metal_wall.jpg');
    this.tex_noise = new Texture('/img/noise.png');
    this.tex_river = new Texture('/img/river.jpg');

    loadImage('/img/metal.jpg', (R, G, B) => {
      const groundMask = new Buffer(R.getSize());
      groundMask.perlin(32, 0.5).normalize(0, 1);
      this.tex_ground2 = createTexture(R, G, B, groundMask);
    });

    loadImage('/img/tex_grass.jpg', (R, G, B) => {
      const groundMask = new Buffer(G.getSize());
      groundMask.perlin(32, 0.5).normalize(0, 1);
      this.tex_ground3 = createTexture(R, G, B, groundMask);
    });

    this.fboVisible = new Framebuffer(256, 256);
    this.fboRiver = new Framebuffer(512, 512);
    this.fboWave = new Framebuffer(512, 512);

    this.shadow = new Buffer(game.level.level.getSize());
    this.shadow.createShadow(game.level.level.getGroundMap(), new Vector2D(-0.25, -0.5));

    this.mask = new Buffer(game.level.level.getSize());
    this.mask
      .perlin(5 << game.level.level.getSize(), 0.5)
      .normalize(-5, 6)
      .clamp(0, 1);

    this.texture = createTexture(
      game.level.level.getRiverMap(),
      game.level.level.getGroundMap(),
      this.mask,
      this.shadow,
      {wrap: game.gl.CLAMP_TO_EDGE});

    this.tex_velocity = createTexture(
      game.level.level.getVelocityX(),
      game.level.level.getVelocityY(),
      game.level.level.getVelocityX(),
      game.level.level.getVelocityY(),
      {wrap: game.gl.CLAMP_TO_EDGE}
    );

    this.shader = new Shader(this.vert, this.fragLevel, [
      'mat_tex', 'levelmap', 'tex_river', 'tex_ground_1', 'tex_ground_2', 'tex_ground_3', 'tex_wall', 'tex_visible', 'scale'
    ]);

    this.shaderVisible = new Shader(this.vertVisible(game.tankOffset), this.fragVisible, [
      'mat_tex', 'levelmap'
    ]);

    this.shaderRiver = new Shader(this.vert, this.fragRiver, [
      'mat_tex', 'levelmap', 'tex_velocity', 'tex_river', 'tex_wave', 'scale_time'
    ]);

    this.shaderWave = new Shader(this.vert, this.fragWave, [
      'mat_tex', 'noise', 'scale_time'
    ]);

    this.shaderMinimap = new Shader(this.vert_simple, this.fragMinimap, [
      'mat_pos', 'levelmap', 'pos'
    ]);

    this.texVisible_id = this.fboVisible.getTexture();
    this.texriver_id = this.fboRiver.getTexture();
  };

  renderWave = () => {
    this.fboWave.bind();
    this.shaderWave.use();
    this.shaderWave.texture(this.shaderWave.noise, this.tex_noise.getId(), 0);
    this.shaderWave.vector(this.shaderWave.scale_time, [game.textureSize/2 * game.level.level.getSize() / 64, game.textureSize/2 * game.level.level.getSize() / 64, ((Date.now() / 64) % 1000) / 1000, 0]);
    this.shaderWave.matrix(this.shaderWave.mat_tex, this.mat_tex);
    game.gl.drawArrays(game.gl.TRIANGLE_STRIP, 0, 4);
    this.fboWave.unbind();
  };

  renderRiver = () => {
    this.fboRiver.bind();
    this.shaderRiver.use();
    this.shaderRiver.texture(this.shaderRiver.levelmap, this.texture.getId(), 0);
    this.shaderRiver.texture(this.shaderRiver.tex_river, this.tex_river.getId(), 1);
    this.shaderRiver.texture(this.shaderRiver.tex_wave, this.fboWave.getTexture(), 2);
    this.shaderRiver.texture(this.shaderRiver.tex_velocity, this.tex_velocity.getId(), 3);
    this.shaderRiver.vector(this.shaderRiver.scale_time, [game.textureSize/2 * (game.level.level.getSize() / 64), game.textureSize/2 * (game.level.level.getSize() / 64), (Date.now() % 1000) / 1000, 0]);
    this.shaderRiver.matrix(this.shaderRiver.mat_tex, this.mat_tex);
    game.gl.drawArrays(game.gl.TRIANGLE_STRIP, 0, 4);
    this.fboRiver.unbind();
  };

  renderVisible = () => {
    this.fboVisible.bind();
    this.shaderVisible.use();
    this.shaderVisible.texture(this.shaderVisible.levelmap, this.texture.getId(), 0);
    this.shaderVisible.matrix(this.shaderVisible.mat_tex, this.mat_tex);
    game.gl.drawArrays(game.gl.TRIANGLE_STRIP, 0, 4);
    this.fboVisible.unbind();
  };

  renderMinimap = () => {
    const pos = unitManager.player.pos.clone()
      .mul(1 / game.level.level.getSize())
      .mul2(1, -1)
      .add2(-0.5, 0.5);

    const mat_pos = mat4.create();
    mat4Trans(mat_pos, [-0.8, -0.7, 0]);
    mat4Scal(mat_pos, [0.3 / (game.canvas.width / game.canvas.height), 0.3, 1]);

    game.gl.enable(game.gl.BLEND);
    this.shaderMinimap.use();
    this.shaderMinimap.texture(this.shaderMinimap.levelmap, this.texture.getId(), 0);
    this.shaderMinimap.matrix(this.shaderMinimap.mat_pos, mat_pos);
    this.shaderMinimap.vector(this.shaderMinimap.pos, [pos.x, pos.y, 0, 0]);
    game.gl.drawArrays(game.gl.TRIANGLE_STRIP, 0, 4);
    game.gl.disable(game.gl.BLEND);
  };

  draw = () => {
    if (
      !this.tex_ground1 || !this.tex_ground1.ready() ||
      !this.tex_ground2 || !this.tex_ground2.ready() ||
      !this.tex_river || !this.tex_river.ready()
    ) {
      return;
    }

    const koef = 12 / game.level.level.getSize();

    const aspect = game.canvas.width / game.canvas.height;
    const hRatio = 16 / 9;
    this.mat_tex = mat4.create();

    const pos = unitManager.player.pos.clone()
      .mul(1 / game.level.level.getSize())
      .mul2(1, -1)
      .add2(-0.5, 0.5);

    mat4Trans(this.mat_tex, [0.5, 0.5]);

    mat4Trans(this.mat_tex, pos.toVec());
    mat4Rotate(this.mat_tex, unitManager.player.angle);
    if (aspect < hRatio) {
      mat4Scal(this.mat_tex, [game.zPos * aspect * koef, game.zPos * koef]);
    } else {
      mat4Scal(this.mat_tex, [game.zPos * hRatio * koef, game.zPos * koef * hRatio / aspect]);
    }
    const mat = mat4.create();

    mat4Trans(mat, [0, game.tankOffset]);
    mat4.mul(this.mat_tex, this.mat_tex, mat);

    this.renderVisible();
    this.renderWave();
    this.renderRiver();

    const shader = this.shader;
    shader.use();

    shader.matrix(shader.mat_tex, this.mat_tex);
    shader.texture(shader.levelmap, this.texture.getId(), 0);
    shader.texture(shader.tex_river, this.fboRiver.getTexture(), 1);
    shader.texture(shader.tex_ground_1, this.tex_ground1.getId(), 2);
    shader.texture(shader.tex_ground_2, this.tex_ground2.getId(), 3);
    shader.texture(shader.tex_ground_3, this.tex_ground3.getId(), 4);
    shader.texture(shader.tex_wall, this.tex_wall.getId(), 5);
    shader.texture(shader.tex_visible, this.fboVisible.getTexture(), 6);
    shader.vector(shader.scale, [game.textureSize * game.level.level.getSize() / 64, game.textureSize * game.level.level.getSize() / 64, 0, 0]);
    game.gl.drawArrays(game.gl.TRIANGLE_STRIP, 0, 4);

    // this.renderMinimap();
  };
}

const levelDraw = new LevelDraw();

export default levelDraw;

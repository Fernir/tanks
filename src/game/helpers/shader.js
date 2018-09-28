import game from './../game';

export default class Shader {
  gl = null;
  prog = null;

  constructor(vp, fp, names) {
    this.gl = game.gl;

    const frag = this.compileShader(fp, this.gl.FRAGMENT_SHADER);
    const vert = this.compileShader(vp, this.gl.VERTEX_SHADER);

    if (!frag || !vert) {
      return;
    }

    this.prog = this.gl.createProgram();

    this.gl.attachShader(this.prog, vert);
    this.gl.attachShader(this.prog, frag);
    this.gl.bindAttribLocation(this.prog, 0, 'position');
    this.gl.linkProgram(this.prog);

    if (!this.gl.getProgramParameter(this.prog, this.gl.LINK_STATUS)) {
      console.assert(false, 'could not initialise shaders');
      return;
    }

    if (names) {
      names.forEach((name) => {
        this[name] = this.gl.getUniformLocation(this.prog, name);
      });
    }
  }

  compileShader = (prog, type) => {
    const shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, prog);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.log(prog);
      console.assert(false, this.gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  };

  use = () => this.gl.useProgram(this.prog);

  matrix = (name, mat) => {
    const loc = typeof name === 'string' ? this.gl.getUniformLocation(this.prog, name) : name;
    this.gl.uniformMatrix4fv(loc, false, mat);
  };

  texture = (name, id, lev) => {
    const loc = typeof name === 'string' ? this.gl.getUniformLocation(this.prog, name) : name;
    this.gl.uniform1i(loc, lev);
    this.gl.activeTexture(this.gl.TEXTURE0 + lev);
    this.gl.bindTexture(this.gl.TEXTURE_2D, id);
  };

  vector = (name, vec) => {
    const loc = typeof name === 'string' ? this.gl.getUniformLocation(this.prog, name) : name;
    this.gl.uniform4f(loc, vec[0], vec[1], vec[2], vec[3]);
  };

  getLocation = (name) => this.gl.getUniformLocation(this.prog, name);
}

export const vertexShader = (mat_pos, mat_tex, position) => `
  attribute vec4 position;
  ${mat_pos ? 'uniform mat4 matPos;' : ''}
  ${mat_tex ? 'uniform mat4 mat_tex;' : ''}
  varying vec4 texcoord;
  
  void main()
  {
    ${mat_pos ? 'gl_Position = matPos * position;' : 'gl_Position = position;'}
    ${mat_tex ? 'texcoord = mat_tex * position;' : 'texcoord = position * 0.5 + 0.5;'}
    ${position ? `texcoord.zw = ${position}.xy * 0.5 + 0.5;` : ''}
  }
`;

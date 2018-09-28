import game from './../../game/game';

export default class Framebuffer {
  width = 0;
  height = 0;
  id = 0;
  tex = null;

  constructor(width, height) {
    const gl = game.gl;

    this.width = width;
    this.height = height;
    this.id = gl.createFramebuffer();
    this.tex = gl.createTexture();

    // init texture
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // non-multisample, so bind things directly to the FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const ret = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    if (ret !== gl.FRAMEBUFFER_COMPLETE) {
      console.assert(false, `ERROR: checkFramebufferStatus ${ret}`);
      return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  bind = () => {
    const gl = game.gl;
    console.assert(this.id);
    gl.viewport(0, 0, this.width, this.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
  };

  unbind = () => {
    const gl = game.gl;
    console.assert(this.id);
    gl.viewport(0, 0, game.canvas.width, game.canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  getTexture = () => this.tex;
}

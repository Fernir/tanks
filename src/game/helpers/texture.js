import game from './../../game/game';

export default class Texture {
  id = null;
  loaded = false;

  constructor(img, param, callback) {
    if (!img) {
      return;
    }

    const gl = game.gl;

    this.id = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let filter = gl.LINEAR;
    let wrap = gl.REPEAT;

    if (param) {
      if (param.filter) filter = param.filter;
      if (param.wrap) wrap = param.wrap;
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);

    this.loaded = false;
    if (typeof img === 'string') {
      const image = new window.Image();
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        this.loaded = true;
        if (callback) callback();
      };

      image.onerror = () => {
        console.assert(false, `while loading image '${img}'.`);
      };

      image.src = img;
    } else {
      console.assert(img instanceof Uint8Array);
      console.assert(param.size !== undefined);
      gl.bindTexture(gl.TEXTURE_2D, this.id);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, param.size, param.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, img, 0);
      this.loaded = true;
    }
  }

  ready = () => this.loaded;
  getId = () => (this.loaded ? this.id : null);
}

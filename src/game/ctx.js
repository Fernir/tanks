import game from './game';

class CTX {
  gl = null;
  canvas = null;

  init = () => {
    this.canvas = document.getElementById('plot');
    this.canvas.style.display = 'block';
    this.canvas.style.transform = 'scale(3,3)';

    const attributes = {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      stencil: false
    };

    this.gl = this.canvas.getContext('webgl', attributes) || this.canvas.getContext('experimental-webgl', attributes);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    const vertices =
      [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0
      ];

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enableVertexAttribArray(0);


    window.addEventListener('resize', this.update, false);

    this.update();

    return this.gl;
  };

  update = () => {
    this.canvas.width = game.gameWidth();
    this.canvas.height = game.gameHeight();
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  };
}

const ctx = new CTX();

export default ctx;

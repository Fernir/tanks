import * as mat4 from 'gl-matrix/src/gl-matrix/mat4';

export const mat4Trans = (out, vec) => mat4.translate(out, out, [vec[0], vec[1], 0, 0]);

export const mat4Scal = (out, vec) => mat4.scale(out, out, [vec[0], vec[1], 1, 1]);

export const mat4Rotate = (out, angle) => mat4.rotateZ(out, out, angle);


export const rand = (m, mi = 0) => (Math.random() * (m - mi)) + mi;
export const deg = Math.PI / 180;
export const int = (v, m = 0) => v >> m;

export class Random {
  holdrand = null;

  constructor(seed) {
    this.holdrand = (seed || (Date.now() * Math.random())) & 0xffffffff;
  }

  next = () => {
    this.holdrand = ((this.holdrand * 345345) + 2531011) & 0xffffffff;
    const ret = (this.holdrand >> 16) & 0x7fff;
    return ret / 32767;
  };
}

const previous = [];

export const computeFPS = () => {
  if (previous.length > 60) {
    previous.splice(0, 1);
  }
  const start = (new Date()).getTime();

  previous.push(start);

  let sum = 0;

  for (let id = 0; id < previous.length - 1; id++) {
    sum += previous[id + 1] - previous[id];
  }

  return int(1000.0 / (sum / previous.length));
};


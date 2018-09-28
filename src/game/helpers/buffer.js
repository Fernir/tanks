import {Random} from './../helpers/helpers';
import Texture from './texture';
import Vector2D from './vector';

export default class Buffer {
  size = 0;
  seed = 0;
  data = null;
  rand = null;

  constructor(size, seed) {
    this.size = size;
    this.seed = seed;
    this.data = new Float32Array(size * size);
    this.data.fill(0.0);
    this.rand = new Random(seed);
  }

  getData = (x, y) => (y ? this.data[(y * this.size) + x | 0] : this.data[x]);

  setData = (ind = 0, val) => {
    this.data[ind | 0] = val;
  };

  getSize = () => this.size;

  getTextureSize = () => this.size + this.size;

  dispersion = (rad) => (2 * rad * this.rand.next()) - rad;

  extrem = (freq, ampl) => {
    const size = freq * freq;
    const ret = new Array(size);

    for (let i = 0; i < size; i++) {
      ret[i] = this.dispersion(ampl);
    }
    return ret;
  };

  cosLerp = (a, b, t) => {
    const ft = t * Math.PI;
    const f = (1 - Math.cos(ft)) * 0.5;
    return (a * (1 - f)) + (b * f);
  };

  perlin = (startFreq, koef) => {
    let ampl = 1;
    let freq = startFreq;

    do {
      const buf = this.extrem(freq, ampl);

      const bufData = (x, y) => buf[y * freq + x | 0];

      for (let j = 0; j < this.size; j++) {
        for (let i = 0; i < this.size; i++) {
          let x = i * freq / this.size | 0;
          let y = j * freq / this.size | 0;
          const tx = i * freq / this.size - x;
          const ty = j * freq / this.size - y;
          const x1 = bufData(x, y);
          const old_x = x;

          x++;
          x = x > freq - 1 ? 0 : x;
          const x2 = bufData(x, y);
          const xx = this.cosLerp(x1, x2, tx);

          y++;
          y = y > freq - 1 ? 0 : y;
          const y1 = bufData(old_x, y);
          const y2 = bufData(x, y);
          const yy = this.cosLerp(y1, y2, tx);

          this.data[this.size * j + i | 0] += this.cosLerp(xx, yy, ty);
        }
      }
      freq *= 2;
      ampl *= koef;
    }

    while (freq < this.size);

    return this;
  };

  normalize = (a, b) => {
    let min = this.data[0];
    let max = this.data[0];
    for (let i = 1; i < this.size * this.size; i++) {
      if (this.data[i] > max) max = this.data[i];
      if (this.data[i] < min) min = this.data[i];
    }
    const k = (b - a) / (max - min);
    for (let i = 0; i < this.size * this.size; i++) { this.data[i] = (this.data[i] - min) * k + a; }

    return this;
  };

  for_each = (fun) => {
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        this.data[j * this.size + i | 0] = fun(this.getData(i, j), i, j);
      }
    }
    return this;
  };

  for_buf = (buf, fun) => {
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        this.data[j * this.size + i | 0] = fun(this.getData(i, j), buf.getData(i, j), i, j);
      }
    }
    return this;
  };

  clamp = (a, b) => {
    for (let i = 0; i < this.size * this.size; i++) {
      if (this.data[i] < a) this.data[i] = a;
      if (this.data[i] > b) this.data[i] = b;
    }
    return this;
  };

  gaussian_fast = (radius, srcBuf, dir, mask) => {
    const norm = (x) => (1 / (Math.sqrt(2 * Math.PI))) * Math.exp(-x * x / 2);

    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        if (mask && mask.getData(i, j) < 0.5) {
          continue;
        }

        let kol = 0.0;
        let sum = 0.0;
        for (let p = -radius; p <= radius; p++) {
          const x = i + dir[0] * p;
          const y = j + dir[1] * p;

          if (y < 0) continue;
          if (y >= this.size) break;
          if (x < 0) continue;
          if (x >= this.size) break;

          const sx = (x - i) / radius;
          const sy = (y - j) / radius;
          const r = Math.sqrt(sx * sx + sy * sy);
          const koefficient = norm(r * 3);
          kol += koefficient;
          sum += koefficient * srcBuf.getData(x, y);
        }
        const ind = i + (j * this.size) | 0;
        this.data[ind] = sum / kol;
      }
    }
  };

  getGaussian = (radius, mask) => {
    const blur_x = new Buffer(this.size);
    const blur = new Buffer(this.size);
    blur_x.gaussian_fast(radius, this, [1, 0], mask);
    blur.gaussian_fast(radius, blur_x, [0, 1], mask);
    return blur;
  };

  filterArea = (val) => {
    let iterCount = 0;
    let cleared = false;
    do {
      cleared = false;
      for (let j = 1; j < this.size - 1; j++) {
        for (let i = 1; i < this.size - 1; i++) {
          const a00 = this.getData(i, j) > 0.5;
          const a10 = this.getData(i + 1, j) > 0.5;
          const a01 = this.getData(i, j + 1) > 0.5;
          const a11 = this.getData(i + 1, j + 1) > 0.5;
          if (a00 !== a10 && a00 === a11 && a10 === a01) {
            this.data[i + j * this.size | 0] = val;
            this.data[i + 1 + j * this.size | 0] = val;
            this.data[i + (j + 1) * this.size | 0] = val;
            this.data[i + 1 + (j + 1) * this.size | 0] = val;
            cleared = true;
          }

          const a0_1 = this.getData(i, j - 1) > 0.5;
          const a_10 = this.getData(i - 1, j) > 0.5;
          if (a00 && !a10 && !a01 && !a0_1 && !a_10) {
            this.data[i + j * this.size | 0] = 0;
            cleared = true;
          }
        }
      }
      iterCount++;
    }
    while (cleared && iterCount < 5);
    return this;
  };

  fill_isolated_area = () => {
    const filled = new Array(this.size * this.size);

    for (let i = 0; i < this.size * this.size; i++) {
      filled[i] = this.data[i] > 0.5 ? 255 : 0;
    }

    const fill = (id, cX, cY) => {
      const coordinates =
        [
          {x: cX, y: cY}
        ];

      while (coordinates.length > 0) {
        const cur = coordinates.pop();
        const x = cur.x;
        const y = cur.y;
        if (x < 0 || x > this.size - 1) {
          continue;
        }
        if (y < 0 || y > this.size - 1) {
          continue;
        }
        if (filled[x + y * this.size] !== 0) {
          continue;
        }
        filled[x + y * this.size] = id;
        coordinates.push({x, y: y - 1});
        coordinates.push({x: x - 1, y});
        coordinates.push({x: x + 1, y});
        coordinates.push({x, y: y + 1});
      }
    };

    // Fill level
    let id = 0;
    const id_count = [];
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        if (filled[i + j * this.size | 0] === 0) {
          fill(++id, i, j);
          id_count[id] = 0;
        }
      }
    }

    // calc count for each area
    for (let i = 0; i < this.size * this.size; i++) {
      const val = filled[i];
      if (val !== 255) {
        id_count[val]++;
      }
    }

    // find id of area with max count elem
    let index_with_max_count = 1;
    for (let i = 2; i < id_count.length; i++) {
      if (id_count[i] > id_count[index_with_max_count]) { index_with_max_count = i; }
    }

    // fiil all elem with id is not index_with_max_count
    for (let i = 0; i < this.size * this.size; i++) {
      const val = filled[i];
      if (val !== 255 && val !== index_with_max_count) { this.data[i] = 1; }
    }

    return this;
  };

  draw = (src_image) => {
    src_image = src_image || this;
    const koeF = src_image.getSize() / this.size;
    for (let j = 0; j < this.size; j++) {
      const y = j * koeF | 0;
      for (let i = 0; i < this.size; i++) {
        const x = i * koeF | 0;
        this.data[i + j * this.size] = src_image.getData(x, y);
      }
    }
  };

  copy = (src_image) => {
    for (let i = 0; i < this.size * this.size; i++) {
      this.data[i] = src_image.getData(i);
    }
  };

  bresenham = (x0, y0, x1, y1, val) => {
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = (dx > dy ? dx : -dy) / 2;

    while (true) {
      if (x0 >= 0 && x0 < this.size &&
        y0 >= 0 && y0 < this.size) {
        this.data[x0 + y0 * this.size] = val;
      }
      if (x0 === x1 && y0 === y1) break;
      const e2 = err;

      if (e2 > -dx) {
        err -= dy;
        x0 += sx;
      }

      if (e2 < dy) {
        err += dx;
        y0 += sy;
      }
    }
  };

  getBuffer = () => this.data;

  render = (ctx) => {
    ctx.scale(2, 2);
    const imageData = ctx.createImageData(this.size, this.size);

    const data = imageData.data;
    for (let i = 0; i < this.size * 4 * this.size; i += 4) {
      const d = 255 - (this.data[i / 4] * 255);
      data[i] = d;
      data[i + 1] = d;
      data[i + 2] = d;
      data[i + 3] = d;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  createShadow = (srcBuf, sun, length = 12) => {
    const dir = sun.clone().normalize();

    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        let shadowValue = 0.0;
        let count = 0;

        for (let k = 0; k < length; k++) {
          const x = i + (dir.x * k); // coord trace in levelmap
          const y = j + (dir.y * k);
          if (x < 0 || y < 0 || x > this.size - 1 || y > this.size - 1) {
            continue;
          }

          shadowValue += srcBuf.getData(x | 0, y | 0);
          count++;
        }
        this.data[i + (j * this.size)] = count === 0 ? 0 : shadowValue / count;
      }
    }

    return this;
  };

  line = (a, b, val) => this.bresenham(a.x | 0, a.y | 0, b.x | 0, b.y | 0, val);

  random_point = () => {
    const ret = {pos: null, next: null};
    const a = this.rand.next() * this.size;
    const b = this.rand.next() < 0.5 ? 0 : this.size - 1;
    if (this.rand.next() < 0.5) {
      ret.pos = new Vector2D(a, b);
    } else {
      ret.pos = new Vector2D(b, a);
    }
    return ret;
  };

  raster_river = (riv, val) => {
    for (let i = 0; i < riv.length - 1; i++) {
      this.line(riv[i].pos, riv[i + 1].pos, val);
      if (riv[i].next) {
        this.raster_river(riv[i].next, val * 0.5);
      }
    }
  };

  generate_river = (amplitude, count_river) => {
    // 1) generation two vertex: begin and end of river
    const rnd = this.rand.next();
    const begin = {pos: new Vector2D(rnd * this.size, this.size - 1), next: null};
    const end = {pos: new Vector2D((1 - rnd) * this.size, 0), next: null};

    // 2) split algorithm
    const all_river = [];
    const river = [begin];

    const split = (a, b, out) => {
      const dir = b.pos.clone().sub(a.pos);
      let length = dir.length();

      if (length < 5) {
        return;
      }

      const c = {pos: null, next: null};
      c.pos = a.pos.clone().add(b.pos).mul(0.5);

      length = (this.rand.next() - 0.5) * amplitude * length;
      c.pos.add(dir.normalize().binormalize().mul(length));

      split(a, c, out);
      out.push(c);
      all_river.push(c);
      split(c, b, out);
    };

    split(begin, end, river);
    river.push(end);

    for (let count = 0; count < count_river; count++) {
      const pivot_id = this.rand.next() * all_river.length | 0;
      const pivot = all_river[pivot_id];
      const point_begin = {pos: pivot.pos.clone(), next: null};
      const point_end = this.random_point();
      const sub_river = [point_begin];
      split(point_begin, point_end, sub_river);
      sub_river.push(point_end);
      pivot.next = sub_river;
    }

    this.raster_river(river, 1);

    return river;
  }
}

export const loadImage = (img, callback) => {
  const image = new window.Image();
  image.onload = () => {
    console.assert(image.width === image.height);
    const size = image.width;

    const R = new Buffer(size);
    const G = new Buffer(size);
    const B = new Buffer(size);

    const cnv = document.createElement('canvas');
    cnv.width = size;
    cnv.height = size;
    const disp = cnv.getContext('2d');

    disp.drawImage(image, 0, 0);
    const data = disp.getImageData(0, 0, size, size).data;

    for (let i = 0; i < size * size; i++) {
      const r = data[4 * i] / 255;
      const g = data[4 * i + 1] / 255;
      const b = data[4 * i + 2] / 255;
      R.setData(i, r);
      G.setData(i, g);
      B.setData(i, b);
    }

    callback(R, G, B);
  };

  image.onerror = () => console.assert(false, `while loading image '${img}'.`);
  image.src = img;
};

export const createTexture = (R, G, B, A, param) => {
  console.assert(R.getSize() === G.getSize());
  console.assert(R.getSize() === B.getSize());
  console.assert(R.getSize() === A.getSize());

  const size = R.getSize();
  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const r = R.getData(i);
    const g = G.getData(i);
    const b = B.getData(i);
    const a = A.getData(i);

    data[(4 * i)] = r * 255;
    data[(4 * i) + 1] = g * 255;
    data[(4 * i) + 2] = b * 255;
    data[(4 * i) + 3] = a * 255;
  }

  const parameters = param || {};
  parameters.size = size;
  return new Texture(data, parameters);
};

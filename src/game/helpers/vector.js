export default class Vector2D {
  x = 0;
  y = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set = (x = 0, y = 0) => {
    this.x = x;
    this.y = y;
    return this;
  };

  add = (val) => {
    if (val instanceof Vector2D) {
      this.x += val.x;
      this.y += val.y;
    } else if (typeof val === 'number') {
      this.x += val;
      this.y += val;
    }
    return this;
  };

  sub = (val) => {
    if (val instanceof Vector2D) {
      this.x -= val.x;
      this.y -= val.y;
    } else if (typeof val === 'number') {
      this.x -= val;
      this.y -= val;
    }
    return this;
  };


  mul = (val) => {
    if (val instanceof Vector2D) {
      this.x *= val.x;
      this.y *= val.y;
    } else if (typeof val === 'number') {
      this.x *= val;
      this.y *= val;
    }
    return this;
  };

  mul2 = (x, y) => {
    this.x *= x;
    this.y *= y;
    return this;
  };

  add2 = (x, y) => {
    this.x += x;
    this.y += y;
    return this;
  };

  div = (val) => {
    if (val instanceof Vector2D) {
      this.x /= val.x;
      this.y /= val.y;
    } else if (typeof val === 'number') {
      this.x /= val;
      this.y /= val;
    }
    return this;
  };

  copy = (vec) => {
    this.x = vec.x;
    this.y = vec.y;
    return this;
  };

  clone = () => new Vector2D(this.x, this.y);

  dot = (vec) => (this.x * vec.x) + (this.y * vec.y);

  length = () => Math.sqrt(this.dot(this));

  rotate = (angle) => {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const x = (this.x * cosA) - (this.y * sinA);
    const y = -(this.x * sinA) - (this.y * cosA);
    return this.set(x, y);
  };

  normalize = () => {
    const len = this.length();
    if (len !== 0) {
      this.mul(1 / len);
    }

    return this;
  };

  binormalize = () => {
    this.set(this.y, -this.x);

    return this;
  };

  interpolate = (from, to, koef) => this.copy(to).sub(from).mul(koef).add(from);

  toVec = () => [this.x, this.y];
}
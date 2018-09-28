import LevelGeneration from './generation';
import Vector from './../helpers/vector';
import game from './../game';

export default class Level {
  size = 0;
  board = 5;
  seed = 2;
  level = null;

  constructor(size = 256, board = 1, seed = 42) {
    this.size = size;
    this.seed = seed;
    this.board = board;
    this.level = new LevelGeneration(this.size, board, seed);
  }

  getRandomPos = () => {
    while (true) {
      const x = this.board + (Math.random() * (this.level.getSize() - this.board - 1));
      const y = this.board + (Math.random() * (this.level.getSize() - this.board - 1));
      const pos = new Vector(x, y);
      if (!this.collideMap(pos, 50)) {
        return pos;
      }
    }
  };

  frac = (x = 0) => x - (x | 0);

  lerp = (a, b, t) => (a * (1 - t)) + (b * t);

  getNorm = (dest, pos, river = false) => {
    const t00 = this.getCollide(pos, river);
    const t10 = this.getCollide(new Vector(pos.x + 0.1, pos.y), river);
    const t01 = this.getCollide(new Vector(pos.x, pos.y + 0.1), river);

    dest.set(t10 - t00, t01 - t00);

    return t00;
  };

  collideMap = (pos, factor = 80, river) => {
    const dir = new Vector(0, 0);
    const tile = this.getNorm(dir, pos, river);

    return tile > factor ? dir : null;
  };

  collideUpdate = (tank, factor, river) => {
    const norm = this.collideMap(tank.pos, factor, river);

    if (norm) {
      const dot = norm.normalize().dot(tank.vel);

      if (dot !== 0) {
        const delta = norm.mul(dot);
        dot > 0 ? tank.pos.sub(delta) : tank.pos.add(delta);
      }
    }
  };

  getCollide = (pos, river) => {
    const buffer = river ? game.level.level.getRiverMap().getBuffer() : game.level.level.getGroundMap().getBuffer();
    const size = river ? game.level.level.getRiverMap().getSize() : game.level.level.getGroundMap().getSize();
    const getData = (x, y) => buffer[((y * size) + x) | 0];

    const x = pos.x - 0.1;
    const y = pos.y - 0.1;
    const cx = x | 0;
    const cy = y | 0;

    if (cx < 0) return 0;
    if (cy < 0) return 0;
    if (cx > size - 1) return 0;
    if (cy > size - 1) return 0;

    const t00 = getData(cx, cy);
    const t10 = getData(cx + 1, cy);
    const t01 = getData(cx, cy + 1);
    const t11 = getData(cx + 1, cy + 1);


    const dx = this.frac(x);
    const dy = this.frac(y);

    const xx1 = this.lerp(t00, t10, dx);
    const xx2 = this.lerp(t01, t11, dx);

    return (this.lerp(xx1, xx2, dy) * 255) | 0;
  };
}

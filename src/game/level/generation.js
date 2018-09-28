import Buffer from './../helpers/buffer';
import game from './../game';

export class RiverGeneration {
  constructor(size, seed) {
    const river = new Buffer(size, seed);
    this.river_tree = river.generate_river(game.tankOffset, 1);
    this.river_blured = river.getGaussian(4);
    this.river_blured.normalize(0, 1);

    this.raw_river = new Buffer(size);
    this.raw_river.for_buf(this.river_blured, (a, b) => (b > 0.1 ? 1 : 0)).filterArea(1);

    const level_river = new Buffer(size);

    level_river.draw(this.raw_river);
    this.blured_level_river = level_river.getGaussian(4);

    // generating velocity map
    const river_mask = new Buffer(size);
    river_mask.for_buf(this.blured_level_river, (a, b) => (b > 0 ? 1 : 0));

    this.velocity_x = new Buffer(size);
    this.velocity_y = new Buffer(size);

    const power = 0.5;
    this.generateVelocity(this.river_tree, power);

    this.blured_velocity_x = this.velocity_x.getGaussian(6, river_mask).clamp(-1, 1).for_each((val) => (val * 0.5) + 0.5);
    this.blured_velocity_y = this.velocity_y.getGaussian(6, river_mask).clamp(-1, 1).for_each((val) => (val * 0.5) + 0.5);
  }

  generateVelocity = (river, koef) => {
    for (let i = 0; i < river.length - 1; i++) {
      const a = river[i].pos.clone().mul(2);
      const b = river[i + 1].pos.clone().mul(2);
      const norm = b.sub(a).normalize().mul(koef);

      this.velocity_x.bresenham(a.x | 0, a.y | 0, b.x | 0, b.y | 0, norm.x);
      this.velocity_y.bresenham(a.x | 0, a.y | 0, b.x | 0, b.y | 0, -norm.y);

      if (river[i].next) {
        this.generateVelocity(river[i].next, koef);
      }
    }
  }
}


export default class LevelGeneration {
  size = 0;
  rawLevel = null;
  border = null;
  blured = null;
  level = null;
  river = null;
  bluredLevel = null;
  obstructionMap = null;

  constructor(size, boardSize, seed) {
    this.size = size;
    this.rawLevel = new Buffer(this.size, seed);
    // generate full map
    this.rawLevel
      .perlin(5 << this.size, 0.3)
      .normalize(0, 1)
      .for_each((val) => Math.abs(val - 0.5) * 2)
      .normalize(-0.5, 2)
      .clamp(0, 1)
      .for_each((val) => (val < 0.2 ? 0 : 1));

    this.border = new Buffer(this.size);
    // generate border
    this.border.for_each((val, x, y) => (x < boardSize ||
      y < boardSize ||
      x > this.border.getSize() - boardSize ||
      y > this.border.getSize() - boardSize ? 1 : 0)
    );

    this.river = new RiverGeneration(size, seed);

    this.rawLevel.for_buf(this.river.river_blured, (a, b) => b > 0 ? 0 : a);

    this.rawLevel.for_buf(this.border, (a, b) => Math.max(a, b));

    // final raw map
    this.border.for_buf(this.river.raw_river, (my, riv) => my * (1 - riv));

    // Post-processing
    this.blured = this.rawLevel.getGaussian(7);

    this.rawLevel
      .for_buf(this.blured, (a, b) => {
        if (a > 0.5 && b < 0.5) return 0;
        if (a < 0.5 && b > 0.5) return 1;
        return a;
      })
      .filterArea(0)
      .fill_isolated_area();

    // create level
    this.level = new Buffer(this.size);
    this.level.draw(this.rawLevel);
    this.bluredLevel = this.level.getGaussian(4);

    // obstruction map
    this.obstructionMap = new Buffer(this.rawLevel.getSize());
    this.obstructionMap
      .for_buf(this.rawLevel, (a, b) => b)
      .for_buf(this.river.raw_river, (a, b) => b);
  }

  getRiverMap = () => this.river.blured_level_river;

  getSize = () => this.size;

  getGroundMap = () => this.bluredLevel;

  getObstructionMap = () => this.obstructionMap;

  getRawLevel = () => this.rawLevel;

  getVelocityX = () => this.river.blured_velocity_x;

  getVelocityY = () => this.river.blured_velocity_y;

}

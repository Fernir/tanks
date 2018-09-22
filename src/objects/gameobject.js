import {rand} from '../game/helpers';
import game from '../game/game';

export default class GameObject {
  x = 0;
  y = 0;
  right = 0;
  left = 0;
  bottom = 0;
  top = 0;
  guid = 0;
  speed = 0;

  constructor(x = rand(game.gameWidth()), y = rand(game.gameHeight()), speed = 0) {
    this.x = x;
    this.y = y;
    this.speed = speed;
  }

  intersect = (x, y) => !(x > this.right || this.left > x + 1 || y > this.bottom || this.top > y + 1);

  draw = () => {};
}

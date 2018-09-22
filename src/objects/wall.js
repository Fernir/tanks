import game from '../game/game';
import GameObject from './gameobject';

export default class Wall extends GameObject {
  image = new window.Image();
  base = false;

  constructor(x = 0, y = 0) {
    super(x, y);

    this.image.src = './../img/wall.png';
  }

  draw = () => {
    const ctx = game.ctx;

    ctx.drawImage(this.image, this.x, this.y, game.spriteSize, game.spriteSize);
    // ctx.beginPath();
    // ctx.lineWidth = '1';
    // ctx.strokeStyle = this.hit ? 'blue' : 'red';
    // ctx.rect(this.x + 1, this.y + 1, game.spriteSize - 1, game.spriteSize - 1);
    // ctx.stroke();

    this.left = this.x + 1;
    this.top = this.y + 1;
    this.right = (this.x + game.spriteSize) - 1;
    this.bottom = (this.y + game.spriteSize) - 1;
  };
}

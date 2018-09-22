import ctx from './ctx';
import {computeFPS} from './helpers';
import gameMap from './../data/data';
import keyboard, {MOVE_LEFT, MOVE_RIGHT, MOVE_DOWN, MOVE_UP} from './keyboard';
import wallsManager from '../objects/managers/wallmanager';
import tanksManager from '../objects/managers/tankmanager';
import Tank from '../objects/tank';

class Game {
  spriteSize = 40;
  halfSpriteSize = this.spriteSize / 2;
  ctx = null;

  gameHeight = () => this.spriteSize * gameMap.length;
  gameWidth = () => this.spriteSize * gameMap[0].length;

  animationLoop = () => {
    const player = tanksManager.player;
    const blocks = player.collide();
    const curKey = String(keyboard.moveKey);

    if (curKey === MOVE_LEFT && !blocks.left) {
      player.direction = 90;
      player.x -= player.speed;
    } else if (curKey === MOVE_RIGHT && !blocks.right) {
      player.direction = -90;
      player.x += player.speed;
    } else if (curKey === MOVE_UP && !blocks.up) {
      player.direction = 180;
      player.y -= player.speed;
    } else if (curKey === MOVE_DOWN && !blocks.down) {
      player.direction = 0;
      player.y += player.speed;
    }

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.gameWidth(), this.gameHeight());

    tanksManager.draw();
    wallsManager.draw();

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '11px Arial';
    this.ctx.fillText(`${computeFPS()} fps`, this.gameWidth() - 40, 12);

    this.ctx.font = '16px Arial bold';
    this.ctx.fillText('Click anywhere to add tank', this.gameWidth() - 220, 60);

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(this.animationLoop);
    }
  };

  init = () => {
    this.ctx = ctx.init();

    ctx.plot.addEventListener('click', (e) => {
      tanksManager.add(new Tank(e.clientX, e.clientY));
    });

    keyboard.init();
    wallsManager.init();
    tanksManager.init();

    this.animationLoop();
  };
}

const game = new Game();

export default game;

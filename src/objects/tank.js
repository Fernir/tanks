import game from '../game/game';
import {deg, int} from '../game/helpers';
import {findShortestPath, WAY_BOTTOM, WAY_LEFT, WAY_RIGHT, WAY_TOP} from './../game/navigation/ai';
import gameMap from '../data/data';

import GameObject from './gameobject';
import wallsManager from './managers/wallmanager';
import tanksManager from './managers/tankmanager';

export default class Tank extends GameObject {
  direction = 0;
  image = new window.Image();

  constructor(x = 0, y = 0, speed = 2) {
    super(x, y, speed);

    this.image.src = '/img/tank.png';
  }

  draw = () => {
    const ctx = game.ctx;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.translate(int(game.spriteSize, 1), int(game.spriteSize, 1));
    ctx.rotate(this.direction * deg);
    ctx.drawImage(this.image, int(-game.spriteSize, 1), int(-game.spriteSize, 1), game.spriteSize, game.spriteSize);
    if (this.guid === tanksManager.player.guid) {
      const data = ctx.getImageData(this.x, this.y, game.spriteSize, game.spriteSize);

      for (let i = 0, length = data.data.length; i < length; i += 4) {
        if (data.data[i] > 20) {
          data.data[i] = Math.max(255, data.data[i]);
        }
      }

      ctx.putImageData(data, this.x, this.y);
    }

    ctx.restore();


    if (this.guid !== tanksManager.player.guid) {
      this.ai();
    }
  };

  collide = () => {
    this.top = this.y;
    this.left = this.x;
    this.right = this.x + game.spriteSize;
    this.bottom = this.y + game.spriteSize;

    const blocks = {left: false, right: false, up: false, down: false};

    wallsManager.objects.forEach((w) => {
      for (let j = 0; j < game.spriteSize; j++) {
        if (w.intersect(this.left + j, this.bottom + 1)) {
          blocks.down = true;
        }

        if (w.intersect(this.left + j, this.top - 1)) {
          blocks.up = true;
        }

        if (w.intersect(this.left - 1, this.top + j)) {
          blocks.left = true;
        }

        if (w.intersect(this.right + 1, this.top + j)) {
          blocks.right = true;
        }
      }
    });

    return blocks;
  };

  ai = (debug = false) => {
    const srcX = int(this.y / game.spriteSize);
    const srcY = int(this.x / game.spriteSize);
    const tarX = int(tanksManager.player.y / game.spriteSize);
    const tarY = int(tanksManager.player.x / game.spriteSize);

    const path = findShortestPath(srcX, srcY, tarX, tarY, gameMap, debug);

    if (path && path.length > 1) {
      let sx = int(this.x / game.spriteSize);
      let sy = int(this.y / game.spriteSize);

      const direction = String(path[0]);

      switch (direction) {
        case WAY_LEFT:
          sx--;
          break;
        case WAY_TOP:
          sy++;
          break;
        case WAY_RIGHT:
          sx++;
          break;
        case WAY_BOTTOM:
          sy--;
      }

      sx *= game.spriteSize;
      sy *= game.spriteSize;

      if (this.x > sx) {
        this.direction = 90;
        this.x -= this.speed;
      } else if (this.y < sy) {
        this.direction = 0;
        this.y += this.speed;
      } else if (this.x < sx) {
        this.direction = -90;
        this.x += this.speed;
      } else if (this.y > sy) {
        this.direction = 180;
        this.y -= this.speed;
      }

      this.x = int(this.x);
      this.y = int(this.y);
    }
  };
}


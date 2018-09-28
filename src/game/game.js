import ctx from './ctx';
import keyboard from './keyboard';
import levelDraw from './level/levelDraw';
import unitManager from '../objects/managers/unitmanager';
import Unit from '../objects/unit';
import Level from './level/level';

class Game {
  gl = null;
  canvas = null;
  level = null;
  textureSize = 10;
  tankOffset = 0.25;
  camera = null;
  zPos = 1;

  gameHeight = () => window.innerHeight / 3;
  gameWidth = () => window.innerWidth / 3;

  animationLoop = () => {
    const player = unitManager.player;

    player.rotate = 0;
    player.direction.set(0, 0);
    player.shot = 0;

    if (keyboard.keys && keyboard.keys[37]) {
      player.rotate = 6;
    }
    if (keyboard.keys && keyboard.keys[39]) {
      player.rotate = -6;
    }
    if (keyboard.keys && keyboard.keys[38]) {
      player.direction.add2(0, -1);
    }
    if (keyboard.keys && keyboard.keys[40]) {
      player.direction.add2(0, 1);
    }
    if (keyboard.keys && keyboard.keys[33]) {
      player.shot = 1;
    }

    unitManager.calculate();
    levelDraw.draw();
    unitManager.draw();
    levelDraw.renderMinimap();

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(this.animationLoop);
    }
  };

  init = () => {
    this.gl = ctx.init();
    this.canvas = ctx.canvas;

    this.canvas.addEventListener('click', () => {
      const vec = this.level.getRandomPos();
      unitManager.add(new Unit(vec.x, vec.y, Math.random() * 10));
    });

    this.level = new Level(64, 4, 0.3);

    keyboard.init();
    levelDraw.init();
    unitManager.init();

    this.camera = unitManager.player;

    this.animationLoop();
  };
}

const game = new Game();

export default game;

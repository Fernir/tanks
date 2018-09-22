import game from '../../game/game';
import gameMap from '../../data/data';
import Wall from '../wall';
import ObjectManager from './objectmanager';

class Base extends Wall {
  base = true;
}

class WallsManager extends ObjectManager {
  base = null;

  init = () => {
    for (let i = 0; i < gameMap.length; i++) {
      for (let j = 0; j < gameMap[i].length; j++) {
        if (gameMap[i][j] === 1) {
          this.add(new Wall(j * game.spriteSize, i * game.spriteSize));
        } else if (gameMap[i][j] === 33) {
          this.base = new Base(j * game.spriteSize, i * game.spriteSize);
          this.add(this.base);
        }
      }
    }
  };
}

const wallsManager = new WallsManager();

export default wallsManager;

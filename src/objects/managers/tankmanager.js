import {rand} from './../../game/helpers';
import game from '../../game/game';
import gameMap from '../../data/data';
import Tank from '../tank';
import ObjectManager from './objectmanager';

class Player extends Tank {
  speed = 2;
}

class TanksManager extends ObjectManager {
  player = null;

  init = () => {
    for (let i = 0; i < gameMap.length; i++) {
      for (let j = 0; j < gameMap[i].length; j++) {
        if (gameMap[i][j] === 9) {
          this.player = new Player();
          this.player.x = j * game.spriteSize;
          this.player.y = i * game.spriteSize;
          this.add(this.player);

          gameMap[i][j] = 0;
          break;
        } else if (gameMap[i][j] === 3) {
          this.add(new Tank(j * game.spriteSize, i * game.spriteSize, rand(1, 2)));
          gameMap[i][j] = 0;
        }
      }
    }
  };
}

const tanksManager = new TanksManager();

export default tanksManager;

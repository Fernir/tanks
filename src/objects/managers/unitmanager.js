import game from '../../game/game';
import Unit from '../unit';
import ObjectManager from './objectmanager';

class UnitManager extends ObjectManager {
  player = null;

  init = () => {
    this.player = new Unit();
    this.player.pos = game.level.getRandomPos();
    this.add(this.player);
  };
}

const unitManager = new UnitManager();

export default unitManager;

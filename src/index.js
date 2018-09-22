import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import game from './game/game';

import './main.scss';

class Game extends PureComponent {
  componentDidMount() {
    game.init();
  }

  render() {
    return (
      <canvas id="plot">Обновите браузер</canvas>
    );
  }
}

render(<Game/>, document.querySelector('.js-app'));

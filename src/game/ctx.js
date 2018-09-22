import game from './game';

class CTX {
  ctx = null;
  plot = null;

  init = () => {
    this.plot = document.getElementById('plot');
    this.ctx = this.plot.getContext('2d');
    this.plot.style.display = 'block';

    window.addEventListener('resize', this.update, false);

    this.update();

    return this.ctx;
  };

  update = () => {
    this.plot.width = game.gameWidth();
    this.plot.height = game.gameHeight();
  };
}

const ctx = new CTX();

export default ctx;

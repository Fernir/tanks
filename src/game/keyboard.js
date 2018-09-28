class Keyboard {
  keys = [];

  init = () => {
    window.addEventListener('keydown', (e) => {
      // e.preventDefault();
      this.keys[e.keyCode] = (String(e.type) === 'keydown');
    }, false);

    window.addEventListener('keyup', (e) => {
      this.keys[e.keyCode] = (String(e.type) === 'keydown');
    }, false);
  }
}

const keyboard = new Keyboard();

export default keyboard;

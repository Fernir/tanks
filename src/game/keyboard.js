export const MOVE_LEFT = 'left';
export const MOVE_RIGHT = 'right';
export const MOVE_UP = 'up';
export const MOVE_DOWN = 'down';


class Keyboard {
  moveKey = '';

  init = () => {
    window.addEventListener('keyup', (e) => {
      const intKey = (window.Event) ? e.which : e.charCode;
      if ([37, 38, 39, 40].indexOf(intKey) !== -1) {
        this.moveKey = '';
      }
    }, false);

    window.addEventListener('keydown', (e) => {
      const intKey = (window.Event) ? e.which : e.charCode;

      switch (intKey) {
        case 37: {
          this.moveKey = MOVE_LEFT;
          break;
        }
        case 39: {
          this.moveKey = 'right';
          break;
        }
        case 38: {
          this.moveKey = 'up';
          break;
        }
        case 40: {
          this.moveKey = 'down';
          break;
        }
        default: {
          this.moveKey = '';
        }
      }
    }, false);
  }
}

const keyboard = new Keyboard();

export default keyboard;

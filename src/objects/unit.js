import game from '../game/game';

import Texture from './../game/helpers/texture';

import GameObject from './gameobject';

export default class Unit extends GameObject {
  constructor(x = 0, y = 0, angle, speed = 0.5) {
    super(x, y, angle, speed);

    this.image = new Texture('/img/body.png', {wrap: game.gl.CLAMP_TO_EDGE});
    this.imageShadow = new Texture('/img/body_shadow.png', {wrap: game.gl.CLAMP_TO_EDGE});
  }

  calculate = () => {
    this.angle += this.rotate * (Math.PI / 180);

    const sinA = Math.sin(this.angle);
    const cosA = Math.cos(this.angle);

    const shadowOffset = 0.04;

    this.vel.set(
      (this.direction.x * cosA) + (this.direction.y * sinA),
      (this.direction.y * cosA) - (this.direction.x * sinA)
    ).mul(this.speed);

    game.level.collideUpdate(this, 80, false);
    this.collideObjects();

    this.pos.add(this.vel);

    this.shadowPos = this.pos.clone().add2(
      (cosA * shadowOffset) - (sinA * shadowOffset * 2),
      -(cosA * shadowOffset * 2) - (sinA * shadowOffset)
    );
  };

  draw = () => {
    game.gl.enable(game.gl.BLEND);

    game.gl.blendFunc(game.gl.DST_COLOR, game.gl.ZERO);
    this.render(game.camera, this.imageShadow, this.shaderShadow, this.shadowPos, [1.2, 1.2], this.angle);
    game.gl.blendFunc(game.gl.SRC_ALPHA, game.gl.ONE_MINUS_SRC_ALPHA);

    this.render(game.camera, this.image, this.shader, this.pos, this.size.toVec(), this.angle);
    game.gl.disable(game.gl.BLEND);
  };
}


import Phaser from 'phaser';

export default class Villain {
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'villain');
    this.sprite.setOrigin(0.5, 1.0);
    this.sprite.setDepth(10);
    this.sprite.setFlipX(true); // Faces left toward the hero
    this.sprite.setSize(52, 76);
    this.sprite.setOffset(4, 0);
    this.sprite.setCollideWorldBounds(true);

    this.swayTimer = 0;
  }

  update(delta) {
    // Slow idle sway
    this.swayTimer += delta * 0.002;
    this.sprite.rotation = Math.sin(this.swayTimer) * 0.03;
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }
}

import Phaser from 'phaser';

export default class Hero {
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'hero');
    this.sprite.setOrigin(0.5, 1.0);
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(36, 64);
    this.sprite.setOffset(6, 0);

    // Initialized to true so there is no landing squash on spawn
    this.wasOnGround = true;
    this.walkTimer = 0;
  }

  update(keys, delta) {
    const onGround = this.sprite.body.blocked.down || this.sprite.body.touching.down;

    // 1. Horizontal movement (A / D)
    if (keys.left.isDown) {
      this.sprite.setVelocityX(-200);
      this.sprite.setFlipX(true);
    } else if (keys.right.isDown) {
      this.sprite.setVelocityX(200);
      this.sprite.setFlipX(false);
    } else {
      this.sprite.setVelocityX(0);
    }

    // 2. Jumping (Space) - only when grounded
    if (Phaser.Input.Keyboard.JustDown(keys.space) && onGround) {
      this.sprite.setVelocityY(-450);
    }

    // 3. Landing squash animation
    if (!this.wasOnGround && onGround) {
      this.scene.tweens.killTweensOf(this.sprite);
      this.sprite.setScale(1.2, 0.8);
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 140,
        ease: 'Quad.easeOut'
      });
    }

    // 4. Walk bob and airborne rotation reset
    const isMovingHorizontally = keys.left.isDown || keys.right.isDown;
    if (onGround && isMovingHorizontally) {
      this.walkTimer += delta * 0.015;
      this.sprite.rotation = Math.sin(this.walkTimer) * 0.08;
    } else {
      // Reset rotation to 0 whenever airborne or idle on the ground
      this.sprite.rotation = 0;
      this.walkTimer = 0;
    }

    this.wasOnGround = onGround;
  }
}

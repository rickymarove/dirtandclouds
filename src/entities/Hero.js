import Phaser from 'phaser';
import { FIGHT_CONFIG } from '../data/fightConfig.js';

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

    // Combat state for Part E
    this.health = FIGHT_CONFIG.heroMaxHealth;
    this.isStunned = false;
    this.punchCooldown = false;
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
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

  updateFight(keys, delta, villainX) {
    // If not stunned, handle movement input (jump disabled)
    if (!this.isStunned) {
      if (keys.left.isDown) {
        this.sprite.setVelocityX(-FIGHT_CONFIG.heroSpeed);
      } else if (keys.right.isDown) {
        this.sprite.setVelocityX(FIGHT_CONFIG.heroSpeed);
      } else {
        this.sprite.setVelocityX(0);
      }

      // Always face villain (right)
      this.sprite.setFlipX(false);
    }

    // Clamp position every frame (including while stunned) to arena boundaries & separation
    this.sprite.x = Phaser.Math.Clamp(
      this.sprite.x,
      FIGHT_CONFIG.arenaMinX,
      villainX - FIGHT_CONFIG.minSeparation
    );
  }

  playPunchMotion() {
    this.scene.tweens.add({
      targets: this.sprite,
      angle: 12,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);

    // White flash
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    // Knockback velocity and stun
    this.isStunned = true;
    const knockbackVelocity = -(FIGHT_CONFIG.knockbackDistance / (FIGHT_CONFIG.knockbackDuration / 1000));
    this.sprite.setVelocityX(knockbackVelocity);

    this.scene.time.delayedCall(FIGHT_CONFIG.knockbackDuration, () => {
      if (this.isStunned) {
        this.sprite.setVelocityX(0);
      }
    });

    this.scene.time.delayedCall(FIGHT_CONFIG.stunDuration, () => {
      this.isStunned = false;
    });
  }
}

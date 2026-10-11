import Phaser from 'phaser';
import { FIGHT_CONFIG } from '../data/fightConfig.js';

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

    // Combat & AI state for Part E
    this.health = FIGHT_CONFIG.villainMaxHealth;
    this.aiState = 'IDLE'; // 'IDLE' | 'APPROACH' | 'WINDUP' | 'ATTACK' | 'BACKOFF' | 'STUNNED'
    this.attackCooldownTimer = 0;
  }

  update(delta) {
    // Slow idle sway (used during explore & dialogue only)
    this.swayTimer += delta * 0.002;
    this.sprite.rotation = Math.sin(this.swayTimer) * 0.03;
  }

  updateAI(delta, heroX, onAttackHit) {
    // Decrement attack cooldown timer
    this.attackCooldownTimer -= delta;

    // Always face the hero (left)
    this.sprite.setFlipX(true);

    // State machine logic
    if (this.aiState === 'APPROACH') {
      this.sprite.setVelocityX(-FIGHT_CONFIG.villainSpeed);

      const inReach = (this.x - heroX) <= (FIGHT_CONFIG.minSeparation + FIGHT_CONFIG.villainPunchReach);
      if (inReach && this.attackCooldownTimer <= 0) {
        // Start attack sequence
        this.attackCooldownTimer = FIGHT_CONFIG.villainAttackInterval;
        this.aiState = 'WINDUP';
        this.sprite.setVelocityX(0);

        // Telegraph flash
        this.sprite.setTint(0xffeb3b);

        this.scene.time.delayedCall(FIGHT_CONFIG.villainWindupDuration, () => {
          if (this.aiState === 'WINDUP') {
            this.sprite.clearTint();
            this.executePunch(heroX, onAttackHit);
          }
        });
      }
    } else if (this.aiState === 'WINDUP') {
      this.sprite.setVelocityX(0);
    } else if (this.aiState === 'BACKOFF') {
      this.sprite.setVelocityX(FIGHT_CONFIG.villainBackoffSpeed);
    }

    // Clamp position every frame (including while stunned) to arena boundaries & separation
    this.sprite.x = Phaser.Math.Clamp(
      this.sprite.x,
      heroX + FIGHT_CONFIG.minSeparation,
      FIGHT_CONFIG.arenaMaxX
    );
  }

  executePunch(heroX, onAttackHit) {
    this.aiState = 'ATTACK';

    // Punch tilt tween
    this.scene.tweens.add({
      targets: this.sprite,
      angle: -12,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    // Check if hero is still in reach (can be dodged by walking away)
    const inReach = (this.x - heroX) <= (FIGHT_CONFIG.minSeparation + FIGHT_CONFIG.villainPunchReach);
    if (inReach) {
      onAttackHit();
    }

    // Return to approach after attack motion
    this.scene.time.delayedCall(120, () => {
      if (this.aiState === 'ATTACK') {
        this.aiState = 'APPROACH';
      }
    });
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);

    // Clear telegraph tint if in wind-up
    this.sprite.clearTint();

    // White flash
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    // Stun with knockback velocity
    this.aiState = 'STUNNED';
    const knockbackVelocity = FIGHT_CONFIG.knockbackDistance / (FIGHT_CONFIG.knockbackDuration / 1000);
    this.sprite.setVelocityX(knockbackVelocity);

    this.scene.time.delayedCall(FIGHT_CONFIG.knockbackDuration, () => {
      if (this.aiState === 'STUNNED') {
        this.sprite.setVelocityX(0);
      }
    });

    // Transition from stun into BACKOFF
    this.scene.time.delayedCall(FIGHT_CONFIG.stunDuration, () => {
      if (this.aiState === 'STUNNED') {
        this.aiState = 'BACKOFF';
        this.scene.time.delayedCall(FIGHT_CONFIG.villainBackoffDuration, () => {
          if (this.aiState === 'BACKOFF') {
            this.aiState = 'APPROACH';
          }
        });
      }
    });
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }
}

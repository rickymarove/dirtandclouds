import Phaser from 'phaser';
import Hero from '../entities/Hero.js';
import Villain from '../entities/Villain.js';
import dialogueLines from '../data/dialogue.js';
import { FIGHT_CONFIG } from '../data/fightConfig.js';
import { playPunch, playHit, playWin, playLose } from '../utils/audio.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // 1. World and camera setup
    this.physics.world.setBounds(0, 0, 2400, 600);
    this.cameras.main.setBounds(0, 0, 2400, 600);
    this.cameras.main.setBackgroundColor('#87ceeb');
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // 2. Parallax clouds (Depth 0, scrollFactor 0.5)
    this.clouds = [];
    const cloudConfigs = [
      { x: 100, y: 70, speed: 18 },
      { x: 350, y: 130, speed: 22 },
      { x: 620, y: 80, speed: 16 },
      { x: 880, y: 150, speed: 24 },
      { x: 1140, y: 60, speed: 20 },
      { x: 1380, y: 120, speed: 19 },
      { x: 1600, y: 90, speed: 21 }
    ];

    cloudConfigs.forEach(cfg => {
      const cloud = this.add.image(cfg.x, cfg.y, 'cloud')
        .setScrollFactor(0.5)
        .setDepth(0);
      cloud.speed = cfg.speed;
      this.clouds.push(cloud);
    });

    // 3. Trees (Depth 1, scrollFactor 1.0, decorative only)
    const treeXPositions = [150, 420, 720, 1020, 1350, 1680, 1980, 2250];
    treeXPositions.forEach(x => {
      this.add.image(x, 480, 'tree')
        .setOrigin(0.5, 1.0)
        .setScrollFactor(1.0)
        .setDepth(1);
    });

    // 4. Solid dirt ground (Depth 2, 120 px tall, y = 480 to 600)
    this.ground = this.add.tileSprite(0, 480, 2400, 120, 'dirt')
      .setOrigin(0, 0)
      .setScrollFactor(1.0)
      .setDepth(2);

    this.physics.add.existing(this.ground, true);
    this.ground.body.setSize(2400, 120);
    this.ground.body.setOffset(0, 0);

    // 5. Input keys (A, D, Space)
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // 6. Entities (Depth 10, standing on dirt at y = 480)
    this.hero = new Hero(this, 100, 480);
    this.physics.add.collider(this.hero.sprite, this.ground);

    this.villain = new Villain(this, 2000, 480);
    this.physics.add.collider(this.villain.sprite, this.ground);

    // 7. Initial camera follow
    this.cameras.main.startFollow(this.hero.sprite, true, 0.08, 0.08);

    // 8. State machine setup
    this.state = 'explore'; // 'explore' | 'dialogue' | 'fight' | 'won' | 'lost'
    this.dialogueTriggered = false;
    this.dialogueInputLocked = false;
    this.dialogueIndex = 0;
    this.isTyping = false;
    this.typewriterTimer = null;

    // Fight state properties
    this.fightIntroActive = false;
    this.fightSpaceLocked = false;
    this.fightBanner = null;

    // 9. Dialogue UI (fixed viewport on the dirt at y = 492, h = 80)
    this.dialogueBox = this.add.rectangle(400, 532, 720, 80, 0x101018, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    this.speakerText = this.add.text(60, 500, '', {
      fontSize: '15px',
      fontStyle: 'bold',
      fontFamily: 'sans-serif'
    })
      .setScrollFactor(0)
      .setDepth(101)
      .setVisible(false);

    this.dialogueContentText = this.add.text(60, 524, '', {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      wordWrap: { width: 680 }
    })
      .setScrollFactor(0)
      .setDepth(101)
      .setVisible(false);

    // 10. Health Bars UI (depth 105, scrollFactor 0)
    // Hero Health Bar (Left)
    this.heroHealthBg = this.add.rectangle(150, 36, 224, 20, 0x111116)
      .setStrokeStyle(2, 0x444455)
      .setScrollFactor(0)
      .setDepth(105)
      .setVisible(false);

    this.heroLabel = this.add.text(40, 16, 'HERO', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#64b5f6',
      fontFamily: 'sans-serif'
    })
      .setScrollFactor(0)
      .setDepth(106)
      .setVisible(false);

    this.heroHealthBar = this.add.rectangle(40, 36, 220, 16, 0x4caf50)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(106)
      .setVisible(false);

    // Villain Health Bar (Right)
    this.villainHealthBg = this.add.rectangle(650, 36, 224, 20, 0x111116)
      .setStrokeStyle(2, 0x444455)
      .setScrollFactor(0)
      .setDepth(105)
      .setVisible(false);

    this.villainLabel = this.add.text(760, 16, 'VILLAIN', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ef5350',
      fontFamily: 'sans-serif'
    })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(106)
      .setVisible(false);

    this.villainHealthBar = this.add.rectangle(760, 36, 220, 16, 0xe53935)
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(106)
      .setVisible(false);

    // 11. Hint text at bottom of screen (y = 584)
    this.hintText = this.add.text(400, 584, '[Space] Jump', {
      fontSize: '13px',
      color: '#bbbbbb',
      fontFamily: 'sans-serif'
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110);

    // 12. Register cleanup handler for restart safety
    this.events.once('shutdown', this.cleanup, this);
  }

  update(time, delta) {
    // Parallax clouds drift and wrap
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed * (delta / 1000);
      if (cloud.x < -150) {
        cloud.x = 1750;
      }
    });

    // Idle sway only during explore and dialogue
    if (this.state === 'explore' || this.state === 'dialogue') {
      this.villain.update(delta);
    }

    // State machine update
    if (this.state === 'explore') {
      this.hero.update(this.keys, delta);

      // Trigger dialogue once when within 150 px
      if (!this.dialogueTriggered && Math.abs(this.hero.sprite.x - this.villain.x) <= 150) {
        this.startDialogue();
      }
    } else if (this.state === 'dialogue') {
      // Check JustDown(space) every frame to continuously drain input queue
      const spacePressed = Phaser.Input.Keyboard.JustDown(this.keys.space);

      // While 300ms lock is active, discard any Space press immediately
      if (this.dialogueInputLocked) {
        return;
      }

      if (spacePressed) {
        this.handleDialogueSpace();
      }
    } else if (this.state === 'fight') {
      // Draining JustDown(space) every frame during fight state
      const spacePressed = Phaser.Input.Keyboard.JustDown(this.keys.space);

      // Discard during intro or initial cooldown
      if (this.fightIntroActive || this.fightSpaceLocked) {
        return;
      }

      // Active fight update
      this.hero.updateFight(this.keys, delta, this.villain.x);
      this.villain.updateAI(delta, this.hero.x, () => this.handleVillainHit());

      // Space punch execution
      if (spacePressed && !this.hero.isStunned && !this.hero.punchCooldown) {
        this.hero.punchCooldown = true;
        this.time.delayedCall(FIGHT_CONFIG.heroPunchCooldown, () => {
          this.hero.punchCooldown = false;
        });

        playPunch();
        this.hero.playPunchMotion();

        // Distance-based hit check
        const dist = Math.abs(this.villain.x - this.hero.x);
        if (dist <= (FIGHT_CONFIG.minSeparation + FIGHT_CONFIG.heroPunchReach)) {
          this.handleHeroHit();
        }
      }
    }
  }

  startDialogue() {
    this.dialogueTriggered = true;
    this.state = 'dialogue';

    // Stop hero completely and lock controls
    this.hero.sprite.setVelocity(0, 0);
    this.hero.sprite.rotation = 0;

    // Stop camera follow and pan smoothly to x = 1925 over 500 ms
    this.cameras.main.stopFollow();
    this.cameras.main.pan(1925, 300, 500, 'Quad.easeOut');

    // 300 ms lock to prevent pre-dialogue jump presses from advancing line 1
    this.dialogueInputLocked = true;
    this.time.delayedCall(300, () => {
      this.dialogueInputLocked = false;
    });

    // Show dialogue box and start typing first line
    this.dialogueIndex = 0;
    this.dialogueBox.setVisible(true);
    this.speakerText.setVisible(true);
    this.dialogueContentText.setVisible(true);

    this.startTypingLine();
  }

  startTypingLine() {
    const currentLine = dialogueLines[this.dialogueIndex];
    this.speakerText.setText(currentLine.speaker);
    this.speakerText.setColor(currentLine.speaker === 'Villain' ? '#ef5350' : '#42a5f5');
    this.dialogueContentText.setText('');

    this.isTyping = true;
    this.updateHint();

    let charIndex = 0;
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }

    this.typewriterTimer = this.time.addEvent({
      delay: 30,
      callback: () => {
        charIndex++;
        this.dialogueContentText.setText(currentLine.text.substring(0, charIndex));
        if (charIndex >= currentLine.text.length) {
          this.finishTypingCurrentLine();
        }
      },
      repeat: currentLine.text.length - 1
    });
  }

  finishTypingCurrentLine() {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }
    const currentLine = dialogueLines[this.dialogueIndex];
    this.dialogueContentText.setText(currentLine.text);
    this.isTyping = false;
    this.updateHint();
  }

  handleDialogueSpace() {
    if (this.isTyping) {
      this.finishTypingCurrentLine();
    } else {
      this.dialogueIndex++;
      if (this.dialogueIndex < dialogueLines.length) {
        this.startTypingLine();
      } else {
        this.endDialogue();
      }
    }
  }

  endDialogue() {
    // Hide dialogue panel
    this.dialogueBox.setVisible(false);
    this.speakerText.setVisible(false);
    this.dialogueContentText.setVisible(false);

    this.startFight();
  }

  startFight() {
    this.state = 'fight';

    // Reset rotations to 0 for both characters
    this.hero.sprite.rotation = 0;
    this.villain.sprite.rotation = 0;

    // Show health bars
    this.heroHealthBg.setVisible(true);
    this.heroLabel.setVisible(true);
    this.heroHealthBar.setVisible(true);

    this.villainHealthBg.setVisible(true);
    this.villainLabel.setVisible(true);
    this.villainHealthBar.setVisible(true);

    this.updateHealthBars();
    this.updateHint();

    // Show "FIGHT" intro banner
    this.fightBanner = this.add.text(400, 240, 'FIGHT', {
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#ffeb3b',
      stroke: '#000000',
      strokeThickness: 6,
      fontFamily: 'sans-serif'
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    this.fightIntroActive = true;
    this.fightSpaceLocked = true;

    // 300 ms ignore Space after fight start
    this.time.delayedCall(FIGHT_CONFIG.spaceCooldownAfterDialogue, () => {
      this.fightSpaceLocked = false;
    });

    // 1000 ms intro duration: remove banner, enable attack
    this.time.delayedCall(FIGHT_CONFIG.fightIntroDuration, () => {
      if (this.fightBanner) {
        this.fightBanner.destroy();
        this.fightBanner = null;
      }
      this.fightIntroActive = false;
      this.villain.aiState = 'APPROACH';
    });
  }

  updateHealthBars() {
    const heroPct = Math.max(0, this.hero.health / FIGHT_CONFIG.heroMaxHealth);
    this.heroHealthBar.width = 220 * heroPct;

    const villainPct = Math.max(0, this.villain.health / FIGHT_CONFIG.villainMaxHealth);
    this.villainHealthBar.width = 220 * villainPct;
  }

  handleHeroHit() {
    if (this.state !== 'fight') return;

    const willDefeat = (this.villain.health - FIGHT_CONFIG.heroPunchDamage) <= 0;

    if (willDefeat) {
      playWin();
    } else {
      playHit();
    }

    this.villain.takeDamage(FIGHT_CONFIG.heroPunchDamage);
    this.cameras.main.shake(FIGHT_CONFIG.screenShakeDuration, FIGHT_CONFIG.screenShakeIntensity);
    this.updateHealthBars();

    if (willDefeat) {
      this.state = 'won';
      this.finishMatch('YOU WIN', '#4caf50');
    }
  }

  handleVillainHit() {
    if (this.state !== 'fight') return;

    const willDefeat = (this.hero.health - FIGHT_CONFIG.villainPunchDamage) <= 0;

    if (willDefeat) {
      playLose();
    } else {
      playHit();
    }

    this.hero.takeDamage(FIGHT_CONFIG.villainPunchDamage);
    this.cameras.main.shake(FIGHT_CONFIG.screenShakeDuration, FIGHT_CONFIG.screenShakeIntensity);
    this.updateHealthBars();

    if (willDefeat) {
      this.state = 'lost';
      this.finishMatch('YOU LOSE', '#e53935');
    }
  }

  finishMatch(text, color) {
    // Freeze movement and AI
    this.hero.sprite.setVelocity(0, 0);
    this.villain.sprite.setVelocity(0, 0);
    this.villain.aiState = 'IDLE';

    // Display outcome banner
    this.add.text(400, 240, text, {
      fontSize: '64px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 6,
      fontFamily: 'sans-serif'
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110);

    this.hintText.setText('');

    // Wait 1.2s so player absorbs final hit, then fade out and transition to EndScene
    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('EndScene', { result: this.state });
      });
    });
  }

  updateHint() {
    if (this.state === 'explore') {
      this.hintText.setText('[Space] Jump');
    } else if (this.state === 'dialogue') {
      this.hintText.setText(this.isTyping ? '[Space] Finish line' : '[Space] Next');
    } else if (this.state === 'fight') {
      this.hintText.setText('[Space] Punch');
    }
  }

  cleanup() {
    this.input.keyboard.removeAllKeys(true);
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }
    this.tweens.killAll();
  }
}

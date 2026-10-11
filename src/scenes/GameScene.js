import Phaser from 'phaser';
import Hero from '../entities/Hero.js';
import Villain from '../entities/Villain.js';
import dialogueLines from '../data/dialogue.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // 1. World and camera setup
    this.physics.world.setBounds(0, 0, 2400, 600);
    this.cameras.main.setBounds(0, 0, 2400, 600);
    this.cameras.main.setBackgroundColor('#87ceeb');

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
    this.state = 'explore'; // 'explore' | 'dialogue' | 'fight'
    this.dialogueTriggered = false;
    this.dialogueInputLocked = false;
    this.dialogueIndex = 0;
    this.isTyping = false;
    this.typewriterTimer = null;

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

    // 10. Hint text at bottom of screen (y = 584)
    this.hintText = this.add.text(400, 584, '[Space] Jump', {
      fontSize: '13px',
      color: '#bbbbbb',
      fontFamily: 'sans-serif'
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110);
  }

  update(time, delta) {
    // Parallax clouds drift and wrap
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed * (delta / 1000);
      if (cloud.x < -150) {
        cloud.x = 1750;
      }
    });

    // Idle sway on villain
    this.villain.update(delta);

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
      // First Space press finishes the line instantly
      this.finishTypingCurrentLine();
    } else {
      // Second Space press advances to next line
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

    // Switch to fight state
    this.state = 'fight';
    this.updateHint();

    // Display FIGHT banner
    this.add.text(400, 240, 'FIGHT', {
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
}

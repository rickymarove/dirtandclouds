import Phaser from 'phaser';

export default class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  init(data) {
    this.result = data && data.result ? data.result : 'won';
    this.canRestart = false;
  }

  create() {
    // 1. Background and camera fade-in
    this.cameras.main.setBackgroundColor('#101016');
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // 2. Keyboard input
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 3. Title text based on result
    const isWon = this.result === 'won';
    const titleText = isWon ? 'Victory' : 'Game over';
    const titleColor = isWon ? '#4caf50' : '#e53935';

    this.add.text(400, 250, titleText, {
      fontSize: '56px',
      fontStyle: 'bold',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 6,
      fontFamily: 'sans-serif'
    }).setOrigin(0.5);

    // 4. Subtitle prompt
    this.add.text(400, 340, 'Press Space to play again', {
      fontSize: '20px',
      color: '#e0e0e0',
      fontFamily: 'sans-serif'
    }).setOrigin(0.5);

    // 5. 500 ms Space lockout to ignore leftover presses
    this.canRestart = false;
    this.time.delayedCall(500, () => {
      this.canRestart = true;
    });

    // 6. Cleanup handler on shutdown
    this.events.once('shutdown', this.cleanup, this);
  }

  update() {
    // Continuously drain JustDown(space) every frame
    const spacePressed = Phaser.Input.Keyboard.JustDown(this.spaceKey);

    if (!this.canRestart) {
      return;
    }

    if (spacePressed) {
      // Lock input so no subsequent presses register during fade
      this.canRestart = false;

      // Fade out and restart from BootScene inside camerafadeoutcomplete
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BootScene');
      });
    }
  }

  cleanup() {
    this.input.keyboard.removeAllKeys(true);
    this.tweens.killAll();
  }
}

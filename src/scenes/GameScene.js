import Phaser from 'phaser';

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

    // 5. Temporary camera scrolling test (removed in Part C when hero is added)
    this.setupTestCameraControls();
  }

  update(time, delta) {
    // Drift clouds leftward and wrap around
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed * (delta / 1000);
      if (cloud.x < -150) {
        cloud.x = 1750;
      }
    });

    // Temporary camera controls update (removed in Part C)
    this.updateTestCameraControls(delta);
  }

  // --- Temporary Camera Test Controls (Part B only) ---
  setupTestCameraControls() {
    this.testKeys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  updateTestCameraControls(delta) {
    const scrollSpeed = 400; // px/sec
    if (this.testKeys.right.isDown) {
      this.cameras.main.scrollX += scrollSpeed * (delta / 1000);
    } else if (this.testKeys.left.isDown) {
      this.cameras.main.scrollX -= scrollSpeed * (delta / 1000);
    }
  }
}

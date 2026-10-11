import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#87ceeb');
    this.add.text(400, 300, 'Part A works', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'sans-serif'
    }).setOrigin(0.5);
  }
}

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import EndScene from './scenes/EndScene.js';
import './style.css';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },
  scene: [BootScene, GameScene, EndScene]
};

new Phaser.Game(config);

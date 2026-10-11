import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    if (!this.textures.exists('dirt')) {
      this.createDirtTexture();
    }
    if (!this.textures.exists('cloud')) {
      this.createCloudTexture();
    }
    if (!this.textures.exists('tree')) {
      this.createTreeTexture();
    }
    if (!this.textures.exists('hero')) {
      this.createHeroTexture();
    }
    if (!this.textures.exists('villain')) {
      this.createVillainTexture();
    }

    this.scene.start('GameScene');
  }

  createDirtTexture() {
    const g = this.make.graphics({ add: false });

    // Base dirt
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(0, 0, 64, 120);

    // Grass top edge - 12 px tall
    g.fillStyle(0x4caf50, 1);
    g.fillRect(0, 0, 64, 12);

    // Darker speckles
    g.fillStyle(0x3e2723, 1);
    const speckles = [
      [8, 24, 3, 3],
      [24, 40, 4, 3],
      [44, 20, 3, 4],
      [14, 65, 3, 3],
      [36, 75, 4, 2],
      [52, 58, 3, 3],
      [20, 95, 4, 3],
      [42, 105, 3, 4],
      [6, 110, 3, 3],
      [56, 90, 4, 3]
    ];
    speckles.forEach(([x, y, w, h]) => {
      g.fillRect(x, y, w, h);
    });

    g.generateTexture('dirt', 64, 120);
    g.destroy();
  }

  createCloudTexture() {
    const g = this.make.graphics({ add: false });

    // Fully opaque (alpha 1) overlapping circles to avoid visible seams
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(10, 20, 100, 24, 12);
    g.fillCircle(30, 28, 18);
    g.fillCircle(55, 20, 22);
    g.fillCircle(80, 22, 20);
    g.fillCircle(100, 30, 15);

    g.generateTexture('cloud', 120, 50);
    g.destroy();
  }

  createTreeTexture() {
    const g = this.make.graphics({ add: false });

    // Brown trunk
    g.fillStyle(0x5d4037, 1);
    g.fillRect(33, 65, 14, 65);

    // Green round canopy (overlapping circles)
    g.fillStyle(0x2e7d32, 1);
    g.fillCircle(40, 42, 34);
    g.fillCircle(25, 48, 22);
    g.fillCircle(55, 48, 22);

    // Lighter green highlight
    g.fillStyle(0x388e3c, 1);
    g.fillCircle(38, 36, 26);
    g.fillCircle(48, 42, 18);

    g.generateTexture('tree', 80, 130);
    g.destroy();
  }

  createHeroTexture() {
    const data = [
      '....HHHH....',
      '...HHHHHH...',
      '...HHSSHH...',
      '...SESSES...',
      '...SSSSSS...',
      '....SSSS....',
      '..BBBBBBBB..',
      '.BBBBBBBBBB.',
      '.BBBBBBBBBB.',
      '.SSBBBBBBSS.',
      '...PPPPPP...',
      '...PPPPPP...',
      '...PP..PP...',
      '...PP..PP...',
      '...FF..FF...',
      '..FFF..FFF..'
    ];

    this.textures.generate('hero', {
      data,
      pixelWidth: 4,
      pixelHeight: 4,
      palette: {
        H: '#3e2723',
        S: '#f7c59f',
        E: '#1a1a1a',
        B: '#1976d2',
        P: '#263238',
        F: '#111111'
      }
    });
  }

  createVillainTexture() {
    const data = [
      '.....HHHHH.....',
      '....HHHHHHH....',
      '....HHSSSHH....',
      '....SESSSES....',
      '....SSSSSSS....',
      '.....SSSSS.....',
      '...SSSSSSSSS...',
      '..SSSSSSSSSSS..',
      '..SSSSSSSSSSS..',
      '.SSSSSSSSSSSSS.',
      '.SSSSSSSSSSSSS.',
      '..BBBBBBBBBBB..',
      '..RRRRRRRRRRR..',
      '..RRRR...RRRR..',
      '..RRRR...RRRR..',
      '..RRRR...RRRR..',
      '..FFFF...FFFF..',
      '.FFFFF...FFFFF.',
      '.FFFFF...FFFFF.'
    ];

    this.textures.generate('villain', {
      data,
      pixelWidth: 4,
      pixelHeight: 4,
      palette: {
        H: '#212121',
        S: '#e0a97a',
        E: '#111111',
        R: '#8b1e1e',
        B: '#263238',
        F: '#1a1a1a'
      }
    });
  }
}

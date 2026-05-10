const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  pixelArt: true,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: [TitleScene, Level1Scene, SPY500, AllTimeHighs]
};

const game = new Phaser.Game(config);

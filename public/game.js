const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  pixelArt: true,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: [TitleScene, Level1Scene, SPY500 ]
};

const game = new Phaser.Game(config);

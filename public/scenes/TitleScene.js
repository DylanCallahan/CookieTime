class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const cx = this.scale.width / 2;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(cx, 200, 'COOKIETIME', {
      fontSize: '72px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, 290, 'a game about me', {
      fontSize: '20px',
      fill: '#555577'
    }).setOrigin(0.5);

    this.createButton(cx, 400, 'All Time Highs', () => {
      this.scene.start('AllTimeHighs');
    });

    this.createButton(cx, 480, 'About Me', () => {
      this.scene.start('Aboutme');
    });
  }

  createButton(x, y, label, onClick) {
    const btn = this.add.rectangle(x, y, 280, 55, 0x333366)
      .setInteractive()
      .on('pointerover', () => btn.setFillStyle(0x5555aa))
      .on('pointerout', () => btn.setFillStyle(0x333366))
      .on('pointerdown', onClick);

    this.add.text(x, y, label, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }
}
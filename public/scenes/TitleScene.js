class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Background color
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title text
    this.add.text(cx, 120, 'MY GAME', {
      fontSize: '64px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, 190, 'Choose a level to start', {
      fontSize: '20px',
      fill: '#aaaaaa'
    }).setOrigin(0.5);

    // Level 1 button
    this.createButton(cx, 280, 'Level 1', () => {
      this.scene.start('Level1Scene');
    });

    // stock market button
    this.createButton(cx, 360, 'Level 2', () => {
      this.scene.start('SPY500');
    });
  }

  createButton(x, y, label, onClick) {
    const btn = this.add.rectangle(x, y, 220, 55, 0x333366)
      .setInteractive()
      .on('pointerover', () => btn.setFillStyle(0x5555aa))   // hover
      .on('pointerout', () => btn.setFillStyle(0x333366))    // unhover
      .on('pointerdown', onClick);                            // click

    this.add.text(x, y, label, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }
}
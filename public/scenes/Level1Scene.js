class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1Scene' });
  }

  preload() {
    this.load.image('player', 'assets/images/player.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Level label
    this.add.text(16, 16, 'Level 1', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // Back to title button
    const back = this.add.text(16, 460, '← Title', {
      fontSize: '16px',
      fill: '#aaaaaa'
    }).setInteractive()
      .on('pointerover', () => back.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => back.setStyle({ fill: '#aaaaaa' }))
      .on('pointerdown', () => this.scene.start('TitleScene'));

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    const ground = this.add.rectangle(400, 490, 800, 20, 0x00ff88);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);

    const p1 = this.add.rectangle(200, 360, 150, 15, 0x00ff88);
    this.physics.add.existing(p1, true);
    this.platforms.add(p1);

    const p2 = this.add.rectangle(550, 250, 150, 15, 0x00ff88);
    this.physics.add.existing(p2, true);
    this.platforms.add(p2);

    // Player
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);

    this.physics.add.collider(this.player, this.platforms);
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const onGround = this.player.body.blocked.down;

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-220);
      this.player.angle -= 4;
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(220);
      this.player.angle += 4;
    } else {
      this.player.body.setVelocityX(0);
    }

    if (this.cursors.up.isDown && onGround) {
      this.player.body.setVelocityY(-550);
    }
  }
}
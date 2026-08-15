class AboutMe extends Phaser.Scene {
  constructor() {
    super({ key: 'AboutMe' });
  }

  preload() {
    this.load.image('player', 'assets/images/player.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.physics.world.setBounds(0, 0, 1920, 1080);
    this.cameras.main.setBounds(0, 0, 1920, 1080);

    // Ground
    const ground = this.add.rectangle(960, 1060, 1920, 20, 0x333355);
    this.physics.add.existing(ground, true);

    // Player
    this.player = this.physics.add.sprite(200, 980, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(3);
    this.physics.add.collider(this.player, ground);

    // Placeholder text
    this.add.text(960, 400, 'About Me', {
      fontSize: '64px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(960, 500, 'Coming soon...', {
      fontSize: '24px',
      fill: '#555577'
    }).setOrigin(0.5).setScrollFactor(0);

    // Back button
    const back = this.add.text(40, 40, '← Title', {
      fontSize: '18px',
      fill: '#aaaaaa'
    }).setScrollFactor(0).setInteractive()
      .on('pointerover', () => back.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => back.setStyle({ fill: '#aaaaaa' }))
      .on('pointerdown', () => this.scene.start('TitleScene'));

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  update() {
    const onGround = this.player.body.blocked.down;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-300);
      this.player.angle -= 4;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(300);
      this.player.angle += 4;
    } else {
      this.player.body.setVelocityX(0);
    }

    if ((this.cursors.up.isDown || this.wasd.up.isDown) && onGround) {
      this.player.body.setVelocityY(-600);
    }
  }
}
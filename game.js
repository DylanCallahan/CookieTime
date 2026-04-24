const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, cursors, platforms;

function preload() {
  // Load assets here later (sprites, tiles, etc.)
}

function create() {
  // Ground platform
  platforms = this.physics.add.staticGroup();
  const ground = this.add.rectangle(400, 490, 800, 20, 0x00ff88);
  this.physics.add.existing(ground, true);
  platforms.add(ground);

  // Floating platforms
  const p1 = this.add.rectangle(200, 360, 150, 15, 0x00ff88);
  this.physics.add.existing(p1, true);
  platforms.add(p1);

  const p2 = this.add.rectangle(550, 250, 150, 15, 0x00ff88);
  this.physics.add.existing(p2, true);
  platforms.add(p2);

  // Player
  player = this.add.rectangle(100, 400, 32, 48, 0xff6b6b);
  this.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);

  // Collisions
  this.physics.add.collider(player, platforms);

  // Keyboard input
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  const onGround = player.body.blocked.down;

  if (cursors.left.isDown) {
    player.body.setVelocityX(-220);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(220);
  } else {
    player.body.setVelocityX(0);
  }

  if (cursors.up.isDown && onGround) {
    player.body.setVelocityY(-550);
  }
}
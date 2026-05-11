class AllTimeHighs extends Phaser.Scene {
  constructor() {
    super({ key: 'AllTimeHighs' });

    // Game state
    this.candleData = [];
    this.currentCandleIndex = 0;
    this.player = null;
    this.health = 100;
    this.platforms = null;
    this.volumeBars = null;
    this.items = null;

    // Map settings
    this.candleWidth = 40;
    this.candleSpacing = 60;
    this.mapHeight = 5000;      // total map height
    this.priceMin = 0;
    this.priceMax = 0;

    // Health tiers
    this.healthTier = 'healthy'; // healthy, tired, critical

    // Difficulty / timespan
    this.timespan = 'minute';   // will be chosen at start
    this.multiplier = 1;        // 1, 5, 15, 30, 60
  }

  preload() {
    this.load.image('player', 'assets/images/player.png');
  }

  create() {
  this.cameras.main.setBackgroundColor('#0d0d1f');
  this.showDifficultySelect();
  }

  showDifficultySelect() {
    const cx = 400;

    this.add.text(cx, 150, 'All Time Highs', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(cx, 220, 'Select candle interval:', {
      fontSize: '20px',
      fill: '#aaaaaa'
    }).setOrigin(0.5).setScrollFactor(0);

    const difficulties = [
      { label: '1 Minute', multiplier: 1 },
      { label: '5 Minute', multiplier: 5 },
      { label: '15 Minute', multiplier: 15 },
      { label: '30 Minute', multiplier: 30 },
      { label: '1 Hour', multiplier: 60 }
    ];

    difficulties.forEach((diff, i) => {
      this.createButton(cx, 290 + i * 65, diff.label, () => {
        this.multiplier = diff.multiplier;
        this.startGame();
      });
    });

    // Back button
    const back = this.add.text(16, 460, '← Title', {
      fontSize: '16px',
      fill: '#aaaaaa'
    }).setScrollFactor(0).setInteractive()
      .on('pointerover', () => back.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => back.setStyle({ fill: '#aaaaaa' }))
      .on('pointerdown', () => this.scene.start('TitleScene'));
  }

  createButton(x, y, label, onClick) {
    const btn = this.add.rectangle(x, y, 220, 50, 0x333366)
      .setInteractive()
      .setScrollFactor(0)
      .on('pointerover', () => btn.setFillStyle(0x5555aa))
      .on('pointerout', () => btn.setFillStyle(0x333366))
      .on('pointerdown', onClick);

    this.add.text(x, y, label, {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);
  }

  async startGame() {
    // Clear difficulty screen
    this.children.removeAll();

    // Loading text
    const loadingText = this.add.text(400, 250, 'Loading market data...', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    // Get previous trading day
    const date = this.getPreviousTradingDay();
    console.log('Day of week:', new Date(date).getDay()); // 0=Sun, 6=Sat, 5=Fri
    console.log('Date:', date);


    try {
      const IS_LOCAL = window.location.hostname === 'localhost'; //local hard testing type 
      const url = IS_LOCAL
        ? `https://api.polygon.io/v2/aggs/ticker/SPY/range/${this.multiplier}/minute/${date}/${date}?adjusted=true&sort=asc&apiKey=RGE5S8gE8404zfRAiSRBp3itDJgpK2Ex`
        : `/api/candles?symbol=SPY&timespan=minute&multiplier=${this.multiplier}&date=${date}`;

      const res = await fetch(url);
      const data = await res.json();
      console.log('Full API response:', data);
    console.log('Date being fetched:', date);
    console.log('URL being called:', url);

      console.log('Candle data:', data);

      if (!data.results || data.results.length === 0) {
        loadingText.setText('No data available, try another day');
        return;
      }

      this.candleData = data.results;
      loadingText.destroy();
      this.buildMap();

    } catch (err) {
      loadingText.setText('Failed to load data');
      console.error(err);
    }
  }

  getPreviousTradingDay() {
   const now = new Date();
  // Use local date parts to avoid UTC timezone shift
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  date.setDate(date.getDate() - 1);

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() - 1);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  }

 buildMap() {
  const totalWidth = 100 + this.candleData.length * this.candleSpacing + 200;
  const totalHeight = this.mapHeight;

  // Set world and camera to full map size
  this.physics.world.setBounds(0, 0, totalWidth, totalHeight);
  this.cameras.main.setBounds(0, 0, totalWidth, totalHeight);

  const chartTop = 200;
  const chartBottom = totalHeight - 300;
  const volumeAreaTop = totalHeight - 280;
  const volumeAreaBottom = totalHeight - 50;
  const volumeAreaHeight = volumeAreaBottom - volumeAreaTop;

  // Get price range
  const prices = this.candleData.flatMap(c => [c.h, c.l]);
  this.priceMin = Math.min(...prices);
  this.priceMax = Math.max(...prices);

  const maxVol = Math.max(...this.candleData.map(c => c.v));

  this.platforms = this.physics.add.staticGroup();
  this.volumeBars = this.physics.add.staticGroup();
  this.items = this.physics.add.staticGroup();

  this.candleData.forEach((candle, i) => {
    const x = 100 + i * this.candleSpacing;

    const highY = this.priceToY(candle.h, chartTop, chartBottom);
    const lowY = this.priceToY(candle.l, chartTop, chartBottom);
    const openY = this.priceToY(candle.o, chartTop, chartBottom);
    const closeY = this.priceToY(candle.c, chartTop, chartBottom);

    const isGreen = candle.c >= candle.o;
    const bodyColor = isGreen ? 0x00ff88 : 0xff4444;
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.max(Math.abs(closeY - openY), 6);

    // Wick
    const wickHeight = Math.max(lowY - highY, 4);
    const wick = this.add.rectangle(
      x,
      highY + wickHeight / 2,
      3,
      wickHeight,
      0xffffff
    );
    this.physics.add.existing(wick, true);
    this.platforms.add(wick);

    // Candle body
    const body = this.add.rectangle(
      x,
      bodyTop + bodyHeight / 2,
      this.candleWidth,
      bodyHeight,
      bodyColor
    );
    this.physics.add.existing(body, true);
    this.platforms.add(body);

    // Volume bar
    const volHeight = Math.max((candle.v / maxVol) * volumeAreaHeight, 4);
    const volY = volumeAreaBottom - volHeight / 2;
    const volBar = this.add.rectangle(
      x,
      volY,
      this.candleWidth - 4,
      volHeight,
      isGreen ? 0x00aa55 : 0xaa2222
    );
    this.physics.add.existing(volBar, true);
    this.volumeBars.add(volBar);

    // Volume spike item
    if (i > 0) {
      const prevVol = this.candleData[i - 1].v;
      if (candle.v > prevVol * 1.2) {
        this.spawnItem(x, bodyTop - 40, isGreen);
      }
    }
  });

  // Spawn player at first candle low
  const startX = 100;
  const startY = this.priceToY(this.candleData[0].h, chartTop, chartBottom) - 60;
  this.player = this.physics.add.sprite(startX, startY, 'player');
  this.player.setCollideWorldBounds(true);
  this.player.setScale(2);

  this.physics.add.collider(this.player, this.platforms);
  this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

  // Camera follows player in both X and Y
  this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

  this.buildUI();
  this.cursors = this.input.keyboard.createCursorKeys();
this.wasd = {
  up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
  left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
  down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
  right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  this.lastY = this.player.y;
}

  priceToY(price, chartTop, chartBottom) {
    const range = this.priceMax - this.priceMin;
    const ratio = (this.priceMax - price) / range;
    return chartTop + ratio * (chartBottom - chartTop);
  }

  spawnItem(x, y, isGreen) {
    const color = isGreen ? 0xffdd00 : 0x9900ff;
    const item = this.add.circle(x, y, 10, color);
    this.physics.add.existing(item, true);
    this.items.add(item);
  }

  buildUI() {
    // Health bar background
    this.add.rectangle(110, 30, 204, 24, 0x333333)
      .setScrollFactor(0);

    this.healthBar = this.add.rectangle(110, 30, 200, 20, 0x00ff88)
      .setScrollFactor(0);

    this.add.text(16, 20, 'HP', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setScrollFactor(0);

    this.healthText = this.add.text(400, 16, 'SPY — All Time Highs', {
      fontSize: '16px',
      fill: '#aaaaaa'
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Back button
    const back = this.add.text(700, 16, '← Exit', {
      fontSize: '16px',
      fill: '#aaaaaa'
    }).setScrollFactor(0).setInteractive()
      .on('pointerover', () => back.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => back.setStyle({ fill: '#aaaaaa' }))
      .on('pointerdown', () => this.scene.start('TitleScene'));
  }

  updateHealthBar() {
    const width = (this.health / 100) * 200;
    this.healthBar.setSize(width, 20);

    if (this.health > 74) {
      this.healthBar.setFillStyle(0x00ff88);
      this.healthTier = 'healthy';
    } else if (this.health > 39) {
      this.healthBar.setFillStyle(0xffdd00);
      this.healthTier = 'tired';
    } else {
      this.healthBar.setFillStyle(0xff4444);
      this.healthTier = 'critical';
    }

    if (this.health <= 0) {
      this.playerDeath();
    }
  }

  playerDeath() {
    this.physics.pause();
    this.add.text(400, 250, 'YOU DIED', {
      fontSize: '64px',
      fill: '#ff4444'
    }).setOrigin(0.5).setScrollFactor(0);

    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }

  collectItem(player, item) {
    const isGood = item.fillColor === 0xffdd00;
    item.destroy();
    if (isGood) {
      this.health = Math.min(100, this.health + 15);
    } else {
      this.health = Math.max(0, this.health - 20);
    }
    this.updateHealthBar();
  }

update() {
  if (!this.player || !this.cursors) return;

  const onGround = this.player.body.blocked.down;

  const jumpPower = this.healthTier === 'healthy' ? -550
    : this.healthTier === 'tired' ? -450
    : -350;

  const speed = this.healthTier === 'healthy' ? 220
    : this.healthTier === 'tired' ? 180
    : 140;

  // Left
  if (this.cursors.left.isDown || this.wasd.left.isDown) {
    this.player.body.setVelocityX(-speed);
    this.player.angle -= 4;
  // Right
  } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
    this.player.body.setVelocityX(speed);
    this.player.angle += 4;
  } else {
    this.player.body.setVelocityX(0);
  }

  // Jump
  if ((this.cursors.up.isDown || this.wasd.up.isDown) && onGround) {
    this.player.body.setVelocityY(jumpPower);
  }

  // Fall damage
  if (onGround && this.lastY < this.player.y) {
    const fallDistance = this.player.y - this.lastY;
    if (fallDistance > 150) {
      const damage = Math.floor(fallDistance / 50);
      this.health = Math.max(0, this.health - damage);
      this.updateHealthBar();
    }
  }

  if (!onGround) {
    this.lastY = this.player.y;
  }

  // Item collection
  this.physics.overlap(this.player, this.items, this.collectItem, null, this);
}
}
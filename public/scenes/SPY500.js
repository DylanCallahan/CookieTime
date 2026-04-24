class SPY500 extends Phaser.Scene {
  constructor() {
    super({ key: 'SPY500' });
    this.priceHistory = [];
    this.maxPoints = 50;        // max points before graph scrolls
  }

  preload() {
    this.load.image('player', 'assets/images/player.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(400, 30, 'S&P 500 Live Tracker', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Price display
    this.priceText = this.add.text(400, 70, 'Loading...', {
      fontSize: '20px',
      fill: '#00ff88'
    }).setOrigin(0.5);

    // Timer display — shows time of each update
    this.timerText = this.add.text(400, 95, '', {
      fontSize: '13px',
      fill: '#555577'
    }).setOrigin(0.5);

    // Chart graphics
    this.chartGraphics = this.add.graphics();

    // Back button
    const back = this.add.text(16, 460, '← Title', {
      fontSize: '16px',
      fill: '#aaaaaa'
    }).setInteractive()
      .on('pointerover', () => back.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => back.setStyle({ fill: '#aaaaaa' }))
      .on('pointerdown', () => this.scene.start('TitleScene'));

    // Fetch immediately then every 30 seconds
    this.fetchPrice();
    this.time.addEvent({
      delay: 30000,
      callback: this.fetchPrice,
      callbackScope: this,
      loop: true
    });
  }

  async fetchPrice() {
    try {
      const res = await fetch(
        `'/api/stocks?symbol=SPY` //yoink spy from api via custom key routing
      );
      const quote = await res.json();
      console.log('Quote:', quote);

      if (!quote.c) return;

      // Record timestamp and price
      const now = new Date();
      const timeLabel = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Add to history, cap at maxPoints
      this.priceHistory.push({ price: quote.c, time: timeLabel });
      if (this.priceHistory.length > this.maxPoints) {
        this.priceHistory.shift();  // remove oldest point
      }

      // Update price display
      const change = quote.c - quote.pc;
      const changePercent = ((change / quote.pc) * 100).toFixed(2);
      const arrow = change >= 0 ? '▲' : '▼';
      const color = change >= 0 ? '#00ff88' : '#ff4444';

      this.priceText.setText(
        `SPY $${quote.c.toFixed(2)}  ${arrow} ${changePercent}%`
      );
      this.priceText.setStyle({ fill: color });
      this.timerText.setText(`Last updated: ${timeLabel}`);

      this.drawChart();

    } catch (err) {
      this.priceText.setText('Failed to load price');
      console.error('API error:', err);
    }
  }

  drawChart() {
    this.chartGraphics.clear();

    const data = this.priceHistory;

    // Chart boundaries
    const x1 = 60, x2 = 760;
    const y1 = 120, y2 = 430;
    const chartW = x2 - x1;
    const chartH = y2 - y1;

    // Background
    this.chartGraphics.fillStyle(0x0d0d1f);
    this.chartGraphics.fillRect(x1, y1, chartW, chartH);

    // If only 1 point, just show background and wait
    if (data.length < 2) {
      this.add.text(400, 275, 'Waiting for data points...', {
        fontSize: '14px',
        fill: '#555577'
      }).setOrigin(0.5);
      return;
    }

    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.9995;  // slight padding
    const maxPrice = Math.max(...prices) * 1.0005;
    const priceRange = maxPrice - minPrice;

    // Grid lines
    this.chartGraphics.lineStyle(1, 0x333355, 0.8);
    for (let i = 0; i <= 4; i++) {
      const y = y1 + (chartH / 4) * i;
      this.chartGraphics.lineBetween(x1, y, x2, y);

      const price = maxPrice - (priceRange / 4) * i;
      this.add.text(x1 - 8, y, `$${price.toFixed(2)}`, {
        fontSize: '11px',
        fill: '#666688'
      }).setOrigin(1, 0.5);
    }

    // Determine color based on first vs latest price
    const isPositive = prices[prices.length - 1] >= prices[0];
    const lineColor = isPositive ? 0x00ff88 : 0xff4444;

    // Draw fill under line first
    this.chartGraphics.beginPath();
    prices.forEach((price, i) => {
      const x = x1 + (i / (this.maxPoints - 1)) * chartW;
      const y = y2 - ((price - minPrice) / priceRange) * chartH;
      if (i === 0) {
        this.chartGraphics.moveTo(x, y);
      } else {
        this.chartGraphics.lineTo(x, y);
      }
    });
    const lastX = x1 + ((prices.length - 1) / (this.maxPoints - 1)) * chartW;
    this.chartGraphics.lineTo(lastX, y2);
    this.chartGraphics.lineTo(x1, y2);
    this.chartGraphics.closePath();
    this.chartGraphics.fillStyle(lineColor, 0.15);
    this.chartGraphics.fillPath();

    // Draw price line on top
    this.chartGraphics.lineStyle(2, lineColor, 1);
    this.chartGraphics.beginPath();
    prices.forEach((price, i) => {
      const x = x1 + (i / (this.maxPoints - 1)) * chartW;
      const y = y2 - ((price - minPrice) / priceRange) * chartH;
      if (i === 0) {
        this.chartGraphics.moveTo(x, y);
      } else {
        this.chartGraphics.lineTo(x, y);
      }
    });
    this.chartGraphics.strokePath();

    // Dot on latest price point
    const latestX = x1 + ((prices.length - 1) / (this.maxPoints - 1)) * chartW;
    const latestY = y2 - ((prices[prices.length - 1] - minPrice) / priceRange) * chartH;
    this.chartGraphics.fillStyle(lineColor, 1);
    this.chartGraphics.fillCircle(latestX, latestY, 4);
  }

  update() {}
}
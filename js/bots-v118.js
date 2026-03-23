/* ============================================
   CHEMVENTUR v118 - FUN BOTS! 🤖
   Reporter, Religious, Homeless, Lover bots!
   Built with love for Pumpkin 🎃💚
   ============================================ */

(function() {

  CHEMVENTUR.Bots = {
    bots: [],
    enabled: false,
    lastUpdate: 0,
    updateInterval: 100, // 100ms tick
    messageQueue: [],     // on-screen bot messages
    MESSAGE_DURATION: 4000,

    // ===== HEADLINES for Reporter =====
    HEADLINES: [
      "BREAKING: Scientists discover new element made entirely of vibes",
      "EXCLUSIVE: Local atom refuses to bond, cites 'personal space'",
      "SHOCKING: Electron caught orbiting the wrong nucleus",
      "UPDATE: Proton and neutron confirm they are 'just friends'",
      "ALERT: Black hole spotted eating leftover quarks",
      "LIVE: Hydrogen wins 'Most Basic Element' award again",
      "REPORT: Carbon dating app reaches 1 billion users",
      "NEWS: Helium prices rise, party balloons in crisis",
      "FLASH: Neutron star files noise complaint against pulsar",
      "SCOOP: Gold nucleus admits it peaked in the periodic table",
      "URGENT: Antimatter protest — 'We matter too!'",
      "TRENDING: Oxygen and Hydrogen's water merger approved",
      "DEVELOPING: Uranium enrichment classes now online",
      "SPECIAL: Nobel Prize awarded to electron for outstanding orbit",
      "OPINION: Is fusion the future? Two atoms weigh in",
      "WEATHER: Electron cloud coverage at 100% today",
      "SPORTS: Proton wins heavyweight championship vs Neutron",
      "TECH: New quantum computer runs on pure confusion",
      "POLITICS: Photon party promises transparency",
      "CULTURE: String theory band releases debut vibration album"
    ],

    // ===== QUOTES for Religious bot =====
    QUOTES: [
      { text: "Peace comes from within. Do not seek it without.", source: "Buddhism" },
      { text: "Love thy neighbor as thyself.", source: "Christianity" },
      { text: "The soul is neither born, nor does it die.", source: "Hinduism" },
      { text: "Kindness is a mark of faith.", source: "Islam" },
      { text: "What is hateful to you, do not do to others.", source: "Judaism" },
      { text: "An eye for an eye makes the whole world blind.", source: "Mahatma Gandhi" },
      { text: "The Way that can be told is not the eternal Way.", source: "Taoism" },
      { text: "Happiness is not something readymade. It comes from your actions.", source: "Dalai Lama" },
      { text: "There is no wealth like knowledge, no poverty like ignorance.", source: "Ali ibn Abi Talib" },
      { text: "In the beginning was the Word.", source: "Christianity" },
      { text: "Truth is one; sages call it by various names.", source: "Hinduism (Rig Veda)" },
      { text: "Do not dwell in the past, do not dream of the future.", source: "Buddhism" },
      { text: "God is love, and whoever abides in love abides in God.", source: "Christianity" },
      { text: "The wound is the place where the Light enters you.", source: "Rumi (Sufism)" },
      { text: "Before you speak, let your words pass through three gates: Is it true? Is it necessary? Is it kind?", source: "Sufism" }
    ],

    // ===== INIT =====
    init() {
      console.log('🤖 Initializing Fun Bots...');
      this.bots = [];
      this.messageQueue = [];
      this.enabled = true;
      console.log('✅ Fun Bots system ready!');
    },

    // ===== SPAWN INDIVIDUAL BOTS =====
    spawnReporter() {
      const game = CHEMVENTUR.Game;
      const bot = {
        id: 'reporter_' + Date.now(),
        type: 'reporter',
        emoji: '📰',
        name: 'Reporter Bot',
        color: '#ffaa00',
        x: Math.random() * (game.width - 100) + 50,
        y: Math.random() * (game.height - 200) + 50,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 14,
        lastHeadline: 0,
        headlineInterval: 60000, // 1 minute
        headlineIndex: 0,
        lastScreenshot: 0
      };
      this.bots.push(bot);
      CHEMVENTUR.UI?.showStatus('📰 Reporter Bot deployed!');
      return bot;
    },

    spawnReligious() {
      const game = CHEMVENTUR.Game;
      const bot = {
        id: 'religious_' + Date.now(),
        type: 'religious',
        emoji: '⛪',
        name: 'Peace Bot',
        color: '#ffccff',
        x: Math.random() * (game.width - 100) + 50,
        y: Math.random() * (game.height - 200) + 50,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: 14,
        lastQuote: 0,
        quoteInterval: 15000, // every 15 seconds
        quoteIndex: 0,
        phase: Math.random() * Math.PI * 2, // for gentle floating
        glowPhase: 0
      };
      this.bots.push(bot);
      CHEMVENTUR.UI?.showStatus('⛪ Peace Bot deployed!');
      return bot;
    },

    spawnHomeless() {
      const game = CHEMVENTUR.Game;
      const bot = {
        id: 'homeless_' + Date.now(),
        type: 'homeless',
        emoji: '🏠',
        name: 'Homeless Bot',
        color: '#886644',
        x: Math.random() * (game.width - 100) + 50,
        y: Math.random() * (game.height - 200) + 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 14,
        collectedElectrons: 0,
        lastCollect: 0,
        collectRange: 80,
        driftPhase: Math.random() * Math.PI * 2
      };
      this.bots.push(bot);
      CHEMVENTUR.UI?.showStatus('🏠 Homeless Bot deployed!');
      return bot;
    },

    spawnLover() {
      const game = CHEMVENTUR.Game;
      const bot = {
        id: 'lover_' + Date.now(),
        type: 'lover',
        emoji: '💕',
        name: 'Lover Bot',
        color: '#ff66aa',
        x: game.ship.x + 100,
        y: game.ship.y - 80,
        vx: 0,
        vy: 0,
        size: 14,
        orbitAngle: 0,
        orbitRadius: 120,
        orbitSpeed: 0.008,
        heartPhase: 0
      };
      this.bots.push(bot);
      CHEMVENTUR.UI?.showStatus('💕 Lover Bot deployed!');
      return bot;
    },

    spawnAll() {
      if (!this.enabled) this.init();
      this.spawnReporter();
      this.spawnReligious();
      this.spawnHomeless();
      this.spawnLover();
      CHEMVENTUR.UI?.showStatus('🤖 All 4 Fun Bots deployed!');
    },

    removeAll() {
      this.bots = [];
      this.messageQueue = [];
      CHEMVENTUR.UI?.showStatus('🤖 All bots removed');
    },

    removeByType(type) {
      this.bots = this.bots.filter(b => b.type !== type);
    },

    // ===== MAIN UPDATE =====
    update(gameState) {
      if (!this.enabled || this.bots.length === 0) return;

      const now = Date.now();
      if (now - this.lastUpdate < this.updateInterval) return;
      this.lastUpdate = now;

      const { atoms, ship, width, height } = gameState;

      for (const bot of this.bots) {
        switch (bot.type) {
          case 'reporter':  this.updateReporter(bot, width, height, now); break;
          case 'religious': this.updateReligious(bot, width, height, now); break;
          case 'homeless':  this.updateHomeless(bot, atoms, width, height, now); break;
          case 'lover':     this.updateLover(bot, ship, width, height, now); break;
        }

        // Apply velocity + boundary bounce
        bot.x += bot.vx;
        bot.y += bot.vy;

        if (bot.x < 20) { bot.x = 20; bot.vx = Math.abs(bot.vx) * 0.8; }
        if (bot.x > width - 20) { bot.x = width - 20; bot.vx = -Math.abs(bot.vx) * 0.8; }
        if (bot.y < 20) { bot.y = 20; bot.vy = Math.abs(bot.vy) * 0.8; }
        if (bot.y > height - 20) { bot.y = height - 20; bot.vy = -Math.abs(bot.vy) * 0.8; }
      }

      // Expire old messages
      this.messageQueue = this.messageQueue.filter(m => now - m.time < this.MESSAGE_DURATION);
    },

    // ===== REPORTER BEHAVIOR =====
    updateReporter(bot, W, H, now) {
      // Fly around randomly, change direction occasionally
      if (Math.random() < 0.02) {
        bot.vx += (Math.random() - 0.5) * 2;
        bot.vy += (Math.random() - 0.5) * 2;
      }
      // Cap speed
      const speed = Math.hypot(bot.vx, bot.vy);
      if (speed > 4) { bot.vx *= 4 / speed; bot.vy *= 4 / speed; }
      // Damping
      bot.vx *= 0.99;
      bot.vy *= 0.99;

      // Pop headline every minute
      if (now - bot.lastHeadline > bot.headlineInterval) {
        bot.lastHeadline = now;
        const headline = this.HEADLINES[bot.headlineIndex % this.HEADLINES.length];
        bot.headlineIndex++;
        this.addMessage(bot, '📰 ' + headline);

        // Take screenshot to localStorage
        this.takeScreenshot(bot);
      }
    },

    takeScreenshot(bot) {
      try {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        // Shrink to save space
        const thumb = document.createElement('canvas');
        thumb.width = 320;
        thumb.height = 180;
        const tCtx = thumb.getContext('2d');
        tCtx.drawImage(canvas, 0, 0, 320, 180);
        const dataUrl = thumb.toDataURL('image/jpeg', 0.6);

        const key = 'reporter_screenshot_' + Date.now();
        // Keep only last 5 screenshots
        const keys = Object.keys(localStorage).filter(k => k.startsWith('reporter_screenshot_')).sort();
        while (keys.length >= 5) {
          localStorage.removeItem(keys.shift());
        }
        localStorage.setItem(key, dataUrl);
        console.log('📰📸 Reporter screenshot saved:', key);
      } catch (e) {
        console.warn('📰 Screenshot failed:', e.message);
      }
    },

    // ===== RELIGIOUS BEHAVIOR =====
    updateReligious(bot, W, H, now) {
      // Float peacefully with gentle sine wave motion
      bot.phase += 0.015;
      bot.glowPhase += 0.03;
      bot.vx = Math.sin(bot.phase) * 0.6;
      bot.vy = Math.cos(bot.phase * 0.7) * 0.4;

      // Show quote periodically
      if (now - bot.lastQuote > bot.quoteInterval) {
        bot.lastQuote = now;
        const q = this.QUOTES[bot.quoteIndex % this.QUOTES.length];
        bot.quoteIndex++;
        this.addMessage(bot, '🙏 "' + q.text + '" — ' + q.source);
      }
    },

    // ===== HOMELESS BEHAVIOR =====
    updateHomeless(bot, atoms, W, H, now) {
      // Drift slowly, change direction rarely
      bot.driftPhase += 0.005;
      bot.vx += Math.sin(bot.driftPhase) * 0.05;
      bot.vy += Math.cos(bot.driftPhase * 0.6) * 0.04;
      // Very slow
      const speed = Math.hypot(bot.vx, bot.vy);
      if (speed > 1.5) { bot.vx *= 1.5 / speed; bot.vy *= 1.5 / speed; }
      bot.vx *= 0.995;
      bot.vy *= 0.995;

      // Find and collect stray electrons
      let nearest = null;
      let nearDist = bot.collectRange;
      for (let i = atoms.length - 1; i >= 0; i--) {
        const a = atoms[i];
        if (!a || a.p !== 0 || a.n !== 0 || a.e !== 1) continue; // only free electrons
        const d = Math.hypot(bot.x - a.x, bot.y - a.y);
        if (d < nearDist) {
          nearest = { index: i, atom: a, dist: d };
          nearDist = d;
        }
      }

      if (nearest) {
        // Move toward the electron
        const dx = nearest.atom.x - bot.x;
        const dy = nearest.atom.y - bot.y;
        const d = nearest.dist || 1;
        bot.vx += (dx / d) * 0.15;
        bot.vy += (dy / d) * 0.15;

        // Collect if close enough
        if (nearest.dist < 25) {
          atoms.splice(nearest.index, 1);
          bot.collectedElectrons++;
          if (bot.collectedElectrons % 5 === 0) {
            this.addMessage(bot, '🏠 Collected ' + bot.collectedElectrons + ' electrons so far!');
          }
        }
      }
    },

    // ===== LOVER BEHAVIOR =====
    updateLover(bot, ship, W, H, now) {
      // Orbit the player ship
      bot.orbitAngle += bot.orbitSpeed;
      bot.heartPhase += 0.05;

      const targetX = ship.x + Math.cos(bot.orbitAngle) * bot.orbitRadius;
      const targetY = ship.y + Math.sin(bot.orbitAngle) * bot.orbitRadius;

      // Smooth follow
      bot.vx = (targetX - bot.x) * 0.06;
      bot.vy = (targetY - bot.y) * 0.06;
    },

    // ===== MESSAGE SYSTEM =====
    addMessage(bot, text) {
      this.messageQueue.push({
        text,
        botId: bot.id,
        color: bot.color,
        x: bot.x,
        y: bot.y - 30,
        time: Date.now()
      });
      // Also log to chat if available
      if (CHEMVENTUR.Chat?.addMessage) {
        CHEMVENTUR.Chat.addMessage(bot.emoji + ' ' + bot.name, text);
      }
    },

    // ===== RENDER =====
    draw(ctx) {
      if (!this.enabled || this.bots.length === 0) return;
      const now = Date.now();

      for (const bot of this.bots) {
        ctx.save();

        // Bot-specific effects
        if (bot.type === 'religious') {
          // Peaceful glow
          const glow = 8 + Math.sin(bot.glowPhase) * 4;
          ctx.shadowBlur = glow;
          ctx.shadowColor = '#ffccff';
        } else if (bot.type === 'lover') {
          // Heart glow
          ctx.shadowBlur = 10 + Math.sin(bot.heartPhase) * 5;
          ctx.shadowColor = '#ff66aa';
        } else if (bot.type === 'reporter') {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffaa00';
        } else if (bot.type === 'homeless') {
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#886644';
        }

        // Draw bot body (circle)
        ctx.fillStyle = bot.color;
        ctx.beginPath();
        ctx.arc(bot.x, bot.y, bot.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw emoji on top
        ctx.shadowBlur = 0;
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bot.emoji, bot.x, bot.y);

        // Name label
        ctx.font = '9px Courier New';
        ctx.fillStyle = bot.color;
        ctx.fillText(bot.name, bot.x, bot.y + bot.size + 10);

        // Homeless: show electron count
        if (bot.type === 'homeless' && bot.collectedElectrons > 0) {
          ctx.font = '8px Courier New';
          ctx.fillStyle = '#00ffff';
          ctx.fillText('e⁻: ' + bot.collectedElectrons, bot.x, bot.y + bot.size + 20);
        }

        // Lover: draw little hearts around orbit
        if (bot.type === 'lover') {
          const heartAlpha = 0.4 + Math.sin(bot.heartPhase) * 0.3;
          ctx.globalAlpha = heartAlpha;
          ctx.font = '10px sans-serif';
          for (let i = 0; i < 3; i++) {
            const a = bot.orbitAngle + i * (Math.PI * 2 / 3);
            const hx = bot.x + Math.cos(a) * 22;
            const hy = bot.y + Math.sin(a) * 22;
            ctx.fillText('💕', hx - 5, hy);
          }
          ctx.globalAlpha = 1;
        }

        ctx.restore();
      }

      // Draw messages
      for (const msg of this.messageQueue) {
        const age = now - msg.time;
        const alpha = Math.max(0, 1 - age / this.MESSAGE_DURATION);
        const yOffset = -(age / this.MESSAGE_DURATION) * 40; // float upward

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '11px Courier New';
        ctx.textAlign = 'center';

        // Background
        const metrics = ctx.measureText(msg.text);
        const tw = Math.min(metrics.width + 16, 400);
        const tx = msg.x - tw / 2;
        const ty = msg.y + yOffset - 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(tx, ty, tw, 18);
        ctx.strokeStyle = msg.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, tw, 18);

        // Text (truncate if too long)
        ctx.fillStyle = msg.color;
        let displayText = msg.text;
        if (displayText.length > 55) displayText = displayText.substring(0, 52) + '...';
        ctx.fillText(displayText, msg.x, msg.y + yOffset + 4);

        ctx.restore();
      }
    }
  };

  console.log('🤖 Fun Bots module loaded!');
})();

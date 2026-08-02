/* ============================================
   CHEMVENTUR v118 - STAGE 3: MICRO-WORLD
   🦠 Bacteria, Viruses, Crystals, Sand Grains
   The hidden life between molecules and cells!

   Scale: ~0.1 µm (virus) to ~500 µm (sand grain)
   Physics: Brownian motion, viscous drag, gravity,
            chemotaxis, crystal lattice growth,
            viral infection, bacterial division.
   ============================================ */

(function() {

  CHEMVENTUR.OrganismSystem = {

    // ===== ENTITY POOLS =====
    bacteria:   [],
    viruses:    [],
    crystals:   [],
    sandGrains: [],
    _projectiles: [],
    _uvFlashes:   [],

    // ===== SIMULATION STATE =====
    cultureAge:    0,
    temperature:   37,    // °C
    nutrientLevel: 80,    // 0–100

    // ===== ENTITY DEFINITIONS =====

    BACTERIA_TYPES: {
      ECOLI: {
        name: 'E. coli', color: '#88ff44',
        shape: 'rod', speed: 1.2,
        divideEnergy: 120, size: 12
      },
      STAPH: {
        name: 'Staphylococcus', color: '#ffaa00',
        shape: 'coccus', speed: 0.6,
        divideEnergy: 150, size: 10
      },
      SPIROCHETE: {
        name: 'Spirochete', color: '#00ffcc',
        shape: 'spiral', speed: 2.0,
        divideEnergy: 200, size: 14
      }
    },

    VIRUS_TYPES: {
      ICOSAHEDRAL: {
        name: 'Icosahedral', color: '#ff4444',
        shape: 'ico', speed: 3.0, infectRadius: 15
      },
      FILAMENTOUS: {
        name: 'Filamentous', color: '#ff8800',
        shape: 'filament', speed: 2.0, infectRadius: 12
      },
      BACTERIOPHAGE: {
        name: 'Bacteriophage', color: '#ff00ff',
        shape: 'phage', speed: 2.5, infectRadius: 18
      }
    },

    CRYSTAL_TYPES: {
      HALITE:  { name: 'Halite (NaCl)',   color: '#aaddff', shape: 'cubic',     growRate: 0.30, maxSize: 60 },
      QUARTZ:  { name: 'Quartz (SiO₂)',   color: '#cc88ff', shape: 'hexagonal', growRate: 0.15, maxSize: 80 },
      ICE:     { name: 'Ice (H₂O)',        color: '#ccffff', shape: 'hexagonal', growRate: 0.50, maxSize: 100 },
      CALCITE: { name: 'Calcite (CaCO₃)', color: '#ffffcc', shape: 'trigonal',  growRate: 0.20, maxSize: 70 }
    },

    // ===== LIFECYCLE =====

    clear() {
      this.bacteria      = [];
      this.viruses       = [];
      this.crystals      = [];
      this.sandGrains    = [];
      this._projectiles  = [];
      this._uvFlashes    = [];
      this.cultureAge    = 0;
      this.nutrientLevel = 80;
    },

    initCulture(width, height) {
      this.clear();

      // Starting bacteria
      for (let i = 0; i < 8; i++) {
        this.spawnBacterium(80 + Math.random() * (width - 160),
                            80 + Math.random() * (height - 160), 'ECOLI');
      }
      for (let i = 0; i < 4; i++) {
        this.spawnBacterium(80 + Math.random() * (width - 160),
                            80 + Math.random() * (height - 160), 'STAPH');
      }

      // A few free viruses
      for (let i = 0; i < 3; i++) {
        this.spawnVirus(80 + Math.random() * (width - 160),
                        80 + Math.random() * (height - 160), 'ICOSAHEDRAL');
      }

      // Crystal seeds
      this.spawnCrystalSeed(width * 0.25, height * 0.65, 'HALITE');
      this.spawnCrystalSeed(width * 0.72, height * 0.70, 'QUARTZ');

      // Sand layer near the bottom
      for (let i = 0; i < 15; i++) {
        this.spawnSandGrain(60 + Math.random() * (width - 120),
                            height - 20 - Math.random() * 60);
      }
    },

    // ===== SPAWN HELPERS =====

    spawnBacterium(x, y, typeKey) {
      typeKey = typeKey || 'ECOLI';
      const type  = this.BACTERIA_TYPES[typeKey];
      const angle = Math.random() * Math.PI * 2;
      this.bacteria.push({
        x, y,
        vx: Math.cos(angle) * type.speed * 0.5,
        vy: Math.sin(angle) * type.speed * 0.5,
        angle,
        tumbleTimer: 60 + Math.random() * 120,
        energy: 60 + Math.random() * 40,
        maxEnergy: type.divideEnergy,
        typeKey, type,
        size: type.size * (0.8 + Math.random() * 0.4),
        age:  0,
        infected: false,
        infectionTimer: 0,
        id: Math.random()
      });
    },

    spawnVirus(x, y, typeKey) {
      typeKey = typeKey || 'ICOSAHEDRAL';
      const type = this.VIRUS_TYPES[typeKey];
      this.viruses.push({
        x, y,
        vx: (Math.random() - 0.5) * type.speed * 2,
        vy: (Math.random() - 0.5) * type.speed * 2,
        typeKey, type,
        size: 5 + Math.random() * 3,
        age:  0,
        attached: null,
        replicationTimer: 0,
        id: Math.random()
      });
    },

    spawnCrystalSeed(x, y, typeKey) {
      typeKey = typeKey || 'HALITE';
      const type = this.CRYSTAL_TYPES[typeKey];
      const seed = {
        x, y, typeKey, type,
        size: 3,
        maxSize: type.maxSize,
        growthProgress: 0,
        latticePoints: [],
        age: 0,
        id: Math.random()
      };
      this._buildLattice(seed);
      this.crystals.push(seed);
    },

    spawnSandGrain(x, y) {
      const numVerts = 5 + Math.floor(Math.random() * 4);
      const baseR   = 8 + Math.random() * 12;
      const verts   = [];
      for (let i = 0; i < numVerts; i++) {
        const a = (i / numVerts) * Math.PI * 2;
        const r = baseR * (0.6 + Math.random() * 0.8);
        verts.push({ dx: Math.cos(a) * r, dy: Math.sin(a) * r });
      }
      this.sandGrains.push({
        x, y,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 1,
        rotation: Math.random() * Math.PI * 2,
        rotVel:   (Math.random() - 0.5) * 0.05,
        vertices: verts,
        size: baseR,
        hue:       25 + Math.random() * 20,
        lightness: 45 + Math.random() * 25,
        age: 0,
        id: Math.random()
      });
    },

    // ===== MAIN UPDATE =====

    update(width, height, ts) {
      if (ts === 0) return;

      this.cultureAge++;

      // Slowly consume nutrients
      if (this.cultureAge % 300 === 0 && this.nutrientLevel > 5) {
        this.nutrientLevel = Math.max(5, this.nutrientLevel - 0.5);
      }

      this._updateBacteria(width, height, ts);
      this._updateViruses(width, height, ts);
      this._updateCrystals(ts);
      this._updateSand(width, height, ts);
      this._updateProjectiles(width, height);
      this._checkInteractions();
    },

    _updateBacteria(width, height, ts) {
      const brownian = 0.4 * (this.temperature / 37);

      for (let i = this.bacteria.length - 1; i >= 0; i--) {
        const b = this.bacteria[i];
        b.age++;

        // Thermal jitter
        b.vx += (Math.random() - 0.5) * brownian;
        b.vy += (Math.random() - 0.5) * brownian;

        // Tumble-and-run (chemotaxis)
        b.tumbleTimer -= ts;
        if (b.tumbleTimer <= 0) {
          b.angle     = Math.random() * Math.PI * 2;
          b.vx        = Math.cos(b.angle) * b.type.speed;
          b.vy        = Math.sin(b.angle) * b.type.speed;
          b.tumbleTimer = 60 + Math.random() * 120;
        }

        // Viscous drag
        b.vx *= 0.92;
        b.vy *= 0.92;

        b.x += b.vx * ts;
        b.y += b.vy * ts;

        // Boundary bounce
        if (b.x < b.size)         { b.x = b.size;          b.vx =  Math.abs(b.vx); }
        if (b.x > width - b.size) { b.x = width - b.size;  b.vx = -Math.abs(b.vx); }
        if (b.y < b.size)         { b.y = b.size;           b.vy =  Math.abs(b.vy); }
        if (b.y > height - b.size){ b.y = height - b.size;  b.vy = -Math.abs(b.vy); }

        // Nutrient uptake
        if (this.nutrientLevel > 0) {
          b.energy += 0.08 * (this.nutrientLevel / 100) * ts;
        }

        // Infection damage
        if (b.infected) {
          b.infectionTimer -= ts;
          b.energy -= 0.3 * ts;
          if (b.infectionTimer <= 0 || b.energy <= 0) {
            // Lysis: burst into new viruses
            for (let v = 0; v < 3; v++) {
              if (this.viruses.length < 60) {
                this.spawnVirus(
                  b.x + (Math.random() - 0.5) * 20,
                  b.y + (Math.random() - 0.5) * 20,
                  'ICOSAHEDRAL'
                );
              }
            }
            this.bacteria.splice(i, 1);
            continue;
          }
        }

        if (b.energy <= 0) {
          this.bacteria.splice(i, 1);
          continue;
        }

        // Binary fission
        if (b.energy >= b.maxEnergy && this.bacteria.length < 80) {
          b.energy = b.maxEnergy * 0.45;
          const perp = b.angle + Math.PI / 2;
          this.spawnBacterium(
            b.x + Math.cos(perp) * b.size,
            b.y + Math.sin(perp) * b.size,
            b.typeKey
          );
        }
      }
    },

    _updateViruses(width, height, ts) {
      const brownian = 0.8;

      for (let i = this.viruses.length - 1; i >= 0; i--) {
        const v = this.viruses[i];
        v.age++;

        if (v.attached) {
          if (!this.bacteria.includes(v.attached)) {
            v.attached = null;
            continue;
          }
          v.x = v.attached.x + v.attached.size * 1.1;
          v.y = v.attached.y;
          v.replicationTimer += ts;
          if (v.replicationTimer > 120) {
            v.attached.infected      = true;
            v.attached.infectionTimer = 300 + Math.random() * 200;
          }
          continue;
        }

        // Free-floating random walk
        v.vx += (Math.random() - 0.5) * brownian;
        v.vy += (Math.random() - 0.5) * brownian;
        v.vx *= 0.88;
        v.vy *= 0.88;

        v.x += v.vx * ts;
        v.y += v.vy * ts;

        // Wrap around edges (viruses are tiny — they slip everywhere)
        if (v.x < 0)       v.x = width;
        if (v.x > width)   v.x = 0;
        if (v.y < 0)       v.y = height;
        if (v.y > height)  v.y = 0;
      }
    },

    _updateCrystals(ts) {
      for (const c of this.crystals) {
        c.age++;
        if (c.size >= c.maxSize) continue;

        const rate = c.type.growRate * (this.nutrientLevel / 100) * ts * 0.1;
        c.growthProgress += rate;

        if (c.growthProgress >= 1) {
          c.growthProgress = 0;
          c.size = Math.min(c.maxSize, c.size + 0.8);
          this._buildLattice(c);
        }
      }
    },

    _buildLattice(c) {
      c.latticePoints = [];
      const s = c.size;

      if (c.type.shape === 'cubic') {
        const sp = 12;
        const st = Math.floor(s / sp);
        for (let dx = -st; dx <= st; dx++) {
          for (let dy = -st; dy <= st; dy++) {
            if (Math.abs(dx) + Math.abs(dy) <= st + 1) {
              c.latticePoints.push({ x: dx * sp, y: dy * sp });
            }
          }
        }
      } else if (c.type.shape === 'hexagonal') {
        const sp = 12;
        const st = Math.floor(s / sp);
        for (let row = -st; row <= st; row++) {
          for (let col = -st; col <= st; col++) {
            const px = col * sp + (row % 2) * sp * 0.5;
            const py = row * sp * 0.866;
            if (Math.hypot(px, py) <= s) {
              c.latticePoints.push({ x: px, y: py });
            }
          }
        }
      } else { // trigonal
        const a1 = { x: 14, y: 0 };
        const a2 = { x: 7,  y: 12 };
        const rn = Math.floor(s / 12);
        for (let ii = -rn; ii <= rn; ii++) {
          for (let jj = -rn; jj <= rn; jj++) {
            const px = ii * a1.x + jj * a2.x;
            const py = ii * a1.y + jj * a2.y;
            if (Math.hypot(px, py) <= s) {
              c.latticePoints.push({ x: px, y: py });
            }
          }
        }
      }
    },

    _updateSand(width, height, ts) {
      for (let i = 0; i < this.sandGrains.length; i++) {
        const s = this.sandGrains[i];
        s.age++;

        s.vy  += 0.15 * ts;       // gravity
        s.vx  *= 0.97;
        s.vy  *= 0.97;
        s.x   += s.vx * ts;
        s.y   += s.vy * ts;
        s.rotation += s.rotVel * ts;
        s.rotVel   *= 0.98;

        // Floor
        if (s.y + s.size > height - 5) {
          s.y  = height - 5 - s.size;
          s.vy = -s.vy * 0.3;
          s.vx *= 0.8;
          s.rotVel *= 0.5;
          if (Math.abs(s.vy) < 0.5) s.vy = 0;
        }
        // Walls
        if (s.x < s.size)         { s.x = s.size;         s.vx =  Math.abs(s.vx) * 0.6; }
        if (s.x > width - s.size) { s.x = width - s.size; s.vx = -Math.abs(s.vx) * 0.6; }
        if (s.y < s.size)         { s.y = s.size;          s.vy =  Math.abs(s.vy) * 0.3; }

        // Grain-grain collisions (simple circle proxy)
        for (let j = i + 1; j < this.sandGrains.length; j++) {
          const s2   = this.sandGrains[j];
          const dx   = s.x - s2.x;
          const dy   = s.y - s2.y;
          const dist = Math.hypot(dx, dy);
          const min  = s.size + s2.size;
          if (dist < min && dist > 0.1) {
            const overlap = (min - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;
            s.x  += nx * overlap;
            s.y  += ny * overlap;
            s2.x -= nx * overlap;
            s2.y -= ny * overlap;
            const dot = (s.vx - s2.vx) * nx + (s.vy - s2.vy) * ny;
            if (dot < 0) {
              s.vx  -= dot * 0.6 * nx;
              s.vy  -= dot * 0.6 * ny;
              s2.vx += dot * 0.6 * nx;
              s2.vy += dot * 0.6 * ny;
            }
          }
        }
      }
    },

    _updateProjectiles(width, height) {
      for (let i = this._projectiles.length - 1; i >= 0; i--) {
        const p = this._projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.life--;

        if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          this._projectiles.splice(i, 1);
          continue;
        }

        if (p.type === 'nutrient') {
          for (const b of this.bacteria) {
            if (Math.hypot(b.x - p.x, b.y - p.y) < b.size + p.size + 5) {
              b.energy = Math.min(b.maxEnergy, b.energy + 5);
              this.nutrientLevel = Math.min(100, this.nutrientLevel + 0.5);
              p.life = 0;
              break;
            }
          }
        } else if (p.type === 'antibiotic') {
          for (let j = this.bacteria.length - 1; j >= 0; j--) {
            if (Math.hypot(this.bacteria[j].x - p.x, this.bacteria[j].y - p.y) < this.bacteria[j].size + p.size) {
              this.bacteria[j].energy -= 50;
              p.life = 0;
              break;
            }
          }
        } else if (p.type === 'antiviral') {
          for (let j = this.viruses.length - 1; j >= 0; j--) {
            if (Math.hypot(this.viruses[j].x - p.x, this.viruses[j].y - p.y) < this.viruses[j].size + p.size + 5) {
              this.viruses.splice(j, 1);
              p.life = 0;
              break;
            }
          }
        }
      }

      // Decay UV flashes
      for (let i = this._uvFlashes.length - 1; i >= 0; i--) {
        this._uvFlashes[i].life--;
        if (this._uvFlashes[i].life <= 0) this._uvFlashes.splice(i, 1);
      }
    },

    _checkInteractions() {
      // Viruses latch onto nearby healthy bacteria
      for (const v of this.viruses) {
        if (v.attached) continue;
        for (const b of this.bacteria) {
          if (b.infected) continue;
          if (Math.hypot(v.x - b.x, v.y - b.y) < b.size + v.type.infectRadius) {
            v.attached = b;
            v.replicationTimer = 0;
            break;
          }
        }
      }
    },

    // ===== GUN FIRE (called from main.js when stage === 3) =====

    fire(x, y, gun, angle) {
      const speed = 8;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      switch (gun) {
        case 1:
          this._projectiles.push({ x, y, vx, vy, type: 'nutrient',    life: 120, size: 6 });
          return { type: 'nutrient' };
        case 2:
          this._projectiles.push({ x, y, vx, vy, type: 'antibiotic',  life: 80,  size: 4 });
          return { type: 'antibiotic' };
        case 3:
          this._projectiles.push({ x, y, vx, vy, type: 'antiviral',   life: 80,  size: 4 });
          return { type: 'antiviral' };
        case 4:
          this.spawnCrystalSeed(x + vx * 5, y + vy * 5, this._randomCrystalKey());
          return { type: 'crystal' };
        case 5:
          if (this.viruses.length < 60) this.spawnVirus(x, y, 'BACTERIOPHAGE');
          return { type: 'phage' };
        case 6:
          this.spawnSandGrain(x, y);
          const sg = this.sandGrains[this.sandGrains.length - 1];
          if (sg) { sg.vx = vx; sg.vy = vy; }
          return { type: 'sand' };
        case 7:
          this._uvBurst(x, y, 80);
          return { type: 'uv' };
        case 8:
          this.bacteria.forEach(b => {
            b.energy = Math.min(b.maxEnergy * 0.9, b.energy + 30);
          });
          this.nutrientLevel = Math.min(100, this.nutrientLevel + 10);
          return { type: 'growth' };
        default:
          if (this.bacteria.length < 80) this.spawnBacterium(x, y, 'ECOLI');
          return { type: 'bacterium' };
      }
    },

    _uvBurst(x, y, radius) {
      // Kill nearby viruses, damage nearby bacteria
      for (let i = this.viruses.length - 1; i >= 0; i--) {
        if (Math.hypot(this.viruses[i].x - x, this.viruses[i].y - y) < radius) {
          this.viruses.splice(i, 1);
        }
      }
      for (const b of this.bacteria) {
        if (Math.hypot(b.x - x, b.y - y) < radius) b.energy -= 20;
      }
      this._uvFlashes.push({ x, y, radius, life: 30 });
    },

    _randomCrystalKey() {
      const keys = Object.keys(this.CRYSTAL_TYPES);
      return keys[Math.floor(Math.random() * keys.length)];
    },

    // ===== DRAW =====

    draw(ctx) {
      this._drawCrystals(ctx);
      this._drawSandGrains(ctx);
      this._drawBacteria(ctx);
      this._drawViruses(ctx);
      this._drawProjectiles(ctx);
      this._drawUVFlashes(ctx);
    },

    _drawBacteria(ctx) {
      const t = Date.now() * 0.01;
      for (const b of this.bacteria) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);

        const col = b.infected ? '#ff4444' : b.type.color;
        ctx.shadowColor = col;
        ctx.shadowBlur  = b.infected ? 16 : 8;

        if (b.type.shape === 'rod') {
          const w = b.size * 2.2;
          const h = b.size * 0.8;
          ctx.fillStyle   = col;
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Flagellum
          const wave = Math.sin(t + b.id * 10);
          ctx.beginPath();
          ctx.strokeStyle = col + '99';
          ctx.lineWidth   = 1.5;
          ctx.moveTo(-w / 2, 0);
          ctx.bezierCurveTo(
            -w / 2 - 8,  wave * 5,
            -w / 2 - 16, -wave * 5,
            -w / 2 - 22,  wave * 3
          );
          ctx.stroke();

        } else if (b.type.shape === 'coccus') {
          ctx.fillStyle   = col;
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.arc(0, 0, b.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

        } else if (b.type.shape === 'spiral') {
          ctx.strokeStyle = col;
          ctx.lineWidth   = 3;
          ctx.beginPath();
          for (let step = 0; step <= 20; step++) {
            const fx = (step / 20) * b.size * 2 - b.size;
            const fy = Math.sin(step * 0.8 + t * 0.5 + b.id * 5) * b.size * 0.35;
            step === 0 ? ctx.moveTo(fx, fy) : ctx.lineTo(fx, fy);
          }
          ctx.stroke();
        }

        // Tiny energy bar
        const barW   = b.size * 2;
        const frac   = b.energy / b.maxEnergy;
        ctx.shadowBlur = 0;
        ctx.fillStyle  = '#333';
        ctx.fillRect(-barW / 2, -b.size - 5, barW, 2);
        ctx.fillStyle  = frac > 0.6 ? '#00ff41' : frac > 0.3 ? '#ffaa00' : '#ff4444';
        ctx.fillRect(-barW / 2, -b.size - 5, barW * frac, 2);

        ctx.restore();
      }
    },

    _drawViruses(ctx) {
      const t = Date.now() * 0.003;
      for (const v of this.viruses) {
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.shadowColor = v.type.color;
        ctx.shadowBlur  = 10;

        if (v.typeKey === 'ICOSAHEDRAL') {
          const spikes = 10;
          const inner  = v.size;
          const outer  = v.size + 4;
          ctx.fillStyle = v.type.color;
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const a = (i / (spikes * 2)) * Math.PI * 2 + t;
            const r = i % 2 === 0 ? outer : inner;
            i === 0
              ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
              : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();

        } else if (v.typeKey === 'FILAMENTOUS') {
          const len = v.size * 4;
          ctx.strokeStyle = v.type.color;
          ctx.lineWidth   = 3;
          ctx.beginPath();
          ctx.moveTo(-len / 2, 0);
          ctx.bezierCurveTo(
            -len / 4,  Math.sin(t + v.id * 5) * 5,
             len / 4, -Math.sin(t + v.id * 5) * 5,
             len / 2,  0
          );
          ctx.stroke();
          ctx.fillStyle = v.type.color;
          [- len / 2, len / 2].forEach(cx => {
            ctx.beginPath();
            ctx.arc(cx, 0, 3, 0, Math.PI * 2);
            ctx.fill();
          });

        } else if (v.typeKey === 'BACTERIOPHAGE') {
          ctx.fillStyle   = v.type.color;
          ctx.strokeStyle = v.type.color;
          ctx.lineWidth   = 1.5;
          // Head
          ctx.beginPath();
          ctx.arc(0, -v.size * 1.5, v.size, 0, Math.PI * 2);
          ctx.fill();
          // Tail
          ctx.beginPath();
          ctx.moveTo(0, -v.size * 0.5);
          ctx.lineTo(0,  v.size * 1.5);
          ctx.stroke();
          // Legs
          for (let leg = 0; leg < 6; leg++) {
            const la  = (leg / 6) * Math.PI * 1.5 - Math.PI * 0.75;
            const lx  = Math.cos(la) * v.size * 0.8;
            const ly  = v.size * 1.5 + Math.sin(Math.abs(la)) * v.size * 0.6;
            ctx.beginPath();
            ctx.moveTo(0, v.size * 1.5);
            ctx.lineTo(lx, ly);
            ctx.stroke();
          }
        }

        ctx.shadowBlur = 0;
        ctx.restore();
      }
    },

    _drawCrystals(ctx) {
      for (const c of this.crystals) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.shadowColor = c.type.color;
        ctx.shadowBlur  = 15;

        // Bond lines between neighbouring lattice nodes
        ctx.strokeStyle = c.type.color;
        ctx.lineWidth   = 0.8;
        const pts = c.latticePoints;
        for (let p = 0; p < pts.length; p++) {
          for (let q = p + 1; q < pts.length; q++) {
            if (Math.hypot(pts[p].x - pts[q].x, pts[p].y - pts[q].y) < 16) {
              ctx.globalAlpha = 0.4;
              ctx.beginPath();
              ctx.moveTo(pts[p].x, pts[p].y);
              ctx.lineTo(pts[q].x, pts[q].y);
              ctx.stroke();
            }
          }
        }

        // Node dots
        ctx.fillStyle = c.type.color + '99';
        ctx.globalAlpha = 0.85;
        for (const pt of pts) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Semi-transparent outer crystal face
        ctx.globalAlpha = 0.22;
        ctx.fillStyle   = c.type.color;
        ctx.beginPath();
        const sides = c.type.shape === 'cubic' ? 4 : c.type.shape === 'hexagonal' ? 6 : 3;
        for (let i = 0; i < sides; i++) {
          const a = (i / sides) * Math.PI * 2 - Math.PI / sides;
          i === 0
            ? ctx.moveTo(Math.cos(a) * c.size * 0.6, Math.sin(a) * c.size * 0.6)
            : ctx.lineTo(Math.cos(a) * c.size * 0.6, Math.sin(a) * c.size * 0.6);
        }
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;

        ctx.fillStyle   = c.type.color;
        ctx.font        = '9px monospace';
        ctx.textAlign   = 'center';
        ctx.fillText(c.type.name, 0, c.size * 0.7 + 13);

        ctx.restore();
      }
    },

    _drawSandGrains(ctx) {
      for (const s of this.sandGrains) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.fillStyle   = `hsl(${s.hue}, 60%, ${s.lightness}%)`;
        ctx.strokeStyle = `hsl(${s.hue}, 40%, ${s.lightness - 15}%)`;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        for (let i = 0; i < s.vertices.length; i++) {
          const v = s.vertices[i];
          i === 0 ? ctx.moveTo(v.dx, v.dy) : ctx.lineTo(v.dx, v.dy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    },

    _drawProjectiles(ctx) {
      const colors = {
        nutrient:   '#aaff44',
        antibiotic: '#ff8800',
        antiviral:  '#8844ff'
      };
      for (const p of this._projectiles) {
        const col = colors[p.type] || '#ffffff';
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / 80);
        ctx.fillStyle   = col;
        ctx.shadowColor = col;
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    },

    _drawUVFlashes(ctx) {
      for (const f of this._uvFlashes) {
        ctx.save();
        ctx.globalAlpha = f.life / 30;
        ctx.fillStyle   = 'rgba(200,100,255,0.3)';
        ctx.strokeStyle = '#cc66ff';
        ctx.lineWidth   = 2;
        ctx.shadowColor = '#cc66ff';
        ctx.shadowBlur  = 20;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * (1 - f.life / 30), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    },

    // ===== STATS (for HUD) =====

    getStats() {
      return {
        bacteria:     this.bacteria.length,
        viruses:      this.viruses.length,
        crystals:     this.crystals.length,
        sandGrains:   this.sandGrains.length,
        nutrientLevel: Math.round(this.nutrientLevel),
        cultureAge:   this.cultureAge,
        temperature:  this.temperature
      };
    }

  };

})();

// battle-ui.js — Battle screen UI renderer with 3D model display

import { CMD, BATTLE_RESULT } from './battle.js';
import { Vec3, Color, Mat4 } from './math.js';

// Simple flash/shake effect state
class BattleEffect {
  constructor() {
    this.flash = 0;       // flash frames remaining
    this.flashColor = '#fff';
    this.shake = 0;       // shake frames remaining
    this.shakeX = 0;
    this.damageNums = []; // { text, x, y, life, color }
  }

  triggerFlash(color = '#fff', frames = 4) {
    this.flash = frames;
    this.flashColor = color;
  }

  triggerShake(frames = 6) {
    this.shake = frames;
  }

  addDamageNum(text, x, y, color = '#ff0') {
    this.damageNums.push({ text, x, y, life: 30, color });
  }

  update() {
    if (this.flash > 0) this.flash--;
    if (this.shake > 0) {
      this.shakeX = (Math.random() - 0.5) * 4;
      this.shake--;
    } else {
      this.shakeX = 0;
    }
    this.damageNums = this.damageNums.filter(d => {
      d.y -= 0.8;
      d.life--;
      return d.life > 0;
    });
  }
}

export class BattleUI {
  constructor(ctx, input, renderer, models, paramAll) {
    this.ctx = ctx;
    this.input = input;
    this.renderer = renderer;
    this.models = models;
    this.paramAll = paramAll;
    this.cursor = 0;
    this.targetCursor = 0;
    this.phase = 'command'; // command, target
    this.commands = [
      { label: 'こうげき', cmd: CMD.ATTACK },
      { label: 'ぼうぎょ', cmd: CMD.DEFEND },
      { label: 'にげる', cmd: CMD.RUN },
    ];
    this.effect = new BattleEffect();
    this.lastLogLen = 0;
    this.enemyPats = []; // model pattern indices for enemies
  }

  setEnemyPats(pats) {
    this.enemyPats = pats;
  }

  update(battleState) {
    this.effect.update();

    // Detect new log entries for effects
    if (battleState.log.length > this.lastLogLen) {
      const newMsg = battleState.log[battleState.log.length - 1];
      if (newMsg.includes('ダメージ')) {
        this.effect.triggerFlash('#f44', 3);
        this.effect.triggerShake(4);
      }
      if (newMsg.includes('倒した')) {
        this.effect.triggerFlash('#ff0', 6);
      }
      this.lastLogLen = battleState.log.length;
    }

    if (battleState.state !== 'playerTurn') return null;

    if (this.phase === 'command') {
      if (this.input.isKeyDown('arrowup')) {
        this.cursor = (this.cursor - 1 + this.commands.length) % this.commands.length;
      }
      if (this.input.isKeyDown('arrowdown')) {
        this.cursor = (this.cursor + 1) % this.commands.length;
      }
      if (this.input.isOK()) {
        const selected = this.commands[this.cursor];
        if (selected.cmd === CMD.ATTACK) {
          this.phase = 'target';
          this.targetCursor = 0;
          return null;
        }
        return { cmd: selected.cmd, target: 0 };
      }
    } else if (this.phase === 'target') {
      const aliveEnemies = battleState.enemies.filter(e => e.alive);
      if (aliveEnemies.length === 0) {
        this.phase = 'command';
        return null;
      }
      if (this.input.isKeyDown('arrowleft') || this.input.isKeyDown('arrowup')) {
        this.targetCursor = (this.targetCursor - 1 + aliveEnemies.length) % aliveEnemies.length;
      }
      if (this.input.isKeyDown('arrowright') || this.input.isKeyDown('arrowdown')) {
        this.targetCursor = (this.targetCursor + 1) % aliveEnemies.length;
      }
      if (this.input.isOK()) {
        const target = this.targetCursor;
        this.phase = 'command';
        return { cmd: CMD.ATTACK, target };
      }
      if (this.input.isCancel()) {
        this.phase = 'command';
      }
    }
    return null;
  }

  draw(battleState) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.effect.shakeX, 0);

    // Background gradient (dark blue battle field)
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, '#0a0a2a');
    grad.addColorStop(0.5, '#1a1a3e');
    grad.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = grad;
    ctx.fillRect(-10, 0, 420, 320);

    // Ground plane (simple perspective grid)
    this.drawBattleGround(ctx);

    // Draw enemy 3D models
    this.drawEnemyModels(battleState);

    // Flash overlay
    if (this.effect.flash > 0) {
      ctx.fillStyle = this.effect.flashColor;
      ctx.globalAlpha = this.effect.flash * 0.15;
      ctx.fillRect(-10, 0, 420, 320);
      ctx.globalAlpha = 1;
    }

    // Damage numbers
    this.drawDamageNums(ctx);

    // Player status panel
    this.drawPlayerStatus(battleState);

    // Command menu
    if (battleState.state === 'playerTurn') {
      if (this.phase === 'command') {
        this.drawCommandMenu();
      } else if (this.phase === 'target') {
        this.drawTargetSelect(battleState);
      }
    }

    // Battle log
    this.drawLog(battleState);

    ctx.restore();
  }

  drawBattleGround(ctx) {
    // Simple perspective ground
    ctx.strokeStyle = 'rgba(60,60,120,0.3)';
    ctx.lineWidth = 1;
    for (let z = 0; z < 6; z++) {
      const y = 130 + z * 12;
      const spread = 50 + z * 30;
      ctx.beginPath();
      ctx.moveTo(200 - spread, y);
      ctx.lineTo(200 + spread, y);
      ctx.stroke();
    }
  }

  drawEnemyModels(battleState) {
    const enemies = battleState.enemies;
    const aliveEnemies = enemies.filter(e => e.alive);
    const totalEnemies = enemies.length;

    if (!this.renderer || !this.models) {
      // Fallback: colored boxes
      this.drawEnemyBoxes(battleState);
      return;
    }

    // Setup camera for battle scene
    const eye = new Vec3(0, 150, -400);
    const at = new Vec3(0, 50, 200);
    this.renderer.viewTransform(eye, at);
    this.renderer.projTransform(10, 2000);

    // Set lighting
    this.renderer.setAmbient(new Color(80, 80, 100));
    this.renderer.setRenderState('lightColor', new Color(200, 200, 180));
    this.renderer.light = { direction: new Vec3(-0.3, -0.8, 0.5).normalize() };

    for (let i = 0; i < totalEnemies; i++) {
      const e = enemies[i];
      if (!e.alive) continue;

      // Get model index from pat
      const pat = this.enemyPats[i] || 0;
      const model = this.models[pat];
      if (!model || model.vertices.length === 0) {
        // Draw placeholder
        this.drawEnemyPlaceholder(i, totalEnemies, e);
        continue;
      }

      // Position enemies in a row
      const spacing = 180;
      const startX = -(totalEnemies - 1) * spacing / 2;
      const posX = startX + i * spacing;
      const posZ = 230;

      const pos = new Vec3(posX, 0, posZ);
      const rot = new Vec3(0, Math.PI, 0); // face player
      const scl = new Vec3(1, 1, 1);

      const wvp = this.renderer.calcModel(model, pos, rot, scl);
      const worldMat = this.renderer.getTransform(3); // TS_WORLD
      this.renderer.drawModel(model, wvp, worldMat, 0, 0);

      // Draw name below
      const screenPos = this.renderer.get3DPos(wvp, new Vec3(0, -10, 0));
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(e.name, screenPos.x, Math.min(screenPos.y + 15, 195));

      // HP bar below name
      const barY = Math.min(screenPos.y + 20, 200);
      const barW = 40;
      const barX = screenPos.x - barW / 2;
      const hpRatio = e.hp / e.maxHP;
      this.ctx.fillStyle = '#222';
      this.ctx.fillRect(barX, barY, barW, 4);
      this.ctx.fillStyle = hpRatio > 0.3 ? '#4c4' : '#c44';
      this.ctx.fillRect(barX, barY, barW * hpRatio, 4);

      // Target cursor
      if (this.phase === 'target') {
        const aliveIdx = aliveEnemies.indexOf(e);
        if (aliveIdx === this.targetCursor) {
          this.ctx.fillStyle = '#ff0';
          this.ctx.font = '14px sans-serif';
          this.ctx.fillText('▼', screenPos.x, Math.min(screenPos.y - 30, 50));
        }
      }
    }
  }

  drawEnemyPlaceholder(index, total, enemy) {
    const spacing = 70;
    const startX = 200 - (total - 1) * spacing / 2;
    const x = startX + index * spacing;
    const y = 70;

    this.ctx.fillStyle = '#c44';
    this.ctx.fillRect(x - 20, y, 40, 40);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '10px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(enemy.name, x, y + 55);

    const hpRatio = enemy.hp / enemy.maxHP;
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(x - 20, y + 42, 40, 4);
    this.ctx.fillStyle = hpRatio > 0.3 ? '#4c4' : '#c44';
    this.ctx.fillRect(x - 20, y + 42, 40 * hpRatio, 4);
  }

  drawEnemyBoxes(battleState) {
    const enemies = battleState.enemies;
    const total = enemies.length;
    const spacing = 70;
    const startX = 200 - (total - 1) * spacing / 2;

    for (let i = 0; i < total; i++) {
      const e = enemies[i];
      const x = startX + i * spacing;
      const y = 70;

      if (e.alive) {
        this.ctx.fillStyle = '#c44';
        this.ctx.fillRect(x - 20, y, 40, 40);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(e.name, x, y + 55);
        const hpRatio = e.hp / e.maxHP;
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(x - 20, y + 42, 40, 4);
        this.ctx.fillStyle = hpRatio > 0.3 ? '#4c4' : '#c44';
        this.ctx.fillRect(x - 20, y + 42, 40 * hpRatio, 4);
      } else {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x - 20, y, 40, 40);
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(e.name, x, y + 55);
      }

      // Target cursor
      if (this.phase === 'target' && e.alive) {
        const aliveEnemies = enemies.filter(en => en.alive);
        const aliveIdx = aliveEnemies.indexOf(e);
        if (aliveIdx === this.targetCursor) {
          this.ctx.fillStyle = '#ff0';
          this.ctx.font = '14px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('▼', x, y - 5);
        }
      }
    }
  }

  drawDamageNums(ctx) {
    for (const d of this.effect.damageNums) {
      ctx.fillStyle = d.color;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, d.life / 10);
      ctx.fillText(d.text, d.x, d.y);
    }
    ctx.globalAlpha = 1;
  }

  drawPlayerStatus(state) {
    const ctx = this.ctx;
    const y = 230;
    ctx.fillStyle = 'rgba(0,0,40,0.85)';
    ctx.fillRect(0, y, 400, 90);
    ctx.strokeStyle = '#446';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, y, 400, 90);

    const players = state.players;
    const colW = 85;
    const startX = 140;

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const px = startX + i * colW;
      const py = y + 8;

      // Current turn indicator
      if (state.currentUnit && state.currentUnit.isPlayer && state.currentUnit.name === p.name) {
        ctx.fillStyle = '#ff0';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('▶', px - 10, py + 10);
      }

      ctx.fillStyle = p.alive ? '#fff' : '#666';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(p.name, px, py + 10);

      // HP
      ctx.fillStyle = '#aaa';
      ctx.font = '10px monospace';
      ctx.fillText(`HP`, px, py + 24);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.fillText(`${p.hp}/${p.maxHP}`, px + 75, py + 24);
      ctx.textAlign = 'left';

      // HP bar
      const hpRatio = p.hp / p.maxHP;
      ctx.fillStyle = '#333';
      ctx.fillRect(px, py + 27, 75, 4);
      ctx.fillStyle = hpRatio > 0.3 ? '#4c4' : '#c44';
      ctx.fillRect(px, py + 27, 75 * hpRatio, 4);

      // MP
      ctx.fillStyle = '#aaa';
      ctx.fillText(`MP`, px, py + 42);
      ctx.fillStyle = '#ccf';
      ctx.textAlign = 'right';
      ctx.fillText(`${p.mp}/${p.maxMP}`, px + 75, py + 42);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#333';
      ctx.fillRect(px, py + 45, 75, 3);
      ctx.fillStyle = '#48f';
      ctx.fillRect(px, py + 45, 75 * (p.mp / Math.max(1, p.maxMP)), 3);
    }
  }

  drawCommandMenu() {
    const ctx = this.ctx;
    const x = 8, y = 238;
    ctx.fillStyle = 'rgba(10,10,50,0.92)';
    ctx.fillRect(x, y, 115, 76);
    ctx.strokeStyle = '#66a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 115, 76);

    ctx.font = '13px sans-serif';
    for (let i = 0; i < this.commands.length; i++) {
      ctx.fillStyle = i === this.cursor ? '#ff0' : '#ddd';
      ctx.textAlign = 'left';
      const prefix = i === this.cursor ? '▶ ' : '   ';
      ctx.fillText(prefix + this.commands[i].label, x + 8, y + 20 + i * 22);
    }
  }

  drawTargetSelect(battleState) {
    const ctx = this.ctx;
    const x = 8, y = 238;
    ctx.fillStyle = 'rgba(50,10,10,0.92)';
    ctx.fillRect(x, y, 125, 76);
    ctx.strokeStyle = '#a66';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 125, 76);

    const aliveEnemies = battleState.enemies.filter(e => e.alive);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#fcc';
    ctx.textAlign = 'left';
    ctx.fillText('ターゲット:', x + 8, y + 14);

    for (let i = 0; i < aliveEnemies.length && i < 3; i++) {
      ctx.fillStyle = i === this.targetCursor ? '#ff0' : '#ddd';
      const prefix = i === this.targetCursor ? '▶ ' : '   ';
      ctx.fillText(prefix + aliveEnemies[i].name, x + 8, y + 32 + i * 18);
    }
  }

  drawLog(state) {
    const ctx = this.ctx;
    const logs = state.log;
    if (logs.length === 0) return;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 205, 400, 25);

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eee';
    // Show latest message
    ctx.fillText(logs[logs.length - 1], 200, 221);
  }

  reset() {
    this.phase = 'command';
    this.cursor = 0;
  }
}

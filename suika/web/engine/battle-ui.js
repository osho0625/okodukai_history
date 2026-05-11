// battle-ui.js — Battle screen UI renderer with 3D model display

import { CMD, BATTLE_RESULT } from './battle.js';
import { Vec3, Color, Mat4 } from './math.js';

// Simple flash/shake effect state
class BattleEffect {
  constructor() {
    this.flash = 0;
    this.flashColor = '#fff';
    this.shake = 0;
    this.shakeX = 0;
    this.damageNums = []; // { text, x, y, life, color }
    this.particles = [];  // { x, y, vx, vy, life, color, size }
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

  // Spawn particles at position (for magic/heal effects)
  spawnParticles(x, y, count, color, spread = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 1,
        life: 20 + Math.floor(Math.random() * 15),
        color,
        size: 2 + Math.random() * 3,
      });
    }
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
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life--;
      return p.life > 0;
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
    this.subCursor = 0;
    this.phase = 'command'; // command, target, skill, item, skillTarget, itemTarget
    this.commands = [
      { label: 'こうげき', cmd: CMD.ATTACK },
      { label: 'まほう', cmd: CMD.SKILL },
      { label: 'アイテム', cmd: CMD.ITEM },
      { label: 'ぼうぎょ', cmd: CMD.DEFEND },
      { label: 'にげる', cmd: CMD.RUN },
    ];
    this.effect = new BattleEffect();
    this.lastLogLen = 0;
    this.enemyPats = []; // model pattern indices for enemies
    this.selectedSkill = -1;
    this.selectedItem = -1;
    // Player inventory (simplified: indices into paramAll.items)
    this.inventory = [];
    this.playerSkills = [];
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
      if (newMsg.includes('倒した') || newMsg.includes('倒れた')) {
        this.effect.triggerFlash('#ff0', 6);
      }
      if (newMsg.includes('魔法') || newMsg.includes('唱えた')) {
        this.effect.spawnParticles(200, 100, 12, '#8af');
      }
      if (newMsg.includes('回復')) {
        this.effect.spawnParticles(200, 250, 8, '#4f8');
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
        if (selected.cmd === CMD.SKILL) {
          this.phase = 'skill';
          this.subCursor = 0;
          // Build skill list for current player
          this.buildSkillList(battleState);
          return null;
        }
        if (selected.cmd === CMD.ITEM) {
          this.phase = 'item';
          this.subCursor = 0;
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
    } else if (this.phase === 'skill') {
      if (this.playerSkills.length === 0) {
        this.phase = 'command';
        return null;
      }
      if (this.input.isKeyDown('arrowup')) {
        this.subCursor = (this.subCursor - 1 + this.playerSkills.length) % this.playerSkills.length;
      }
      if (this.input.isKeyDown('arrowdown')) {
        this.subCursor = (this.subCursor + 1) % this.playerSkills.length;
      }
      if (this.input.isOK()) {
        const skill = this.playerSkills[this.subCursor];
        this.selectedSkill = skill.index;
        // Check if skill needs target selection
        if (skill.object === 0) { // single enemy
          this.phase = 'skillTarget';
          this.targetCursor = 0;
        } else if (skill.object === 2) { // single ally
          this.phase = 'skillAllyTarget';
          this.targetCursor = 0;
        } else {
          // All targets or self — execute immediately
          this.phase = 'command';
          return { cmd: CMD.SKILL, target: 0, extra: skill.index };
        }
        return null;
      }
      if (this.input.isCancel()) {
        this.phase = 'command';
      }
    } else if (this.phase === 'skillTarget') {
      const aliveEnemies = battleState.enemies.filter(e => e.alive);
      if (aliveEnemies.length === 0) { this.phase = 'skill'; return null; }
      if (this.input.isKeyDown('arrowup') || this.input.isKeyDown('arrowleft')) {
        this.targetCursor = (this.targetCursor - 1 + aliveEnemies.length) % aliveEnemies.length;
      }
      if (this.input.isKeyDown('arrowdown') || this.input.isKeyDown('arrowright')) {
        this.targetCursor = (this.targetCursor + 1) % aliveEnemies.length;
      }
      if (this.input.isOK()) {
        const target = this.targetCursor;
        this.phase = 'command';
        return { cmd: CMD.SKILL, target, extra: this.selectedSkill };
      }
      if (this.input.isCancel()) { this.phase = 'skill'; }
    } else if (this.phase === 'skillAllyTarget') {
      const alivePlayers = battleState.players.filter(p => p.alive);
      if (alivePlayers.length === 0) { this.phase = 'skill'; return null; }
      if (this.input.isKeyDown('arrowup') || this.input.isKeyDown('arrowleft')) {
        this.targetCursor = (this.targetCursor - 1 + alivePlayers.length) % alivePlayers.length;
      }
      if (this.input.isKeyDown('arrowdown') || this.input.isKeyDown('arrowright')) {
        this.targetCursor = (this.targetCursor + 1) % alivePlayers.length;
      }
      if (this.input.isOK()) {
        const target = this.targetCursor;
        this.phase = 'command';
        return { cmd: CMD.SKILL, target, extra: this.selectedSkill };
      }
      if (this.input.isCancel()) { this.phase = 'skill'; }
    } else if (this.phase === 'item') {
      if (this.inventory.length === 0) {
        this.phase = 'command';
        return null;
      }
      if (this.input.isKeyDown('arrowup')) {
        this.subCursor = (this.subCursor - 1 + this.inventory.length) % this.inventory.length;
      }
      if (this.input.isKeyDown('arrowdown')) {
        this.subCursor = (this.subCursor + 1) % this.inventory.length;
      }
      if (this.input.isOK()) {
        const item = this.inventory[this.subCursor];
        this.selectedItem = item.index;
        // Items typically target allies
        this.phase = 'itemTarget';
        this.targetCursor = 0;
        return null;
      }
      if (this.input.isCancel()) {
        this.phase = 'command';
      }
    } else if (this.phase === 'itemTarget') {
      const players = battleState.players;
      if (this.input.isKeyDown('arrowup') || this.input.isKeyDown('arrowleft')) {
        this.targetCursor = (this.targetCursor - 1 + players.length) % players.length;
      }
      if (this.input.isKeyDown('arrowdown') || this.input.isKeyDown('arrowright')) {
        this.targetCursor = (this.targetCursor + 1) % players.length;
      }
      if (this.input.isOK()) {
        const target = this.targetCursor;
        this.phase = 'command';
        // Remove used item from inventory
        this.inventory.splice(this.subCursor, 1);
        return { cmd: CMD.ITEM, target, extra: this.selectedItem };
      }
      if (this.input.isCancel()) { this.phase = 'item'; }
    }
    return null;
  }

  buildSkillList(battleState) {
    // Get skills available to current player (simplified: first few skills from paramAll)
    this.playerSkills = [];
    const currentMP = battleState.currentUnit ? battleState.currentUnit.mp : 0;
    // Use first 8 skills from paramAll as available skills
    for (let i = 0; i < Math.min(8, this.paramAll.skills.length); i++) {
      const s = this.paramAll.skills[i];
      if (s.name && s.name.trim()) {
        this.playerSkills.push({ ...s, index: i, canUse: currentMP >= s.mp });
      }
    }
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
      } else if (this.phase === 'target' || this.phase === 'skillTarget') {
        this.drawTargetSelect(battleState);
      } else if (this.phase === 'skill') {
        this.drawSkillMenu();
      } else if (this.phase === 'skillAllyTarget' || this.phase === 'itemTarget') {
        this.drawAllyTargetSelect(battleState);
      } else if (this.phase === 'item') {
        this.drawItemMenu();
      }
    }

    // Battle log
    this.drawLog(battleState);

    ctx.restore();
  }

  drawBattleGround(ctx) {
    // Draw a perspective ground plane with grid lines
    // Simulates the original's 9x9 ground tile grid
    ctx.save();
    const horizon = 120;
    const bottom = 200;

    // Ground fill (gradient from dark to lighter)
    const grd = ctx.createLinearGradient(0, horizon, 0, bottom);
    grd.addColorStop(0, 'rgba(40,60,40,0.6)');
    grd.addColorStop(1, 'rgba(60,80,50,0.8)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(400, horizon);
    ctx.lineTo(400, bottom);
    ctx.lineTo(0, bottom);
    ctx.closePath();
    ctx.fill();

    // Grid lines (horizontal)
    ctx.strokeStyle = 'rgba(80,100,60,0.4)';
    ctx.lineWidth = 1;
    for (let z = 0; z < 8; z++) {
      const t = z / 8;
      const y = horizon + (bottom - horizon) * t;
      const spread = 100 + t * 200;
      ctx.beginPath();
      ctx.moveTo(200 - spread, y);
      ctx.lineTo(200 + spread, y);
      ctx.stroke();
    }
    // Grid lines (vertical, perspective)
    for (let x = -3; x <= 3; x++) {
      ctx.beginPath();
      ctx.moveTo(200 + x * 15, horizon);
      ctx.lineTo(200 + x * 55, bottom);
      ctx.stroke();
    }
    ctx.restore();
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
    // Draw particles
    for (const p of this.effect.particles) {
      ctx.globalAlpha = Math.min(1, p.life / 10);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
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
    const x = 8, y = 232;
    const h = 16 + this.commands.length * 18;
    ctx.fillStyle = 'rgba(10,10,50,0.92)';
    ctx.fillRect(x, y, 115, h);
    ctx.strokeStyle = '#66a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 115, h);

    ctx.font = '12px sans-serif';
    for (let i = 0; i < this.commands.length; i++) {
      ctx.fillStyle = i === this.cursor ? '#ff0' : '#ddd';
      ctx.textAlign = 'left';
      const prefix = i === this.cursor ? '▶ ' : '   ';
      ctx.fillText(prefix + this.commands[i].label, x + 8, y + 15 + i * 18);
    }
  }

  drawSkillMenu() {
    const ctx = this.ctx;
    const x = 8, y = 232;
    const maxShow = 5;
    const h = 18 + Math.min(this.playerSkills.length, maxShow) * 16;
    ctx.fillStyle = 'rgba(10,10,60,0.94)';
    ctx.fillRect(x, y, 160, h);
    ctx.strokeStyle = '#68a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 160, h);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#adf';
    ctx.textAlign = 'left';
    ctx.fillText('まほう (X:もどる)', x + 8, y + 12);

    const startIdx = Math.max(0, this.subCursor - maxShow + 1);
    for (let i = 0; i < maxShow && startIdx + i < this.playerSkills.length; i++) {
      const idx = startIdx + i;
      const s = this.playerSkills[idx];
      const canUse = s.canUse;
      ctx.fillStyle = idx === this.subCursor ? (canUse ? '#ff0' : '#a66') : (canUse ? '#ddd' : '#666');
      const prefix = idx === this.subCursor ? '▶' : '  ';
      ctx.textAlign = 'left';
      ctx.fillText(`${prefix}${s.name}`, x + 8, y + 28 + i * 16);
      ctx.textAlign = 'right';
      ctx.fillStyle = canUse ? '#8cf' : '#666';
      ctx.fillText(`MP${s.mp}`, x + 152, y + 28 + i * 16);
    }
  }

  drawItemMenu() {
    const ctx = this.ctx;
    const x = 8, y = 232;
    const maxShow = 5;
    const items = this.inventory;
    if (items.length === 0) {
      ctx.fillStyle = 'rgba(10,10,60,0.94)';
      ctx.fillRect(x, y, 140, 34);
      ctx.strokeStyle = '#68a';
      ctx.strokeRect(x, y, 140, 34);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.textAlign = 'left';
      ctx.fillText('アイテムがない', x + 8, y + 22);
      return;
    }
    const h = 18 + Math.min(items.length, maxShow) * 16;
    ctx.fillStyle = 'rgba(10,40,10,0.94)';
    ctx.fillRect(x, y, 160, h);
    ctx.strokeStyle = '#6a6';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 160, h);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#afc';
    ctx.textAlign = 'left';
    ctx.fillText('アイテム (X:もどる)', x + 8, y + 12);

    const startIdx = Math.max(0, this.subCursor - maxShow + 1);
    for (let i = 0; i < maxShow && startIdx + i < items.length; i++) {
      const idx = startIdx + i;
      const item = items[idx];
      ctx.fillStyle = idx === this.subCursor ? '#ff0' : '#ddd';
      const prefix = idx === this.subCursor ? '▶' : '  ';
      ctx.textAlign = 'left';
      ctx.fillText(`${prefix}${item.name}`, x + 8, y + 28 + i * 16);
    }
  }

  drawAllyTargetSelect(battleState) {
    const ctx = this.ctx;
    const x = 8, y = 238;
    const players = battleState.players;
    ctx.fillStyle = 'rgba(10,30,50,0.92)';
    ctx.fillRect(x, y, 130, 14 + players.length * 18);
    ctx.strokeStyle = '#6a8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 130, 14 + players.length * 18);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#cfc';
    ctx.textAlign = 'left';
    ctx.fillText('だれに？', x + 8, y + 12);

    for (let i = 0; i < players.length; i++) {
      ctx.fillStyle = i === this.targetCursor ? '#ff0' : (players[i].alive ? '#ddd' : '#666');
      const prefix = i === this.targetCursor ? '▶ ' : '   ';
      ctx.fillText(prefix + players[i].name, x + 8, y + 28 + i * 18);
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
    this.subCursor = 0;
  }
}

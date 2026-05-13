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
    // Skill animation overlays
    this.skillAnim = null; // { type, frame, maxFrame, x, y, ... }
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

  // Trigger a distinct skill animation overlay
  triggerSkillAnim(type, x, y) {
    this.skillAnim = { type, frame: 0, maxFrame: getSkillAnimDuration(type), x, y };
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
    // Advance skill animation
    if (this.skillAnim) {
      this.skillAnim.frame++;
      if (this.skillAnim.frame >= this.skillAnim.maxFrame) {
        this.skillAnim = null;
      }
    }
  }
}

// Skill animation types and durations
const SKILL_ANIM_TYPE = {
  SLASH: 'slash',           // Physical slash lines
  FIRE: 'fire',             // Fire burst
  ICE: 'ice',              // Ice crystals
  THUNDER: 'thunder',       // Lightning bolt
  WIND: 'wind',            // Wind spiral
  HOLY: 'holy',            // Holy light rays
  DARK: 'dark',            // Dark vortex
  HEAL: 'heal',            // Green rising sparkles
  BUFF: 'buff',            // Golden aura
  DEBUFF: 'debuff',        // Purple drain
  POISON: 'poison',        // Green bubbles
  DRAIN: 'drain',          // Red energy flow
  MULTI_SLASH: 'multiSlash', // Multiple slash lines
  EXPLOSION: 'explosion',   // Large explosion
};

function getSkillAnimDuration(type) {
  switch (type) {
    case SKILL_ANIM_TYPE.SLASH: return 12;
    case SKILL_ANIM_TYPE.FIRE: return 20;
    case SKILL_ANIM_TYPE.ICE: return 18;
    case SKILL_ANIM_TYPE.THUNDER: return 15;
    case SKILL_ANIM_TYPE.WIND: return 22;
    case SKILL_ANIM_TYPE.HOLY: return 25;
    case SKILL_ANIM_TYPE.DARK: return 20;
    case SKILL_ANIM_TYPE.HEAL: return 20;
    case SKILL_ANIM_TYPE.BUFF: return 16;
    case SKILL_ANIM_TYPE.DEBUFF: return 16;
    case SKILL_ANIM_TYPE.POISON: return 18;
    case SKILL_ANIM_TYPE.DRAIN: return 18;
    case SKILL_ANIM_TYPE.MULTI_SLASH: return 18;
    case SKILL_ANIM_TYPE.EXPLOSION: return 24;
    default: return 15;
  }
}

// Draw skill animation overlay on canvas
function drawSkillAnimation(ctx, anim) {
  if (!anim) return;
  const { type, frame, maxFrame, x, y } = anim;
  const t = frame / maxFrame; // 0..1 progress
  ctx.save();

  switch (type) {
    case SKILL_ANIM_TYPE.SLASH: {
      // Diagonal slash lines
      const alpha = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 30 + t * 60, y - 20);
      ctx.lineTo(x + 30 - t * 20, y + 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 20 - t * 40, y - 15);
      ctx.lineTo(x - 20 + t * 50, y + 25);
      ctx.stroke();
      break;
    }
    case SKILL_ANIM_TYPE.FIRE: {
      // Fire burst — expanding orange/red circles + rising particles
      const alpha = t < 0.5 ? 1 : 1 - (t - 0.5) * 2;
      ctx.globalAlpha = alpha * 0.7;
      const radius = 10 + t * 40;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, '#ff4');
      grad.addColorStop(0.5, '#f80');
      grad.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      // Fire tongues
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + t * 3;
        const r = radius * 0.6 * (0.5 + Math.sin(frame * 0.5 + i) * 0.5);
        ctx.fillStyle = `rgba(255,${100 + i * 30},0,${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 4 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case SKILL_ANIM_TYPE.ICE: {
      // Ice crystals — blue shards radiating outward
      const alpha = t < 0.4 ? t / 0.4 : 1 - (t - 0.4) / 0.6;
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = t * 35;
        const cx = x + Math.cos(angle) * dist;
        const cy = y + Math.sin(angle) * dist;
        ctx.fillStyle = '#8df';
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle + t * 2);
        ctx.fillRect(-3, -6, 6, 12); // crystal shard
        ctx.restore();
      }
      // Center glow
      ctx.fillStyle = `rgba(180,220,255,${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, 15 - t * 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case SKILL_ANIM_TYPE.THUNDER: {
      // Lightning bolt — jagged line from top
      const alpha = t < 0.2 ? 1 : (t < 0.5 ? 1 : 1 - (t - 0.5) * 2);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 2 + (1 - t) * 3;
      ctx.beginPath();
      let bx = x, by = y - 60;
      ctx.moveTo(bx, by);
      const segments = 6;
      for (let i = 0; i < segments; i++) {
        bx += (Math.random() - 0.5) * 20;
        by += 60 / segments;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
      // Flash at impact
      if (t < 0.3) {
        ctx.fillStyle = `rgba(255,255,200,${(0.3 - t) * 2})`;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case SKILL_ANIM_TYPE.WIND: {
      // Wind spiral — curved lines rotating
      const alpha = t < 0.3 ? t / 0.3 : (t > 0.8 ? (1 - t) / 0.2 : 1);
      ctx.globalAlpha = alpha * 0.6;
      ctx.strokeStyle = '#afa';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const baseAngle = t * Math.PI * 4 + (i / 3) * Math.PI * 2;
        for (let j = 0; j <= 20; j++) {
          const a = baseAngle + j * 0.3;
          const r = 5 + j * 1.5;
          const px = x + Math.cos(a) * r;
          const py = y + Math.sin(a) * r * 0.6;
          if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      break;
    }
    case SKILL_ANIM_TYPE.HOLY: {
      // Holy light — rays from above
      const alpha = t < 0.3 ? t / 0.3 : (t > 0.7 ? (1 - t) / 0.3 : 1);
      ctx.globalAlpha = alpha * 0.5;
      for (let i = 0; i < 5; i++) {
        const rx = x - 20 + i * 10 + Math.sin(frame * 0.3 + i) * 5;
        ctx.fillStyle = `rgba(255,255,200,${alpha * 0.4})`;
        ctx.fillRect(rx, y - 50, 3, 60 + t * 20);
      }
      // Center glow
      ctx.fillStyle = `rgba(255,255,220,${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(x, y, 12 + Math.sin(frame * 0.5) * 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case SKILL_ANIM_TYPE.DARK: {
      // Dark vortex — purple/black swirl
      const alpha = t < 0.3 ? t / 0.3 : (t > 0.7 ? (1 - t) / 0.3 : 1);
      ctx.globalAlpha = alpha * 0.7;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 30 + t * 10);
      grad.addColorStop(0, 'rgba(80,0,120,0.8)');
      grad.addColorStop(0.6, 'rgba(40,0,80,0.4)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 30 + t * 10, 0, Math.PI * 2);
      ctx.fill();
      // Swirl lines
      ctx.strokeStyle = '#a4f';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const a = t * Math.PI * 3 + (i / 4) * Math.PI * 2;
        const r = 15 + t * 15;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3, r * 0.4, a, a + 1.5);
        ctx.stroke();
      }
      break;
    }
    case SKILL_ANIM_TYPE.HEAL: {
      // Green rising sparkles
      const alpha = t < 0.2 ? t / 0.2 : (t > 0.8 ? (1 - t) / 0.2 : 1);
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 8; i++) {
        const px = x - 20 + (i % 4) * 13 + Math.sin(frame * 0.4 + i) * 5;
        const py = y + 20 - t * 50 - i * 4;
        const size = 2 + Math.sin(frame * 0.6 + i * 2) * 1.5;
        ctx.fillStyle = i % 2 === 0 ? '#4f8' : '#8fc';
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case SKILL_ANIM_TYPE.BUFF: {
      // Golden aura ring expanding
      const alpha = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
      ctx.globalAlpha = alpha * 0.6;
      ctx.strokeStyle = '#fd0';
      ctx.lineWidth = 2;
      const r = 10 + t * 30;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      // Inner sparkles
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + frame * 0.3;
        ctx.fillStyle = '#ff8';
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case SKILL_ANIM_TYPE.DEBUFF: {
      // Purple downward drain
      const alpha = t < 0.2 ? t / 0.2 : (t > 0.7 ? (1 - t) / 0.3 : 1);
      ctx.globalAlpha = alpha * 0.6;
      for (let i = 0; i < 6; i++) {
        const px = x - 15 + i * 6;
        const py = y - 20 + t * 40 + Math.sin(i + frame * 0.5) * 5;
        ctx.fillStyle = `rgba(160,60,255,${0.4 + Math.sin(i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case SKILL_ANIM_TYPE.POISON: {
      // Green bubbles rising
      const alpha = t < 0.2 ? t / 0.2 : (t > 0.8 ? (1 - t) / 0.2 : 1);
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 6; i++) {
        const px = x - 15 + (i % 3) * 15 + Math.sin(frame * 0.3 + i * 2) * 4;
        const py = y + 10 - t * 30 - i * 5;
        const size = 3 + Math.sin(frame * 0.4 + i) * 1.5;
        ctx.strokeStyle = '#8f0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case SKILL_ANIM_TYPE.DRAIN: {
      // Red energy flowing from target to caster
      const alpha = t < 0.2 ? t / 0.2 : (t > 0.8 ? (1 - t) / 0.2 : 1);
      ctx.globalAlpha = alpha * 0.7;
      for (let i = 0; i < 5; i++) {
        const progress = (t + i * 0.15) % 1;
        const px = x + (200 - x) * progress;
        const py = y + (250 - y) * progress + Math.sin(progress * Math.PI * 3) * 10;
        ctx.fillStyle = '#f44';
        ctx.beginPath();
        ctx.arc(px, py, 3 - progress * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case SKILL_ANIM_TYPE.MULTI_SLASH: {
      // Multiple slash lines in sequence
      const alpha = t < 0.1 ? t / 0.1 : (t > 0.8 ? (1 - t) / 0.2 : 1);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      const slashCount = 3;
      for (let i = 0; i < slashCount; i++) {
        const st = i / slashCount;
        if (t < st || t > st + 0.4) continue;
        const lt = (t - st) / 0.4;
        const sx = x - 25 + i * 15;
        ctx.beginPath();
        ctx.moveTo(sx + lt * 30, y - 20 + i * 5);
        ctx.lineTo(sx + lt * 30 + 15, y + 20 - i * 3);
        ctx.stroke();
      }
      break;
    }
    case SKILL_ANIM_TYPE.EXPLOSION: {
      // Large explosion — expanding ring + debris
      const alpha = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7;
      ctx.globalAlpha = alpha;
      const r = t * 50;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255,200,50,${alpha})`);
      grad.addColorStop(0.4, `rgba(255,100,0,${alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(100,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Ring
      ctx.strokeStyle = `rgba(255,200,100,${alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
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
      { label: '盗む', cmd: CMD.STEAL, needAbility: true },
      { label: 'ぶん取る', cmd: CMD.SEIZE, needAbility: true },
      { label: 'ぼうぎょ', cmd: CMD.DEFEND },
      { label: 'にげる', cmd: CMD.RUN },
    ];
    this.effect = new BattleEffect();
    this.lastLogLen = 0;
    this.enemyPats = [];
    this.selectedSkill = -1;
    this.selectedItem = -1;
    this.inventory = [];
    this.playerSkills = [];
    // Attack animation state
    this.attackAnim = null; // { who: 'player'|'enemy', idx, frame, maxFrame }
    // Player model indices (set from main.js)
    this.playerModelPats = [];
    this.playerCount = 0;
    // Track last skill kind for animation selection
    this._lastSkillKind = -1;
    // Player skill sets (set from main.js per character)
    this.playerSkillSets = null;
    // Ability flags for steal/seize commands
    this.hasSteal = false;
    this.hasSeize = false;
    this._pendingCmd = null;
    // Cosmic background mode (space areas)
    this.cosmoMode = false;
  }

  setEnemyPats(pats) {
    this.enemyPats = pats;
    this.enemyDeathTimers = new Array(pats.length).fill(0); // death fade timer per enemy
    this._prevAlive = null;
  }

  // Get commands available to current player (filter steal/seize by ability)
  getAvailableCommands() {
    return this.commands.filter(c => {
      if (!c.needAbility) return true;
      // Check if current player has steal/seize ability
      // hasSteal/hasSeize are set from main.js based on learned abilities
      if (c.cmd === CMD.STEAL) return this.hasSteal;
      if (c.cmd === CMD.SEIZE) return this.hasSeize;
      return true;
    });
  }

  update(battleState) {
    this.effect.update();

    // Fast-forward: advance animations faster (controlled by main.js)
    const fastForward = !!this._fastForward;
    const animSpeed = fastForward ? 3 : 1;

    // Advance attack animation
    if (this.attackAnim) {
      this.attackAnim.frame += animSpeed;
      if (this.attackAnim.frame >= this.attackAnim.maxFrame) {
        this.attackAnim = null;
      }
    }

    // Fast-forward effect animations too
    if (fastForward) {
      this.effect.update();
      this.effect.update(); // 2 extra updates = 3x speed total
    }

    // Detect new log entries for effects
    if (battleState.log.length > this.lastLogLen) {
      const newMsg = battleState.log[battleState.log.length - 1];

      // Calculate target position for effects
      // Use stored screen positions from 3D rendering if available
      const enemyCount = battleState.enemies.length;
      const eSpacing = enemyCount <= 2 ? 80 : 60;
      const eStartX = 200 - (enemyCount - 1) * eSpacing / 2;
      let eX, eY;
      const targetEIdx = this._lastTarget !== undefined ? this._lastTarget : (this.targetCursor || 0);
      if (this._enemyScreenPos && this._enemyScreenPos[targetEIdx]) {
        eX = this._enemyScreenPos[targetEIdx].x;
        eY = this._enemyScreenPos[targetEIdx].y;
      } else {
        // Fallback for placeholder rendering
        eX = eStartX + targetEIdx * eSpacing;
        eY = 90;
      }

      // Player positions (bottom area of screen)
      const pCount = battleState.players.length;
      const pSpacing = pCount <= 2 ? 80 : 60;
      const pStartX = 200 - (pCount - 1) * pSpacing / 2;
      const pY = 240;

      // Determine who is being targeted
      const curUnit = battleState.currentUnit;
      const isPlayerActing = curUnit && curUnit.isPlayer;
      // When player attacks → effect on enemy; when enemy attacks → effect on player (center of party)
      let targetX, targetY;
      if (isPlayerActing) {
        targetX = eX;
        targetY = eY;
      } else {
        // Enemy attacking: effect on player party center
        targetX = 200;
        targetY = pY;
      }
      // Effect on self (buffs/heals go on the caster)
      let selfX, selfY;
      if (isPlayerActing) {
        const pIdx = curUnit ? curUnit.index : 0;
        selfX = pStartX + pIdx * pSpacing;
        selfY = pY;
      } else {
        // Enemy self-buff: use enemy screen position
        const eIdx = curUnit ? curUnit.index : 0;
        if (this._enemyScreenPos && this._enemyScreenPos[eIdx]) {
          selfX = this._enemyScreenPos[eIdx].x;
          selfY = this._enemyScreenPos[eIdx].y;
        } else {
          selfX = eX;
          selfY = eY;
        }
      }

      if (newMsg.includes('ダメージ') && !newMsg.includes('毒で') && !newMsg.includes('吸収')) {
        this.effect.triggerFlash('#f44', 3);
        this.effect.triggerShake(4);
        if (newMsg.includes('の攻撃')) {
          this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.SLASH, targetX, targetY);
          if (isPlayerActing) {
            this.attackAnim = { who: 'player', idx: curUnit.index, frame: 0, maxFrame: 10 };
          } else {
            this.attackAnim = { who: 'enemy', idx: curUnit.index, frame: 0, maxFrame: 10 };
          }
        }
        if (newMsg.includes('強攻撃')) {
          this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.MULTI_SLASH, targetX, targetY);
          this.effect.spawnParticles(targetX, targetY, 10, '#fff', 40);
        }
        if (newMsg.includes('連続攻撃')) {
          this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.MULTI_SLASH, targetX, targetY);
        }
      }
      if (newMsg.includes('会心')) {
        this.effect.triggerFlash('#ff0', 8);
        this.effect.triggerShake(8);
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.EXPLOSION, targetX, targetY);
        this.effect.spawnParticles(targetX, targetY, 25, '#ff4', 60);
      }
      if (newMsg.includes('倒した') || newMsg.includes('倒れた')) {
        this.effect.triggerFlash('#ff0', 6);
        this.effect.spawnParticles(targetX, targetY, 15, '#f80');
      }
      if (newMsg.includes('魔法攻撃')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.FIRE, targetX, targetY);
        this.effect.triggerFlash('#f80', 2);
      }
      if (newMsg.includes('全体魔法')) {
        // All targets — spread across enemy/player line
        if (isPlayerActing) {
          // Use actual screen positions if available
          let centerX = eStartX + (enemyCount - 1) * eSpacing / 2;
          if (this._enemyScreenPos && this._enemyScreenPos.length > 0) {
            const positions = this._enemyScreenPos.filter(p => p);
            if (positions.length > 0) centerX = positions.reduce((s, p) => s + p.x, 0) / positions.length;
          }
          this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.THUNDER, centerX, eY);
          for (let i = 0; i < enemyCount; i++) {
            const px = (this._enemyScreenPos && this._enemyScreenPos[i]) ? this._enemyScreenPos[i].x : eStartX + i * eSpacing;
            const py = (this._enemyScreenPos && this._enemyScreenPos[i]) ? this._enemyScreenPos[i].y : eY;
            this.effect.spawnParticles(px, py, 6, '#ff0', 30);
          }
        } else {
          this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.THUNDER, 200, pY - 20);
          for (let i = 0; i < pCount; i++) {
            this.effect.spawnParticles(pStartX + i * pSpacing, pY, 6, '#ff0', 30);
          }
        }
      }
      if (newMsg.includes('唱えた')) {
        const skillKind = this._lastSkillKind;
        if (skillKind === 0) this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.FIRE, targetX, targetY);
        else if (skillKind === 1) this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.HEAL, selfX, selfY);
        else if (skillKind === 2) this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.BUFF, selfX, selfY);
        else if (skillKind === 3) this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.DEBUFF, targetX, targetY);
        else if (skillKind === 4) this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.POISON, targetX, targetY);
        this.effect.triggerFlash('#44f', 2);
      }
      if (newMsg.includes('回復魔法') || (newMsg.includes('HP') && newMsg.includes('回復'))) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.HEAL, selfX, selfY);
        this.effect.spawnParticles(selfX, selfY, 12, '#4f8', 40);
        this.effect.triggerFlash('#0f4', 2);
      }
      if (newMsg.includes('全体回復')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.HEAL, 200, selfY);
        for (let i = 0; i < enemyCount; i++) {
          const px = (this._enemyScreenPos && this._enemyScreenPos[i]) ? this._enemyScreenPos[i].x : eStartX + i * eSpacing;
          const py = (this._enemyScreenPos && this._enemyScreenPos[i]) ? this._enemyScreenPos[i].y : eY;
          this.effect.spawnParticles(px, py, 6, '#4f8', 25);
        }
      }
      if (newMsg.includes('防御力が上がった') || newMsg.includes('攻撃力が上がった') || newMsg.includes('素早さが上がった') || newMsg.includes('全能力')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.BUFF, selfX, selfY);
        this.effect.spawnParticles(selfX, selfY, 10, '#ff8', 30);
      }
      if (newMsg.includes('防御力が下がった') || newMsg.includes('攻撃力が下がった') || newMsg.includes('呪い')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.DEBUFF, targetX, targetY);
        this.effect.spawnParticles(targetX, targetY, 10, '#a4f', 30);
      }
      if (newMsg.includes('毒を受けた') || newMsg.includes('毒攻撃')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.POISON, targetX, targetY);
        this.effect.spawnParticles(targetX, targetY, 12, '#8f0', 40);
      }
      if (newMsg.includes('麻痺') || newMsg.includes('石になった')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.THUNDER, targetX, targetY);
        this.effect.triggerFlash('#ff0', 4);
        this.effect.spawnParticles(targetX, targetY, 15, '#cc0', 30);
      }
      if (newMsg.includes('混乱')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.DARK, targetX, targetY);
        this.effect.spawnParticles(targetX, targetY, 10, '#f0f', 40);
      }
      if (newMsg.includes('HP吸収') || newMsg.includes('吸い取った')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.DRAIN, targetX, targetY);
        this.effect.triggerFlash('#f44', 3);
      }
      if (newMsg.includes('蘇生') || newMsg.includes('復活')) {
        this.effect.triggerSkillAnim(SKILL_ANIM_TYPE.HOLY, selfX, selfY);
        this.effect.spawnParticles(selfX, selfY, 15, '#ffa', 40);
      }
      if (newMsg.includes('ミス')) {
        this.effect.spawnParticles(targetX, targetY, 4, '#888', 20);
      }
      this.lastLogLen = battleState.log.length;
    }

    if (battleState.state !== 'playerTurn') return null;

    if (this.phase === 'command') {
      const availCmds = this.getAvailableCommands();
      if (this.input.isUp()) {
        this.cursor = (this.cursor - 1 + availCmds.length) % availCmds.length;
      }
      if (this.input.isDown()) {
        this.cursor = (this.cursor + 1) % availCmds.length;
      }
      if (this.input.isOK()) {
        const selected = availCmds[this.cursor];
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
        if (selected.cmd === CMD.STEAL || selected.cmd === CMD.SEIZE) {
          this.phase = 'target';
          this.targetCursor = 0;
          this._pendingCmd = selected.cmd;
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
      if (this.input.isLeft() || this.input.isUp()) {
        this.targetCursor = (this.targetCursor - 1 + aliveEnemies.length) % aliveEnemies.length;
      }
      if (this.input.isRight() || this.input.isDown()) {
        this.targetCursor = (this.targetCursor + 1) % aliveEnemies.length;
      }
      if (this.input.isOK()) {
        // Convert alive-enemy index to full array index
        const aliveIdx = this.targetCursor;
        let realIdx = 0;
        let count = 0;
        for (let i = 0; i < battleState.enemies.length; i++) {
          if (battleState.enemies[i].alive) {
            if (count === aliveIdx) { realIdx = i; break; }
            count++;
          }
        }
        const cmd = this._pendingCmd || CMD.ATTACK;
        this._pendingCmd = null;
        this.phase = 'command';
        this._lastTarget = realIdx; // Store real enemy index for effect positioning
        return { cmd, target: realIdx };
      }
      if (this.input.isCancel()) {
        this.phase = 'command';
        this._pendingCmd = null;
      }
    } else if (this.phase === 'skill') {
      if (this.playerSkills.length === 0) {
        this.phase = 'command';
        return null;
      }
      if (this.input.isUp()) {
        this.subCursor = (this.subCursor - 1 + this.playerSkills.length) % this.playerSkills.length;
      }
      if (this.input.isDown()) {
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
      if (this.input.isUp() || this.input.isLeft()) {
        this.targetCursor = (this.targetCursor - 1 + aliveEnemies.length) % aliveEnemies.length;
      }
      if (this.input.isDown() || this.input.isRight()) {
        this.targetCursor = (this.targetCursor + 1) % aliveEnemies.length;
      }
      if (this.input.isOK()) {
        // Convert alive-enemy index to full array index
        let realIdx = 0, count = 0;
        for (let i = 0; i < battleState.enemies.length; i++) {
          if (battleState.enemies[i].alive) {
            if (count === this.targetCursor) { realIdx = i; break; }
            count++;
          }
        }
        this.phase = 'command';
        this._lastTarget = realIdx; // Store real enemy index for effect positioning
        return { cmd: CMD.SKILL, target: realIdx, extra: this.selectedSkill };
      }
      if (this.input.isCancel()) { this.phase = 'skill'; }
    } else if (this.phase === 'skillAllyTarget') {
      const alivePlayers = battleState.players.filter(p => p.alive);
      if (alivePlayers.length === 0) { this.phase = 'skill'; return null; }
      if (this.input.isUp() || this.input.isLeft()) {
        this.targetCursor = (this.targetCursor - 1 + alivePlayers.length) % alivePlayers.length;
      }
      if (this.input.isDown() || this.input.isRight()) {
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
      if (this.input.isUp()) {
        this.subCursor = (this.subCursor - 1 + this.inventory.length) % this.inventory.length;
      }
      if (this.input.isDown()) {
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
      if (this.input.isUp() || this.input.isLeft()) {
        this.targetCursor = (this.targetCursor - 1 + players.length) % players.length;
      }
      if (this.input.isDown() || this.input.isRight()) {
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
    // Get skills available to current player from playerSkillSets
    this.playerSkills = [];
    const currentMP = battleState.currentUnit ? battleState.currentUnit.mp : 0;
    const chrIdx = battleState.currentUnit ? battleState.currentUnit.index : 0;

    if (this.playerSkillSets && this.playerSkillSets[chrIdx]) {
      for (const s of this.playerSkillSets[chrIdx]) {
        this.playerSkills.push({ ...s, canUse: currentMP >= s.mp });
      }
    } else {
      // Fallback: first 8 skills from paramAll
      for (let i = 0; i < Math.min(8, this.paramAll.skills.length); i++) {
        const s = this.paramAll.skills[i];
        if (s.name && s.name.trim()) {
          this.playerSkills.push({ ...s, index: i, canUse: currentMP >= s.mp });
        }
      }
    }
  }

  draw(battleState) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.effect.shakeX, 0);

    // Background gradient (uses area back color if set)
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    const bgR = this.bgColor ? this.bgColor.r : 10;
    const bgG = this.bgColor ? this.bgColor.g : 10;
    const bgB = this.bgColor ? this.bgColor.b : 42;
    grad.addColorStop(0, `rgb(${bgR},${bgG},${bgB})`);
    grad.addColorStop(0.5, `rgb(${Math.min(255, bgR + 16)},${Math.min(255, bgG + 16)},${Math.min(255, bgB + 20)})`);
    grad.addColorStop(1, `rgb(${Math.floor(bgR * 0.5)},${Math.floor(bgG * 0.5)},${Math.floor(bgB * 0.5)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(-10, 0, 420, 320);

    // Cosmic starfield for space battles (flag 330/331)
    if (this.cosmoMode) {
      this.drawCosmoStars(ctx);
    }

    // Ground plane (simple perspective grid)
    this.drawBattleGround(ctx);

    // Draw player 3D models (foreground, facing away)
    this.drawPlayerModels(battleState);

    // Draw enemy 3D models
    this.drawEnemyModels(battleState);

    // Attack slash effect (drawn over enemies)
    if (this.effect.flash > 0 && this.effect.flashColor === '#f44') {
      // Draw slash lines
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      const cx = 200, cy = 110;
      for (let s = 0; s < 3; s++) {
        const angle = (this.effect.flash * 0.5 + s * 2.1);
        const len = 30 + this.effect.flash * 5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
        ctx.lineTo(cx - Math.cos(angle) * len, cy - Math.sin(angle) * len);
        ctx.stroke();
      }
    }

    // Flash overlay
    if (this.effect.flash > 0) {
      ctx.fillStyle = this.effect.flashColor;
      ctx.globalAlpha = this.effect.flash * 0.15;
      ctx.fillRect(-10, 0, 420, 320);
      ctx.globalAlpha = 1;
    }

    // Damage numbers
    this.drawDamageNums(ctx);

    // Skill animation overlay
    drawSkillAnimation(ctx, this.effect.skillAnim);

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

  drawPlayerModels(battleState) {
    if (!this.renderer || !this.models || this.playerModelPats.length === 0) return;
    const players = battleState.players;
    const count = Math.min(players.length, this.playerModelPats.length);

    // Camera: slightly further back for better framing
    const camAngle = Math.PI * 0.6;
    const eye = new Vec3(Math.sin(camAngle) * 2400, 1700, Math.cos(camAngle) * 2400);
    const at = new Vec3(0, 100, 0);
    this.renderer.viewTransform(eye, at);
    this.renderer.projTransform(10, 6000);
    this.renderer.setAmbient(new Color(80, 80, 100));
    this.renderer.light = { direction: new Vec3(-0.3, -0.8, 0.5).normalize() };

    for (let i = 0; i < count; i++) {
      const p = players[i];
      const modelIdx = this.playerModelPats[i];
      if (modelIdx < 0 || modelIdx >= this.models.length) continue;
      const model = this.models[modelIdx];
      if (!model || model.vertices.length === 0) continue;

      // Position players at Z=-280 (foreground), spread on X axis
      const spacing = count <= 2 ? 200 : 160;
      const startX = -(count - 1) * spacing / 2;
      const posX = startX + i * spacing;
      const posZ = -280;

      // Attack animation: move forward
      let animOffsetZ = 0;
      if (this.attackAnim && this.attackAnim.who === 'player' && this.attackAnim.idx === i) {
        const t = this.attackAnim.frame / this.attackAnim.maxFrame;
        if (t < 0.5) animOffsetZ = t / 0.5 * 200;       // move forward (fast)
        else animOffsetZ = (1 - (t - 0.5) / 0.5) * 200; // return immediately
      }

      const pos = new Vec3(posX, 0, posZ + animOffsetZ);
      const rot = new Vec3(0, Math.PI / 2, 0); // face right (toward enemies)
      const scl = new Vec3(1, 1, 1);

      if (!p.alive) this.ctx.globalAlpha = 0.3;

      const wvp = this.renderer.calcModel(model, pos, rot, scl);
      const worldMat = this.renderer.getTransform(3);
      this.renderer.drawModel(model, wvp, worldMat, 0, 0);

      // Current turn indicator
      if (battleState.currentUnit && battleState.currentUnit.isPlayer &&
          battleState.currentUnit.index === i) {
        const screenPos = this.renderer.get3DPos(wvp, new Vec3(0, model.topY + 30, 0));
        if (screenPos.y > 0 && screenPos.y < 320) {
          this.ctx.fillStyle = '#ff0';
          this.ctx.font = '10px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('▼', screenPos.x, screenPos.y - 5);
        }
      }

      this.ctx.globalAlpha = 1;
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

    // Setup camera for battle scene (adjusted for better enemy sizing)
    const camAngle = Math.PI * 0.6;
    const eye = new Vec3(Math.sin(camAngle) * 2400, 1700, Math.cos(camAngle) * 2400);
    const at = new Vec3(0, 100, 0);
    this.renderer.viewTransform(eye, at);
    this.renderer.projTransform(10, 6000);

    // Set lighting
    this.renderer.setAmbient(new Color(80, 80, 100));
    this.renderer.setRenderState('lightColor', new Color(200, 200, 180));
    this.renderer.light = { direction: new Vec3(-0.3, -0.8, 0.5).normalize() };

    for (let i = 0; i < totalEnemies; i++) {
      const e = enemies[i];

      // Track death transitions
      if (this._prevAlive && this._prevAlive[i] && !e.alive) {
        this.enemyDeathTimers[i] = 20; // 20 frames fade
      }
      if (this.enemyDeathTimers[i] > 0) {
        this.enemyDeathTimers[i]--;
      }

      // Skip fully dead enemies (after fade)
      if (!e.alive && this.enemyDeathTimers[i] <= 0) continue;

      // Death fade alpha
      const deathAlpha = !e.alive ? this.enemyDeathTimers[i] / 20 : 1;

      // Get model index from pat
      const pat = this.enemyPats[i] || 0;
      const model = this.models[pat];
      if (!model || model.vertices.length === 0) {
        // Draw placeholder
        this.drawEnemyPlaceholder(i, totalEnemies, e);
        continue;
      }

      // Position enemies in a row (at Z=+280, slightly further from camera)
      const spacing = totalEnemies <= 2 ? 220 : 160;
      const startX = -(totalEnemies - 1) * spacing / 2;
      const posX = startX + i * spacing;
      const posZ = 280;

      // Enemy attack animation: move forward (toward player)
      let animOffsetZ = 0;
      if (this.attackAnim && this.attackAnim.who === 'enemy' && this.attackAnim.idx === i) {
        const t = this.attackAnim.frame / this.attackAnim.maxFrame;
        if (t < 0.5) animOffsetZ = -(t / 0.5 * 200);       // move toward player
        else animOffsetZ = -((1 - (t - 0.5) / 0.5) * 200); // return immediately
      }

      const pos = new Vec3(posX, 0, posZ + animOffsetZ);
      const rot = new Vec3(0, Math.PI, 0); // face player
      const scl = new Vec3(0.9, 0.9, 0.9); // slightly smaller to prevent oversized appearance

      const wvp = this.renderer.calcModel(model, pos, rot, scl);
      const worldMat = this.renderer.getTransform(3); // TS_WORLD
      this.renderer.drawModel(model, wvp, worldMat, 0, 0);

      // Draw name below
      const screenPos = this.renderer.get3DPos(wvp, new Vec3(0, -10, 0));
      // Also get model top position for cursor
      const screenTop = this.renderer.get3DPos(wvp, new Vec3(0, model.topY || 50, 0));
      const screenCenter = this.renderer.get3DPos(wvp, new Vec3(0, (model.topY || 50) / 2, 0));

      // Store screen position for effects
      if (!this._enemyScreenPos) this._enemyScreenPos = [];
      this._enemyScreenPos[i] = { x: screenCenter.x, y: screenCenter.y };

      this.ctx.globalAlpha = deathAlpha;
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

      // Target cursor (above model top)
      if (this.phase === 'target') {
        const aliveIdx = aliveEnemies.indexOf(e);
        if (aliveIdx === this.targetCursor) {
          this.ctx.fillStyle = '#ff0';
          this.ctx.font = '14px sans-serif';
          this.ctx.fillText('▼', screenTop.x, Math.max(screenTop.y - 5, 20));
        }
      }
      this.ctx.globalAlpha = 1;
    }
    // Track alive state for death detection
    this._prevAlive = enemies.map(e => e.alive);
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

      // Name + status icons
      ctx.fillStyle = p.alive ? '#fff' : '#666';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      let nameStr = p.name;
      if (p.poison) nameStr += '☠';
      if (p.defending) nameStr += '🛡';
      ctx.fillText(nameStr, px, py + 10);

      // HP with gradient bar
      ctx.fillStyle = '#aaa';
      ctx.font = '10px monospace';
      ctx.fillText(`HP`, px, py + 24);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.fillText(`${p.hp}/${p.maxHP}`, px + 75, py + 24);
      ctx.textAlign = 'left';

      const hpRatio = p.hp / p.maxHP;
      ctx.fillStyle = '#222';
      ctx.fillRect(px, py + 27, 75, 5);
      // Gradient HP bar
      const hpGrad = ctx.createLinearGradient(px, 0, px + 75 * hpRatio, 0);
      if (hpRatio > 0.5) {
        hpGrad.addColorStop(0, '#4c4'); hpGrad.addColorStop(1, '#6e6');
      } else if (hpRatio > 0.25) {
        hpGrad.addColorStop(0, '#cc4'); hpGrad.addColorStop(1, '#ea6');
      } else {
        hpGrad.addColorStop(0, '#c44'); hpGrad.addColorStop(1, '#e66');
      }
      ctx.fillStyle = hpGrad;
      ctx.fillRect(px, py + 27, 75 * hpRatio, 5);

      // MP
      ctx.fillStyle = '#aaa';
      ctx.fillText(`MP`, px, py + 44);
      ctx.fillStyle = '#ccf';
      ctx.textAlign = 'right';
      ctx.fillText(`${p.mp}/${p.maxMP}`, px + 75, py + 44);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#222';
      ctx.fillRect(px, py + 47, 75, 4);
      const mpGrad = ctx.createLinearGradient(px, 0, px + 75 * (p.mp / Math.max(1, p.maxMP)), 0);
      mpGrad.addColorStop(0, '#38c'); mpGrad.addColorStop(1, '#6af');
      ctx.fillStyle = mpGrad;
      ctx.fillRect(px, py + 47, 75 * (p.mp / Math.max(1, p.maxMP)), 4);

      // Dead indicator
      if (!p.alive) {
        ctx.fillStyle = 'rgba(255,0,0,0.3)';
        ctx.fillRect(px - 2, py, 80, 55);
        ctx.fillStyle = '#f44';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('戦闘不能', px + 37, py + 60);
        ctx.textAlign = 'left';
      }
    }
  }

  drawCommandMenu() {
    const ctx = this.ctx;
    const availCmds = this.getAvailableCommands();
    const x = 8, y = 232;
    const h = 16 + availCmds.length * 18;
    ctx.fillStyle = 'rgba(10,10,50,0.92)';
    ctx.fillRect(x, y, 115, h);
    ctx.strokeStyle = '#66a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 115, h);

    ctx.font = '12px sans-serif';
    for (let i = 0; i < availCmds.length; i++) {
      ctx.fillStyle = i === this.cursor ? '#ff0' : '#ddd';
      ctx.textAlign = 'left';
      const prefix = i === this.cursor ? '▶ ' : '   ';
      ctx.fillText(prefix + availCmds[i].label, x + 8, y + 15 + i * 18);
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

    // Battle log background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 203, 400, 27);

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eee';
    // Show latest message (truncate if too long)
    let msg = logs[logs.length - 1];
    if (msg.length > 35) msg = msg.slice(0, 35) + '...';
    ctx.fillText(msg, 200, 220);

    // Turn indicator at top
    if (state.currentUnit) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(140, 0, 120, 16);
      ctx.fillStyle = state.currentUnit.isPlayer ? '#8f8' : '#f88';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${state.currentUnit.name}のターン`, 200, 12);
    }
  }

  reset() {
    this.phase = 'command';
    this.cursor = 0;
    this.subCursor = 0;
    this._pendingCmd = null;
  }

  // Cosmic starfield for space battle backgrounds
  drawCosmoStars(ctx) {
    if (!this._cosmoStars) {
      this._cosmoStars = [];
      for (let i = 0; i < 80; i++) {
        this._cosmoStars.push({
          x: Math.random() * 400,
          y: Math.random() * 200,
          speed: 0.2 + Math.random() * 0.8,
          size: 0.5 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    this._cosmoFrame = (this._cosmoFrame || 0) + 1;
    for (let i = 0; i < this._cosmoStars.length; i++) {
      const s = this._cosmoStars[i];
      s.x -= s.speed;
      if (s.x < 0) s.x += 400;
      const twinkle = 0.4 + Math.sin(this._cosmoFrame * 0.03 + s.phase) * 0.4;
      if (i < 30) ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
      else if (i < 50) ctx.fillStyle = `rgba(150,150,255,${twinkle})`;
      else if (i < 65) ctx.fillStyle = `rgba(100,100,255,${twinkle})`;
      else ctx.fillStyle = `rgba(255,255,180,${twinkle})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
  }
}

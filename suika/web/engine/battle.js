// battle.js — Turn-based battle system (ported from CBattleMain)
// Simplified HTML5 version with text-based UI

export const BATTLE_RESULT = { CONTINUE: 0, WIN: 1, LOSE: 2, RUN: 3 };
export const CMD = { ATTACK: 1, DEFEND: 2, SKILL: 3, ITEM: 4, RUN: 5, STEAL: 6, SEIZE: 7 };

// Skill kind categories (from SkillData.kind)
// 0=attack magic, 1=heal magic, 2=buff, 3=debuff, 4=status
const SKILL_KIND = { ATTACK: 0, HEAL: 1, BUFF: 2, DEBUFF: 3, STATUS: 4 };
// Skill object (target type): 0=single enemy, 1=all enemies, 2=single ally, 3=all allies, 4=self
const SKILL_OBJ = { ENEMY_ONE: 0, ENEMY_ALL: 1, ALLY_ONE: 2, ALLY_ALL: 3, SELF: 4 };
// Item kind: 0=consumable, 1=weapon, 2=armor, 3=accessory
// Item algo (workNo): determines effect type
const ITEM_ALGO = { HEAL_ONE: 1, HEAL_ALL: 2, CURE_POISON: 3, REVIVE: 6 };

class BattleUnit {
  constructor(param, isPlayer, index) {
    this.name = param.name;
    this.isPlayer = isPlayer;
    this.index = index;
    this.hp = param.hp;
    this.maxHP = param.maxHP;
    this.mp = param.mp;
    this.maxMP = param.maxMP;
    this.str = param.getStr();
    this.int_ = param.getInt();
    this.def = param.getDef();
    this.agi = param.getAgi();
    this.dex = param.getDex();
    this.pat = param.pat;
    this.algo = param.algo;
    this.exp = param.exp;
    this.gold = param.gold;
    this.at = 0;        // action timer (speed-based turn order)
    this.defending = false;
    this.poison = false;
    this.stone = false;
    this.blind = 0;
    this.confuse = 0;
    this.alive = true;
    // Equipment/ability references from param
    this.abi1 = param.abi1 || 0;
    this.abi2 = param.abi2 || 0;
  }

  isAlive() { return this.alive && this.hp > 0; }

  takeDamage(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp === 0) this.alive = false;
    return dmg;
  }

  heal(amount) {
    const actual = Math.min(amount, this.maxHP - this.hp);
    this.hp += actual;
    return actual;
  }
}

function rand(n) {
  return Math.floor(Math.random() * n);
}

function calcWeaponDamage(attacker, defender, power, bonus, ignoreDefense) {
  const str = attacker.str;
  const def = defender.def;
  let atkPow = Math.floor(str * (str / 2)) + str * 3;
  let defPow = Math.floor(def / 2) * Math.floor(def / 3) + def;
  const rng = rand(75) + 225;

  atkPow = Math.floor(atkPow * power / 100) + bonus;

  if (ignoreDefense) {
    defPow = 0;
  }
  if (defender.defending) {
    defPow = Math.floor(defPow * 2);
  }

  let dmg = Math.floor((atkPow - defPow) * rng / 1000);
  if (dmg <= 0) {
    const dexDiff = attacker.dex * 2 - defender.dex;
    dmg = dexDiff > 0 ? (rand(dexDiff * dexDiff) >= rand(Math.floor(-dmg / 5)) ? 1 : 0) : 0;
  }
  return dmg;
}

function isHit(attacker, defender) {
  const hitRate = attacker.dex * 2;
  const evadeRate = defender.agi;
  return rand(hitRate + evadeRate) < hitRate;
}

function calcItemHeal(effect) {
  // Ported from CBattleActCalc.CalcItemHeal
  const rng = rand(50) + 75;
  return Math.floor(effect * rng / 100);
}

// ============================================================
// Enemy AI System (ported from CBattleEnemy — 107 patterns)
// Each algo maps to a behavior profile with weighted actions.
// Actions: attack, magic(single), magicAll, heal, healAll,
//          buff, debuff, status, strongAtk, revive, defend
// ============================================================

// Action type constants for AI
const AI_ACT = {
  ATTACK: 'attack',       // Physical attack (single)
  MAGIC: 'magic',         // Magic attack (single, power param)
  MAGIC_ALL: 'magicAll',  // Magic attack (all targets)
  STRONG_ATK: 'strongAtk',// Strong physical (1.5x power)
  HEAL: 'heal',           // Heal lowest HP ally
  HEAL_ALL: 'healAll',    // Heal all allies
  BUFF: 'buff',           // Buff self (DEF or STR)
  DEBUFF: 'debuff',       // Debuff target (DEF or STR down)
  STATUS: 'status',       // Inflict status (poison/paralyze/confuse)
  REVIVE: 'revive',       // Revive dead ally
  DEFEND: 'defend',       // Defend
  DRAIN: 'drain',         // HP drain attack
  MULTI_HIT: 'multiHit',  // Multiple hits (2-3x)
};

// AI behavior profiles — each defines weighted action pools
// Format: { actions: [{type, weight, power?, status?}], lowHPActions?: [...], turnCycle?: [...] }
const AI_PROFILES = {
  // 1: Pure physical attacker (slimes, basic enemies)
  physical: { actions: [{ type: AI_ACT.ATTACK, weight: 100 }] },
  // 2: Physical + occasional skill
  physSkill: { actions: [{ type: AI_ACT.ATTACK, weight: 67 }, { type: AI_ACT.MAGIC, weight: 33, power: 80 }] },
  // 3: Physical + status (poison)
  physPoison: { actions: [{ type: AI_ACT.ATTACK, weight: 67 }, { type: AI_ACT.STATUS, weight: 33, status: 0 }] },
  // 4: Physical + debuff
  physDebuff: { actions: [{ type: AI_ACT.ATTACK, weight: 34 }, { type: AI_ACT.MAGIC, weight: 33, power: 80 }, { type: AI_ACT.DEBUFF, weight: 33 }] },
  // 5: Strong physical attacker
  strongPhys: { actions: [{ type: AI_ACT.ATTACK, weight: 60 }, { type: AI_ACT.STRONG_ATK, weight: 40 }] },
  // 6: Magic attacker (single + all)
  mageSingle: { actions: [{ type: AI_ACT.ATTACK, weight: 40 }, { type: AI_ACT.MAGIC_ALL, weight: 60, power: 80 }] },
  // 7: Magic attacker (balanced)
  mageBalanced: { actions: [{ type: AI_ACT.ATTACK, weight: 30 }, { type: AI_ACT.MAGIC, weight: 40, power: 100 }, { type: AI_ACT.MAGIC_ALL, weight: 30, power: 70 }] },
  // 8: Strong magic attacker
  mageStrong: { actions: [{ type: AI_ACT.MAGIC, weight: 50, power: 120 }, { type: AI_ACT.MAGIC_ALL, weight: 30, power: 90 }, { type: AI_ACT.ATTACK, weight: 20 }] },
  // 9: Healer
  healer: { actions: [{ type: AI_ACT.ATTACK, weight: 30 }, { type: AI_ACT.MAGIC, weight: 20, power: 60 }, { type: AI_ACT.HEAL, weight: 50 }] },
  // 10: Buffer/support
  support: { actions: [{ type: AI_ACT.ATTACK, weight: 30 }, { type: AI_ACT.BUFF, weight: 40 }, { type: AI_ACT.HEAL, weight: 30 }] },
  // 11: Status inflicter (paralyze)
  statusPara: { actions: [{ type: AI_ACT.ATTACK, weight: 50 }, { type: AI_ACT.STATUS, weight: 50, status: 1 }] },
  // 12: Status inflicter (confuse)
  statusConf: { actions: [{ type: AI_ACT.ATTACK, weight: 50 }, { type: AI_ACT.STATUS, weight: 50, status: 4 }] },
  // 13: Drain attacker
  drainer: { actions: [{ type: AI_ACT.ATTACK, weight: 40 }, { type: AI_ACT.DRAIN, weight: 60 }] },
  // 14: Multi-hit attacker
  multiHitter: { actions: [{ type: AI_ACT.ATTACK, weight: 50 }, { type: AI_ACT.MULTI_HIT, weight: 50 }] },
  // 15: Debuffer + magic
  debuffMage: { actions: [{ type: AI_ACT.MAGIC, weight: 40, power: 90 }, { type: AI_ACT.DEBUFF, weight: 30 }, { type: AI_ACT.MAGIC_ALL, weight: 30, power: 70 }] },
  // 16: Healer + revive
  healRevive: { actions: [{ type: AI_ACT.HEAL, weight: 40 }, { type: AI_ACT.REVIVE, weight: 30 }, { type: AI_ACT.ATTACK, weight: 30 }] },
  // Boss: cycle-based (attack → magic → strong → heal pattern)
  bossCycle: {
    turnCycle: [
      { type: AI_ACT.MAGIC, power: 100 },
      { type: AI_ACT.ATTACK },
      { type: AI_ACT.MAGIC_ALL, power: 90 },
      { type: AI_ACT.STRONG_ATK },
      { type: AI_ACT.MAGIC, power: 120 },
      { type: AI_ACT.ATTACK },
    ],
    lowHPActions: [{ type: AI_ACT.HEAL, weight: 30 }, { type: AI_ACT.MAGIC_ALL, weight: 40, power: 110 }, { type: AI_ACT.STRONG_ATK, weight: 30 }],
  },
  // Boss variant 2: aggressive
  bossAggro: {
    turnCycle: [
      { type: AI_ACT.STRONG_ATK },
      { type: AI_ACT.MAGIC_ALL, power: 100 },
      { type: AI_ACT.MULTI_HIT },
      { type: AI_ACT.MAGIC, power: 130 },
      { type: AI_ACT.STRONG_ATK },
      { type: AI_ACT.MAGIC_ALL, power: 110 },
      { type: AI_ACT.DEBUFF },
    ],
    lowHPActions: [{ type: AI_ACT.MAGIC_ALL, weight: 50, power: 130 }, { type: AI_ACT.HEAL, weight: 20 }, { type: AI_ACT.STRONG_ATK, weight: 30 }],
  },
  // Boss variant 3: support boss (heals allies, buffs, attacks)
  bossSupport: {
    turnCycle: [
      { type: AI_ACT.BUFF },
      { type: AI_ACT.MAGIC, power: 90 },
      { type: AI_ACT.HEAL_ALL },
      { type: AI_ACT.MAGIC_ALL, power: 80 },
      { type: AI_ACT.ATTACK },
      { type: AI_ACT.REVIVE },
    ],
    lowHPActions: [{ type: AI_ACT.HEAL, weight: 50 }, { type: AI_ACT.MAGIC_ALL, weight: 30, power: 100 }, { type: AI_ACT.BUFF, weight: 20 }],
  },
  // Final boss
  bossFinal: {
    turnCycle: [
      { type: AI_ACT.MAGIC_ALL, power: 120 },
      { type: AI_ACT.STRONG_ATK },
      { type: AI_ACT.STATUS, status: 4 },
      { type: AI_ACT.MAGIC, power: 150 },
      { type: AI_ACT.MULTI_HIT },
      { type: AI_ACT.MAGIC_ALL, power: 130 },
      { type: AI_ACT.DEBUFF },
    ],
    lowHPActions: [{ type: AI_ACT.MAGIC_ALL, weight: 40, power: 150 }, { type: AI_ACT.HEAL, weight: 20 }, { type: AI_ACT.MULTI_HIT, weight: 40 }],
  },
};

// Map algo numbers (from param._da) to AI profiles
// Based on analysis of original CBattleEnemy patterns
function getAIProfile(algo) {
  if (algo <= 0) return AI_PROFILES.physical;
  if (algo === 1) return AI_PROFILES.physical;
  if (algo === 2) return AI_PROFILES.physSkill;
  if (algo === 3) return AI_PROFILES.physPoison;
  if (algo === 4) return AI_PROFILES.physDebuff;
  if (algo === 5) return AI_PROFILES.strongPhys;
  if (algo === 6) return AI_PROFILES.mageSingle;
  if (algo === 7) return AI_PROFILES.mageBalanced;
  if (algo === 8) return AI_PROFILES.mageStrong;
  if (algo === 9) return AI_PROFILES.healer;
  if (algo === 10) return AI_PROFILES.support;
  if (algo === 11) return AI_PROFILES.statusPara;
  if (algo === 12) return AI_PROFILES.statusConf;
  if (algo === 13) return AI_PROFILES.mageSingle;
  if (algo === 14) return AI_PROFILES.multiHitter;
  if (algo === 15) return AI_PROFILES.debuffMage;
  if (algo === 16) return AI_PROFILES.healRevive;
  if (algo === 17) return AI_PROFILES.mageStrong;
  if (algo === 18) return AI_PROFILES.drainer;
  if (algo === 19) return AI_PROFILES.multiHitter;
  if (algo === 20) return AI_PROFILES.mageBalanced;
  if (algo <= 25) return AI_PROFILES.physSkill;
  if (algo <= 30) return AI_PROFILES.mageBalanced;
  if (algo <= 35) return AI_PROFILES.debuffMage;
  if (algo <= 40) return AI_PROFILES.healer;
  if (algo <= 45) return AI_PROFILES.statusPara;
  if (algo <= 50) return AI_PROFILES.mageStrong;
  if (algo <= 55) return AI_PROFILES.multiHitter;
  if (algo <= 60) return AI_PROFILES.drainer;
  if (algo <= 65) return AI_PROFILES.bossCycle;
  if (algo <= 70) return AI_PROFILES.physDebuff;
  if (algo <= 75) return AI_PROFILES.bossAggro;
  if (algo <= 80) return AI_PROFILES.bossSupport;
  if (algo <= 85) return AI_PROFILES.mageStrong;
  if (algo <= 90) return AI_PROFILES.bossAggro;
  if (algo <= 95) return AI_PROFILES.bossCycle;
  if (algo <= 100) return AI_PROFILES.bossFinal;
  if (algo <= 107) return AI_PROFILES.bossFinal;
  return AI_PROFILES.physical;
}

// Pick a weighted random action from a list
function pickWeightedAction(actions) {
  const total = actions.reduce((s, a) => s + a.weight, 0);
  let r = rand(total);
  for (const a of actions) {
    r -= a.weight;
    if (r < 0) return a;
  }
  return actions[0];
}

// Main AI decision function
function getEnemyAI(unit, algo, targets, allEnemies) {
  const profile = getAIProfile(algo);
  const lowHP = unit.hp < unit.maxHP * 0.3;
  const hasMP = unit.mp > 5;

  // Turn-cycle based bosses
  if (profile.turnCycle) {
    if (!unit._turnCount) unit._turnCount = 0;
    unit._turnCount++;
    // Low HP override
    if (lowHP && profile.lowHPActions && rand(100) < 60) {
      const act = pickWeightedAction(profile.lowHPActions);
      return resolveAIAction(act, unit, targets, allEnemies);
    }
    const cycleIdx = (unit._turnCount - 1) % profile.turnCycle.length;
    const act = profile.turnCycle[cycleIdx];
    return resolveAIAction(act, unit, targets, allEnemies);
  }

  // Weighted random selection
  let actions = profile.actions;
  // Filter out MP-requiring actions if no MP
  if (!hasMP) {
    const filtered = actions.filter(a =>
      a.type === AI_ACT.ATTACK || a.type === AI_ACT.STRONG_ATK ||
      a.type === AI_ACT.MULTI_HIT || a.type === AI_ACT.DEFEND
    );
    if (filtered.length > 0) actions = filtered;
  }
  const act = pickWeightedAction(actions);
  return resolveAIAction(act, unit, targets, allEnemies);
}

// Convert AI action to the format doEnemyTurn expects
function resolveAIAction(act, unit, targets, allEnemies) {
  const target = targets[rand(targets.length)];
  switch (act.type) {
    case AI_ACT.ATTACK:
      return { type: 'attack', target };
    case AI_ACT.STRONG_ATK:
      return { type: 'strongAtk', target, power: 150 };
    case AI_ACT.MAGIC:
      return { type: 'magic', power: act.power || 100, target };
    case AI_ACT.MAGIC_ALL:
      return { type: 'magicAll', power: act.power || 80 };
    case AI_ACT.HEAL: {
      const wounded = allEnemies.find(e => e.isAlive() && e.hp < e.maxHP * 0.5);
      return { type: 'heal', healTarget: wounded || unit };
    }
    case AI_ACT.HEAL_ALL:
      return { type: 'healAll' };
    case AI_ACT.BUFF:
      return { type: 'buff' };
    case AI_ACT.DEBUFF:
      return { type: 'debuff', target };
    case AI_ACT.STATUS:
      return { type: 'status', target, status: act.status || 0 };
    case AI_ACT.REVIVE: {
      const dead = allEnemies.find(e => !e.isAlive());
      if (dead) return { type: 'revive', reviveTarget: dead };
      return { type: 'attack', target };
    }
    case AI_ACT.DEFEND:
      return { type: 'defend' };
    case AI_ACT.DRAIN:
      return { type: 'drain', target };
    case AI_ACT.MULTI_HIT:
      return { type: 'multiHit', target, hits: 2 + rand(2) };
    default:
      return { type: 'attack', target };
  }
}

export class BattleEngine {
  constructor(paramAll) {
    this.paramAll = paramAll;
    this.players = [];
    this.enemies = [];
    this.allUnits = [];
    this.turnOrder = [];
    this.currentUnit = null;
    this.log = [];
    this.state = 'init';  // init, playerTurn, enemyTurn, animating, result
    this.result = BATTLE_RESULT.CONTINUE;
    this.totalExp = 0;
    this.totalGold = 0;

    // Callbacks for UI
    this.onLog = null;        // (message) => void
    this.onStateChange = null; // (state) => void
    this.onBattleEnd = null;  // (result, exp, gold) => void
  }

  // Start a battle with given party index
  start(partyIndex, playerParams) {
    this.players = [];
    this.enemies = [];
    this.log = [];
    this.totalExp = 0;
    this.totalGold = 0;
    this.result = BATTLE_RESULT.CONTINUE;

    // Create player units
    for (let i = 0; i < playerParams.length; i++) {
      this.players.push(new BattleUnit(playerParams[i], true, i));
    }

    // Create enemy units from party data
    const party = this.paramAll.getParty(partyIndex);
    if (party) {
      for (let i = 0; i < party.enemies.length; i++) {
        const enemyPrm = this.paramAll.getPrm(party.enemies[i].kind);
        if (enemyPrm) {
          this.enemies.push(new BattleUnit(enemyPrm, false, i));
        }
      }
    }

    this.allUnits = [...this.players, ...this.enemies];
    this.addLog(`戦闘開始！ 敵: ${this.enemies.map(e => e.name).join(', ')}`);
    this.state = 'turnCalc';
    this.nextTurn();
  }

  addLog(msg) {
    this.log.push(msg);
    if (this.onLog) this.onLog(msg);
  }

  // Calculate next turn based on agility (speed-based system)
  nextTurn() {
    if (this.result !== BATTLE_RESULT.CONTINUE) return;
    if (this.state === 'result') return;

    // Accumulate AT for all alive units
    for (const unit of this.allUnits) {
      if (!unit.isAlive()) continue;
      unit.at += unit.agi + rand(unit.agi);
    }

    // Find unit with highest AT
    let best = null;
    let bestAT = 0;
    for (const unit of this.allUnits) {
      if (!unit.isAlive()) continue;
      if (unit.at > bestAT) {
        best = unit;
        bestAT = unit.at;
      }
    }

    this.currentUnit = best;
    if (!best) {
      this.result = BATTLE_RESULT.LOSE;
      this.endBattle();
      return;
    }

    // Reset defending at start of turn
    best.defending = false;

    if (best.isPlayer) {
      this.state = 'playerTurn';
    } else {
      this.state = 'enemyTurn';
      this.doEnemyTurn(best);
    }

    if (this.onStateChange) this.onStateChange(this.state);
  }

  // Player executes a command
  doPlayerCommand(cmd, targetIndex, extraIndex) {
    const unit = this.currentUnit;
    if (!unit || !unit.isPlayer) return;

    switch (cmd) {
      case CMD.ATTACK: {
        const target = this.enemies[targetIndex] || this.getFirstAliveEnemy();
        if (!target) break;
        this.doAttack(unit, target);
        break;
      }
      case CMD.DEFEND: {
        unit.defending = true;
        this.addLog(`${unit.name}は防御した`);
        break;
      }
      case CMD.SKILL: {
        // extraIndex = skill index in paramAll.skills
        this.doSkill(unit, extraIndex, targetIndex);
        break;
      }
      case CMD.ITEM: {
        // extraIndex = item index in paramAll.items
        this.doItem(unit, extraIndex, targetIndex);
        break;
      }
      case CMD.RUN: {
        // Escape: compare party DEX+AGI vs enemy DEX+AGI (ported from original)
        let playerSpeed = 0;
        for (const p of this.players) { if (p.isAlive()) playerSpeed += p.dex + p.agi; }
        let enemySpeed = 0;
        for (const e of this.enemies) { if (e.isAlive()) enemySpeed += e.dex + e.agi; }
        const playerRoll = playerSpeed + rand(playerSpeed * 2 + 1);
        const enemyRoll = enemySpeed + rand(enemySpeed * 2 + 1);
        if (playerRoll >= enemyRoll) {
          this.addLog('逃げ出した！');
          this.result = BATTLE_RESULT.RUN;
          this.endBattle();
          return;
        } else {
          this.addLog('逃げられなかった！');
        }
        break;
      }
      case CMD.STEAL: {
        // Steal item from enemy (DEX-based success rate)
        const target = this.enemies[targetIndex] || this.getFirstAliveEnemy();
        if (!target) break;
        const stealRate = 30 + unit.dex - target.agi;
        if (rand(100) < Math.max(10, Math.min(80, stealRate))) {
          // Steal success — get item from enemy's item1/item2
          const itemIdx = target.abi1 > 0 ? target.abi1 : 1; // fallback to herb
          this.addLog(`${unit.name}は${target.name}からアイテムを盗んだ！`);
          if (this.onSteal) this.onSteal(itemIdx);
        } else {
          this.addLog(`${unit.name}は盗もうとしたが失敗した！`);
        }
        break;
      }
      case CMD.SEIZE: {
        // Seize: attack + steal attempt (weaker attack, lower steal rate)
        const target = this.enemies[targetIndex] || this.getFirstAliveEnemy();
        if (!target) break;
        // Weaker attack (75% power)
        if (isHit(unit, target)) {
          let dmg = calcWeaponDamage(unit, target, 75, 0, false);
          target.takeDamage(dmg);
          this.addLog(`${unit.name}のぶん取り攻撃！ ${target.name}に${dmg}ダメージ！`);
          if (this.onDamage) this.onDamage(target, dmg);
          if (!target.isAlive()) { this.addLog(`${target.name}を倒した！`); this.totalExp += target.exp; this.totalGold += target.gold; }
        } else {
          this.addLog(`${unit.name}のぶん取り攻撃！ ミス！`);
        }
        // Steal attempt (lower rate)
        const seizeRate = 20 + unit.dex - target.agi;
        if (target.isAlive() && rand(100) < Math.max(5, Math.min(60, seizeRate))) {
          const itemIdx = target.abi1 > 0 ? target.abi1 : 1;
          this.addLog(`さらにアイテムを奪い取った！`);
          if (this.onSteal) this.onSteal(itemIdx);
        }
        break;
      }
    }

    // Poison damage at end of turn
    if (unit.poison && unit.isAlive()) {
      const poisonDmg = Math.max(1, Math.floor(unit.maxHP * (rand(50) + 50) / 1200));
      unit.takeDamage(poisonDmg);
      this.addLog(`${unit.name}は毒で${poisonDmg}ダメージ！`);
    }

    unit.at = 0;
    this.checkBattleEnd();
    if (this.result === BATTLE_RESULT.CONTINUE) {
      // Small delay after player action (matching original pacing)
      setTimeout(() => {
        if (this.result === BATTLE_RESULT.CONTINUE) {
          this.nextTurn();
        }
      }, 200);
    }
  }

  doAttack(attacker, defender) {
    // Confusion check: confused units may hit allies
    if (attacker.confuse > 0) {
      attacker.confuse--;
      if (rand(100) < 30) {
        this.addLog(`${attacker.name}は混乱している！`);
        // Hit random ally instead
        const allies = attacker.isPlayer ? this.players.filter(p => p.isAlive()) : this.enemies.filter(e => e.isAlive());
        if (allies.length > 0) {
          defender = allies[rand(allies.length)];
        }
      }
    }

    if (!isHit(attacker, defender)) {
      this.addLog(`${attacker.name}の攻撃！ ミス！`);
      if (this.onMiss) this.onMiss();
      return;
    }

    // Critical hit check (DEX-based, ~10% base)
    const critChance = 5 + Math.floor(attacker.dex / 5);
    const isCrit = rand(100) < critChance;

    let dmg = calcWeaponDamage(attacker, defender, 100, 0, false);
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    defender.takeDamage(dmg);
    if (this.onAttackHit) this.onAttackHit(isCrit);
    const critText = isCrit ? '会心の一撃！ ' : '';
    this.addLog(`${attacker.name}の攻撃！ ${critText}${defender.name}に${dmg}ダメージ！`);
    if (this.onDamage) this.onDamage(defender, dmg);

    // Sword combo check (player only, 15% chance based on DEX)
    if (attacker.isPlayer && defender.isAlive() && rand(100) < 10 + Math.floor(attacker.dex / 10)) {
      // Trigger bonus hit (50% power)
      const comboDmg = calcWeaponDamage(attacker, defender, 50, 0, false);
      if (comboDmg > 0) {
        defender.takeDamage(comboDmg);
        this.addLog(`追加攻撃！ ${defender.name}に${comboDmg}ダメージ！`);
        if (this.onDamage) this.onDamage(defender, comboDmg);
        if (!defender.isAlive()) {
          this.addLog(`${defender.name}を倒した！`);
          if (!defender.isPlayer) { this.totalExp += defender.exp; this.totalGold += defender.gold; }
          return;
        }
      }
    }
    if (isCrit && this.onCritical) this.onCritical(defender);
    if (!defender.isAlive()) {
      this.addLog(`${defender.name}を倒した！`);
      if (!defender.isPlayer) {
        this.totalExp += defender.exp;
        this.totalGold += defender.gold;
      }
    }
  }

  // Skill execution
  doSkill(user, skillIndex, targetIndex) {
    const skill = this.paramAll.getSkill(skillIndex);
    if (!skill) {
      this.addLog('スキルが見つからない！');
      return;
    }
    // MP check
    if (user.mp < skill.mp) {
      this.addLog(`MPが足りない！`);
      return;
    }
    user.mp -= skill.mp;

    const targets = this.getSkillTargets(user, skill, targetIndex);
    this.addLog(`${user.name}は${skill.name}を唱えた！`);
    if (this.onSkillUse) this.onSkillUse(skill.kind);

    for (const target of targets) {
      if (!target.isAlive() && skill.kind !== SKILL_KIND.HEAL) continue;
      this.applySkillEffect(user, target, skill);
    }
  }

  getSkillTargets(user, skill, targetIndex) {
    switch (skill.object) {
      case SKILL_OBJ.ENEMY_ONE: {
        const enemies = user.isPlayer ? this.enemies : this.players;
        const t = enemies[targetIndex] || enemies.find(e => e.isAlive());
        return t ? [t] : [];
      }
      case SKILL_OBJ.ENEMY_ALL: {
        const enemies = user.isPlayer ? this.enemies : this.players;
        return enemies.filter(e => e.isAlive());
      }
      case SKILL_OBJ.ALLY_ONE: {
        const allies = user.isPlayer ? this.players : this.enemies;
        return [allies[targetIndex] || allies.find(a => a.isAlive())].filter(Boolean);
      }
      case SKILL_OBJ.ALLY_ALL: {
        const allies = user.isPlayer ? this.players : this.enemies;
        return allies.filter(a => a.isAlive());
      }
      case SKILL_OBJ.SELF:
        return [user];
      default:
        return [];
    }
  }

  applySkillEffect(user, target, skill) {
    // Notify UI of skill type for animation
    if (this.onSkillEffect) this.onSkillEffect(user, target, skill);

    switch (skill.kind) {
      case SKILL_KIND.ATTACK: {
        // Magic attack: INT-based damage (ported from MagicAttack)
        const intU = user.int_;
        const intT = target.int_;
        let atkPow = intU * Math.floor(intU / 2) + intU * 2;
        let defPow = intT * Math.floor(intT / 3) + intT * 4;
        const power = skill.workNo || 100;
        atkPow *= power;
        atkPow += 100 * 100;
        defPow *= 100;
        let dmg = Math.floor((atkPow * 2 - defPow) * (rand(50) + 150) / 100000);
        if (dmg < 0) dmg = 0;
        if (target.defending) dmg = Math.floor(dmg / 2);
        // Element weakness (simplified: workNo > 100 = strong spell)
        if (power > 100) dmg = Math.floor(dmg * 1.2);
        target.takeDamage(dmg);
        this.addLog(`${target.name}に${dmg}ダメージ！`);
        if (this.onDamage) this.onDamage(target, dmg);
        if (!target.isAlive()) {
          this.addLog(`${target.name}を倒した！`);
          if (!target.isPlayer) {
            this.totalExp += target.exp;
            this.totalGold += target.gold;
          }
        }
        break;
      }
      case SKILL_KIND.HEAL: {
        // Magic heal (ported from Calc_IntHeal)
        const intVal = user.int_;
        let healAmt = (intVal + 2) * (intVal + 1);
        healAmt = Math.floor(healAmt * (rand(30) + 70) / 100);
        const power = skill.workNo || 85;
        healAmt = Math.floor(healAmt * power / 100);
        if (healAmt > 9999) healAmt = 9999;
        const actual = target.heal(healAmt);
        this.addLog(`${target.name}のHPが${actual}回復！`);
        break;
      }
      case SKILL_KIND.BUFF: {
        // Buff based on workNo: 0=DEF, 1=STR, 2=AGI, 3=all
        const buffType = (skill.workNo || 0) % 4;
        switch (buffType) {
          case 0:
            target.def = Math.floor(target.def * 1.3);
            this.addLog(`${target.name}の防御力が上がった！`);
            break;
          case 1:
            target.str = Math.floor(target.str * 1.3);
            this.addLog(`${target.name}の攻撃力が上がった！`);
            break;
          case 2:
            target.agi = Math.floor(target.agi * 1.3);
            this.addLog(`${target.name}の素早さが上がった！`);
            break;
          case 3:
            target.def = Math.floor(target.def * 1.2);
            target.str = Math.floor(target.str * 1.2);
            target.agi = Math.floor(target.agi * 1.2);
            this.addLog(`${target.name}の全能力が上がった！`);
            break;
        }
        break;
      }
      case SKILL_KIND.DEBUFF: {
        // Debuff based on workNo
        const debuffType = (skill.workNo || 0) % 3;
        const successRate = 50 + user.int_ - target.int_;
        if (rand(100) < Math.max(20, Math.min(80, successRate))) {
          switch (debuffType) {
            case 0:
              target.def = Math.max(1, Math.floor(target.def * 0.7));
              this.addLog(`${target.name}の防御力が下がった！`);
              break;
            case 1:
              target.str = Math.max(1, Math.floor(target.str * 0.7));
              this.addLog(`${target.name}の攻撃力が下がった！`);
              break;
            case 2:
              target.agi = Math.max(1, Math.floor(target.agi * 0.7));
              this.addLog(`${target.name}の素早さが下がった！`);
              break;
          }
        } else {
          this.addLog(`しかし効かなかった！`);
        }
        break;
      }
      case SKILL_KIND.STATUS: {
        // Status effects based on workNo: 0=poison, 1=paralysis, 2=blind, 3=stone, 4=confuse
        const statusType = (skill.workNo || 0) % 5;
        const successRate = 40 + user.int_ - target.int_;
        if (rand(100) < Math.max(15, Math.min(75, successRate))) {
          switch (statusType) {
            case 0:
              target.poison = true;
              this.addLog(`${target.name}は毒を受けた！`);
              break;
            case 1:
              target.agi = Math.max(1, Math.floor(target.agi * 0.3));
              this.addLog(`${target.name}は麻痺した！`);
              break;
            case 2:
              target.blind = 3;
              target.dex = Math.max(1, Math.floor(target.dex * 0.5));
              this.addLog(`${target.name}は目がくらんだ！`);
              break;
            case 3:
              if (!target.isPlayer || rand(100) < 20) {
                target.takeDamage(target.hp);
                this.addLog(`${target.name}は石になった！`);
              } else {
                this.addLog(`しかし効かなかった！`);
              }
              break;
            case 4:
              target.confuse = 3;
              this.addLog(`${target.name}は混乱した！`);
              break;
          }
        } else {
          this.addLog(`しかし効かなかった！`);
        }
        break;
      }
    }
  }

  // Item usage in battle
  doItem(user, itemIndex, targetIndex) {
    const item = this.paramAll.getItem(itemIndex);
    if (!item) {
      this.addLog('アイテムが見つからない！');
      return;
    }

    this.addLog(`${user.name}は${item.name}を使った！`);
    if (this.onItemUse) this.onItemUse(itemIndex);

    switch (item.workNo) {
      case ITEM_ALGO.HEAL_ONE: {
        // Single target HP heal
        const allies = user.isPlayer ? this.players : this.enemies;
        const target = allies[targetIndex] || allies.find(a => a.isAlive());
        if (target) {
          let healAmt = calcItemHeal(item.effect);
          const actual = target.heal(healAmt);
          this.addLog(`${target.name}のHPが${actual}回復！`);
        }
        break;
      }
      case ITEM_ALGO.HEAL_ALL: {
        // All allies HP heal
        const allies = user.isPlayer ? this.players : this.enemies;
        for (const a of allies) {
          if (a.isAlive()) {
            let healAmt = calcItemHeal(item.effect);
            const actual = a.heal(healAmt);
            this.addLog(`${a.name}のHPが${actual}回復！`);
          }
        }
        break;
      }
      case ITEM_ALGO.CURE_POISON: {
        const allies = user.isPlayer ? this.players : this.enemies;
        const target = allies[targetIndex] || allies.find(a => a.poison);
        if (target && target.poison) {
          target.poison = false;
          this.addLog(`${target.name}の毒が治った！`);
        } else {
          this.addLog(`ミス`);
        }
        break;
      }
      case ITEM_ALGO.REVIVE: {
        const allies = user.isPlayer ? this.players : this.enemies;
        const target = allies[targetIndex] || allies.find(a => !a.isAlive());
        if (target && !target.isAlive()) {
          target.alive = true;
          const reviveHP = Math.floor(target.maxHP / 4);
          target.hp = reviveHP;
          this.addLog(`${target.name}は復活した！ HP:${reviveHP}`);
        } else {
          this.addLog(`ミス`);
        }
        break;
      }
      default: {
        // Unknown item algo — try as heal
        if (item.effect > 0) {
          const allies = user.isPlayer ? this.players : this.enemies;
          const target = allies[targetIndex] || allies.find(a => a.isAlive());
          if (target) {
            let healAmt = calcItemHeal(item.effect);
            const actual = target.heal(healAmt);
            this.addLog(`${target.name}のHPが${actual}回復！`);
          }
        } else {
          this.addLog(`しかし何も起こらなかった！`);
        }
        break;
      }
    }
  }

  doEnemyTurn(unit) {
    const targets = this.players.filter(p => p.isAlive());
    if (targets.length === 0) return;

    const algo = unit.algo || 1;
    const action = this.getEnemyAction(unit, algo, targets);

    switch (action.type) {
      case 'attack': {
        const target = action.target || targets[rand(targets.length)];
        this.doAttack(unit, target);
        break;
      }
      case 'strongAtk': {
        // Strong physical attack (1.5x power)
        const target = action.target || targets[rand(targets.length)];
        if (!isHit(unit, target)) {
          this.addLog(`${unit.name}の強攻撃！ しかし${target.name}に当たらなかった！`);
        } else {
          let dmg = calcWeaponDamage(unit, target, action.power || 150, 0, false);
          if (dmg < 1) dmg = 1;
          target.takeDamage(dmg);
          this.addLog(`${unit.name}の強攻撃！ ${target.name}に${dmg}ダメージ！`);
          if (this.onDamage) this.onDamage(target, dmg);
          if (!target.isAlive()) this.addLog(`${target.name}は倒れた...`);
        }
        break;
      }
      case 'multiHit': {
        // Multiple hit attack
        const target = action.target || targets[rand(targets.length)];
        const hits = action.hits || 2;
        this.addLog(`${unit.name}の連続攻撃！`);
        for (let i = 0; i < hits; i++) {
          const t = target.isAlive() ? target : targets.find(p => p.isAlive());
          if (!t) break;
          if (!isHit(unit, t)) { this.addLog(`ミス！`); continue; }
          let dmg = calcWeaponDamage(unit, t, 80, 0, false);
          if (dmg < 1) dmg = 1;
          t.takeDamage(dmg);
          this.addLog(`${t.name}に${dmg}ダメージ！`);
          if (this.onDamage) this.onDamage(t, dmg);
          if (!t.isAlive()) this.addLog(`${t.name}は倒れた...`);
        }
        break;
      }
      case 'magic': {
        const target = action.target || targets[rand(targets.length)];
        const intU = unit.int_;
        const intT = target.int_;
        let atkPow = intU * Math.floor(intU / 2) + intU * 2;
        let defPow = intT * Math.floor(intT / 3) + intT * 4;
        const power = action.power || 80;
        atkPow *= power; atkPow += 100 * 100; defPow *= 100;
        let dmg = Math.floor((atkPow * 2 - defPow) * (rand(50) + 150) / 100000);
        if (dmg < 0) dmg = 0;
        if (target.defending) dmg = Math.floor(dmg / 2);
        unit.mp = Math.max(0, unit.mp - 5);
        target.takeDamage(dmg);
        this.addLog(`${unit.name}の魔法攻撃！ ${target.name}に${dmg}ダメージ！`);
        if (this.onDamage) this.onDamage(target, dmg);
        if (!target.isAlive()) this.addLog(`${target.name}は倒れた...`);
        break;
      }
      case 'magicAll': {
        unit.mp = Math.max(0, unit.mp - 8);
        const power = action.power || 80;
        this.addLog(`${unit.name}の全体魔法！`);
        for (const t of targets) {
          const intU = unit.int_;
          const intT = t.int_;
          let atkPow = intU * Math.floor(intU / 2) + intU * 2;
          let defPow = intT * Math.floor(intT / 3) + intT * 4;
          atkPow *= Math.floor(power * 0.7); atkPow += 80 * 100; defPow *= 100;
          let dmg = Math.floor((atkPow * 2 - defPow) * (rand(50) + 150) / 100000);
          if (dmg < 0) dmg = 0;
          if (t.defending) dmg = Math.floor(dmg / 2);
          t.takeDamage(dmg);
          this.addLog(`${t.name}に${dmg}ダメージ！`);
          if (this.onDamage) this.onDamage(t, dmg);
        }
        break;
      }
      case 'heal': {
        const healTarget = action.healTarget || this.enemies.find(e => e.isAlive() && e.hp < e.maxHP * 0.5) || unit;
        const healAmt = Math.floor((unit.int_ + 2) * (unit.int_ + 1) * (rand(30) + 70) / 100 * 0.6);
        healTarget.heal(healAmt);
        unit.mp = Math.max(0, unit.mp - 5);
        this.addLog(`${unit.name}は回復魔法！ ${healTarget.name}のHP${healAmt}回復！`);
        break;
      }
      case 'healAll': {
        unit.mp = Math.max(0, unit.mp - 10);
        const intVal = unit.int_;
        this.addLog(`${unit.name}は全体回復魔法！`);
        for (const e of this.enemies) {
          if (!e.isAlive()) continue;
          const healAmt = Math.floor((intVal + 2) * (intVal + 1) * (rand(20) + 50) / 100 * 0.4);
          e.heal(healAmt);
          this.addLog(`${e.name}のHP${healAmt}回復！`);
        }
        break;
      }
      case 'buff': {
        unit.mp = Math.max(0, unit.mp - 4);
        const buffType = rand(3);
        if (buffType === 0) { unit.def = Math.floor(unit.def * 1.3); this.addLog(`${unit.name}は防御力が上がった！`); }
        else if (buffType === 1) { unit.str = Math.floor(unit.str * 1.3); this.addLog(`${unit.name}は攻撃力が上がった！`); }
        else { unit.agi = Math.floor(unit.agi * 1.3); this.addLog(`${unit.name}は素早さが上がった！`); }
        break;
      }
      case 'debuff': {
        const target = action.target || targets[rand(targets.length)];
        unit.mp = Math.max(0, unit.mp - 4);
        const successRate = 50 + unit.int_ - target.int_;
        if (rand(100) < Math.max(20, Math.min(80, successRate))) {
          const dt = rand(2);
          if (dt === 0) { target.def = Math.max(1, Math.floor(target.def * 0.7)); this.addLog(`${unit.name}の呪い！ ${target.name}の防御力が下がった！`); }
          else { target.str = Math.max(1, Math.floor(target.str * 0.7)); this.addLog(`${unit.name}の呪い！ ${target.name}の攻撃力が下がった！`); }
        } else {
          this.addLog(`${unit.name}の呪い！ しかし効かなかった！`);
        }
        break;
      }
      case 'status': {
        const target = action.target || targets[rand(targets.length)];
        unit.mp = Math.max(0, unit.mp - 5);
        const successRate = 40 + unit.int_ - target.int_;
        if (rand(100) < Math.max(15, Math.min(70, successRate))) {
          const st = action.status || 0;
          if (st === 0) { target.poison = true; this.addLog(`${unit.name}の毒攻撃！ ${target.name}は毒を受けた！`); }
          else if (st === 1) { target.agi = Math.max(1, Math.floor(target.agi * 0.3)); this.addLog(`${unit.name}の麻痺攻撃！ ${target.name}は麻痺した！`); }
          else { target.confuse = 3; this.addLog(`${unit.name}の混乱攻撃！ ${target.name}は混乱した！`); }
        } else {
          this.addLog(`${unit.name}の特殊攻撃！ しかし効かなかった！`);
        }
        break;
      }
      case 'drain': {
        const target = action.target || targets[rand(targets.length)];
        const intU = unit.int_;
        let dmg = Math.floor(intU * (rand(30) + 70) / 50);
        if (target.defending) dmg = Math.floor(dmg / 2);
        if (dmg < 1) dmg = 1;
        target.takeDamage(dmg);
        unit.heal(Math.floor(dmg * 0.5));
        unit.mp = Math.max(0, unit.mp - 4);
        this.addLog(`${unit.name}はHP吸収！ ${target.name}から${dmg}吸い取った！`);
        if (this.onDamage) this.onDamage(target, dmg);
        if (!target.isAlive()) this.addLog(`${target.name}は倒れた...`);
        break;
      }
      case 'revive': {
        const dead = action.reviveTarget || this.enemies.find(e => !e.isAlive());
        if (dead) {
          dead.alive = true;
          dead.hp = Math.floor(dead.maxHP * 0.3);
          unit.mp = Math.max(0, unit.mp - 8);
          this.addLog(`${unit.name}は蘇生魔法！ ${dead.name}が復活した！`);
        } else {
          this.doAttack(unit, targets[rand(targets.length)]);
        }
        break;
      }
      case 'defend': {
        unit.defending = true;
        this.addLog(`${unit.name}は防御した`);
        break;
      }
      default: {
        this.doAttack(unit, targets[rand(targets.length)]);
        break;
      }
    }

    // Poison damage
    if (unit.poison && unit.isAlive()) {
      const poisonDmg = Math.max(1, Math.floor(unit.maxHP * (rand(50) + 50) / 1200));
      unit.takeDamage(poisonDmg);
      this.addLog(`${unit.name}は毒で${poisonDmg}ダメージ！`);
    }

    unit.at = 0;
    this.checkBattleEnd();
    if (this.result === BATTLE_RESULT.CONTINUE) {
      setTimeout(() => {
        if (this.result === BATTLE_RESULT.CONTINUE) {
          this.nextTurn();
        }
      }, 300);
    }
  }

  getEnemyAction(unit, algo, targets) {
    return getEnemyAI(unit, algo, targets, this.enemies);
  }

  getFirstAliveEnemy() {
    return this.enemies.find(e => e.isAlive()) || null;
  }

  checkBattleEnd() {
    const playersAlive = this.players.some(p => p.isAlive());
    const enemiesAlive = this.enemies.some(e => e.isAlive());

    if (!enemiesAlive) {
      this.result = BATTLE_RESULT.WIN;
      this.addLog(`勝利！ EXP:${this.totalExp} Gold:${this.totalGold}`);
      this.endBattle();
    } else if (!playersAlive) {
      this.result = BATTLE_RESULT.LOSE;
      this.addLog('全滅した...');
      this.endBattle();
    }
  }

  endBattle() {
    this.state = 'result';
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.onBattleEnd) this.onBattleEnd(this.result, this.totalExp, this.totalGold);
  }

  // Get current battle state for UI rendering
  getState() {
    return {
      state: this.state,
      players: this.players.map(p => ({
        name: p.name, hp: p.hp, maxHP: p.maxHP, mp: p.mp, maxMP: p.maxMP,
        alive: p.isAlive(), defending: p.defending, poison: p.poison
      })),
      enemies: this.enemies.map(e => ({
        name: e.name, hp: e.hp, maxHP: e.maxHP, alive: e.isAlive(), poison: e.poison
      })),
      currentUnit: this.currentUnit ? {
        name: this.currentUnit.name, isPlayer: this.currentUnit.isPlayer,
        index: this.currentUnit.index, mp: this.currentUnit.mp, maxMP: this.currentUnit.maxMP
      } : null,
      log: this.log.slice(-5),
      result: this.result,
    };
  }
}

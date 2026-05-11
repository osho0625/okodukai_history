// battle.js — Turn-based battle system (ported from CBattleMain)
// Simplified HTML5 version with text-based UI

export const BATTLE_RESULT = { CONTINUE: 0, WIN: 1, LOSE: 2, RUN: 3 };
export const CMD = { ATTACK: 1, DEFEND: 2, SKILL: 3, ITEM: 4, RUN: 5 };

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
        // 50% chance to escape
        if (rand(100) < 50) {
          this.addLog('逃げ出した！');
          this.result = BATTLE_RESULT.RUN;
          this.endBattle();
          return;
        } else {
          this.addLog('逃げられなかった！');
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
      this.nextTurn();
    }
  }

  doAttack(attacker, defender) {
    if (!isHit(attacker, defender)) {
      this.addLog(`${attacker.name}の攻撃！ ミス！`);
      return;
    }
    const dmg = calcWeaponDamage(attacker, defender, 100, 0, false);
    defender.takeDamage(dmg);
    this.addLog(`${attacker.name}の攻撃！ ${defender.name}に${dmg}ダメージ！`);
    if (this.onDamage) this.onDamage(defender, dmg);
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
    switch (skill.kind) {
      case SKILL_KIND.ATTACK: {
        // Magic attack: INT-based damage (ported from MagicAttack)
        const intU = user.int_;
        const intT = target.int_;
        let atkPow = intU * Math.floor(intU / 2) + intU * 2;
        let defPow = intT * Math.floor(intT / 3) + intT * 4;
        const power = skill.workNo || 100;
        atkPow *= power;
        atkPow += 100 * 100; // bonus
        defPow *= 100;
        let dmg = Math.floor((atkPow * 2 - defPow) * (rand(50) + 150) / 100000);
        if (dmg < 0) dmg = 0;
        if (target.defending) dmg = Math.floor(dmg / 2);
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
        // Simple buff: boost DEF or AGI temporarily
        this.addLog(`${target.name}の防御力が上がった！`);
        target.def = Math.floor(target.def * 1.3);
        break;
      }
      case SKILL_KIND.DEBUFF: {
        // Debuff: lower target stats
        if (rand(100) < 60) {
          target.def = Math.max(1, Math.floor(target.def * 0.7));
          this.addLog(`${target.name}の防御力が下がった！`);
        } else {
          this.addLog(`しかし効かなかった！`);
        }
        break;
      }
      case SKILL_KIND.STATUS: {
        // Status effects: poison, etc.
        if (rand(100) < 50) {
          target.poison = true;
          this.addLog(`${target.name}は毒を受けた！`);
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
    // AI based on algo field (simplified)
    const targets = this.players.filter(p => p.isAlive());
    if (targets.length === 0) return;

    // Enemies with MP and INT may use magic attacks
    if (unit.mp > 0 && unit.int_ > unit.str && rand(100) < 40) {
      // Try magic attack on random target
      const target = targets[rand(targets.length)];
      const intU = unit.int_;
      const intT = target.int_;
      let atkPow = intU * Math.floor(intU / 2) + intU * 2;
      let defPow = intT * Math.floor(intT / 3) + intT * 4;
      atkPow *= 80;
      atkPow += 100 * 100;
      defPow *= 100;
      let dmg = Math.floor((atkPow * 2 - defPow) * (rand(50) + 150) / 100000);
      if (dmg < 0) dmg = 0;
      if (target.defending) dmg = Math.floor(dmg / 2);
      const mpCost = Math.min(unit.mp, 5 + rand(5));
      unit.mp -= mpCost;
      target.takeDamage(dmg);
      this.addLog(`${unit.name}の魔法攻撃！ ${target.name}に${dmg}ダメージ！`);
      if (this.onDamage) this.onDamage(target, dmg);
      if (!target.isAlive()) {
        this.addLog(`${target.name}は倒れた...`);
      }
    } else {
      // Physical attack
      const target = targets[rand(targets.length)];
      this.doAttack(unit, target);
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

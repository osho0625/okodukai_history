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
      return;
    }

    // Critical hit check (DEX-based, ~10% base)
    const critChance = 5 + Math.floor(attacker.dex / 5);
    const isCrit = rand(100) < critChance;

    let dmg = calcWeaponDamage(attacker, defender, 100, 0, false);
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    defender.takeDamage(dmg);
    const critText = isCrit ? '会心の一撃！ ' : '';
    this.addLog(`${attacker.name}の攻撃！ ${critText}${defender.name}に${dmg}ダメージ！`);
    if (this.onDamage) this.onDamage(defender, dmg);
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

    // AI behavior based on algo field (simplified from 80+ original patterns)
    const algo = unit.algo || 1;
    const action = this.getEnemyAction(unit, algo, targets);

    switch (action.type) {
      case 'attack': {
        const target = action.target || targets[rand(targets.length)];
        this.doAttack(unit, target);
        break;
      }
      case 'magic': {
        // Magic attack on target
        const target = action.target || targets[rand(targets.length)];
        const intU = unit.int_;
        const intT = target.int_;
        let atkPow = intU * Math.floor(intU / 2) + intU * 2;
        let defPow = intT * Math.floor(intT / 3) + intT * 4;
        const power = action.power || 80;
        atkPow *= power;
        atkPow += 100 * 100;
        defPow *= 100;
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
        // Magic attack on all players
        unit.mp = Math.max(0, unit.mp - 8);
        this.addLog(`${unit.name}の全体魔法！`);
        for (const t of targets) {
          const intU = unit.int_;
          const intT = t.int_;
          let atkPow = intU * Math.floor(intU / 2) + intU * 2;
          let defPow = intT * Math.floor(intT / 3) + intT * 4;
          atkPow *= 60; atkPow += 80 * 100; defPow *= 100;
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
        // Heal self or ally
        const healTarget = this.enemies.find(e => e.isAlive() && e.hp < e.maxHP * 0.5) || unit;
        const healAmt = Math.floor((unit.int_ + 2) * (unit.int_ + 1) * (rand(30) + 70) / 100 * 0.6);
        healTarget.heal(healAmt);
        unit.mp = Math.max(0, unit.mp - 5);
        this.addLog(`${unit.name}は回復魔法！ ${healTarget.name}のHP${healAmt}回復！`);
        break;
      }
      case 'defend': {
        unit.defending = true;
        this.addLog(`${unit.name}は防御した`);
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
    const r = rand(100);
    const lowHP = unit.hp < unit.maxHP * 0.3;
    const hasMP = unit.mp > 5;

    // Algo categories (simplified from original 80+ patterns):
    // 1-10: basic attackers (mostly physical)
    // 11-20: magic users
    // 21-30: balanced (attack + magic)
    // 31-40: support (heal + buff)
    // 41+: boss patterns

    if (algo <= 5) {
      // Pure physical attacker
      return { type: 'attack', target: targets[rand(targets.length)] };
    }
    if (algo <= 10) {
      // Physical with occasional strong attack
      if (r < 20 && hasMP) return { type: 'magic', power: 120, target: targets[rand(targets.length)] };
      return { type: 'attack', target: targets[rand(targets.length)] };
    }
    if (algo <= 20) {
      // Magic user
      if (!hasMP) return { type: 'attack', target: targets[rand(targets.length)] };
      if (r < 30) return { type: 'magicAll' };
      if (r < 70) return { type: 'magic', power: 100, target: targets[rand(targets.length)] };
      return { type: 'attack', target: targets[rand(targets.length)] };
    }
    if (algo <= 30) {
      // Balanced
      if (hasMP && r < 40) return { type: 'magic', power: 80, target: targets[rand(targets.length)] };
      return { type: 'attack', target: targets[rand(targets.length)] };
    }
    if (algo <= 40) {
      // Support/healer
      const wounded = this.enemies.find(e => e.isAlive() && e.hp < e.maxHP * 0.5);
      if (wounded && hasMP && r < 50) return { type: 'heal' };
      if (hasMP && r < 30) return { type: 'magic', power: 60, target: targets[rand(targets.length)] };
      return { type: 'attack', target: targets[rand(targets.length)] };
    }
    // Boss patterns (41+)
    if (lowHP && hasMP && r < 30) return { type: 'heal' };
    if (hasMP && r < 25) return { type: 'magicAll' };
    if (hasMP && r < 50) return { type: 'magic', power: 120, target: targets[rand(targets.length)] };
    if (r < 10) return { type: 'defend' };
    return { type: 'attack', target: targets[rand(targets.length)] };
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

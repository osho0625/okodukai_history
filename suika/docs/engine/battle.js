// battle.js — Turn-based battle system (ported from CBattleMain)
// Simplified HTML5 version with text-based UI

export const BATTLE_RESULT = { CONTINUE: 0, WIN: 1, LOSE: 2, RUN: 3 };
export const CMD = { ATTACK: 1, DEFEND: 2, SKILL: 3, ITEM: 4, RUN: 5 };

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
    this.alive = true;
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
  doPlayerCommand(cmd, targetIndex) {
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

  doEnemyTurn(unit) {
    // Simple AI: attack random alive player
    const targets = this.players.filter(p => p.isAlive());
    if (targets.length === 0) return;
    const target = targets[rand(targets.length)];
    this.doAttack(unit, target);
    unit.at = 0;

    this.checkBattleEnd();
    if (this.result === BATTLE_RESULT.CONTINUE) {
      // Small delay then next turn
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
        alive: p.isAlive(), defending: p.defending
      })),
      enemies: this.enemies.map(e => ({
        name: e.name, hp: e.hp, maxHP: e.maxHP, alive: e.isAlive()
      })),
      currentUnit: this.currentUnit ? {
        name: this.currentUnit.name, isPlayer: this.currentUnit.isPlayer
      } : null,
      log: this.log.slice(-5),
      result: this.result,
    };
  }
}

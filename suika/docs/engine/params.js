// params.js — Parameter data parser (ported from CParamAll)
// Loads character stats, enemy parties, items, skills from param._da

import { BinaryReader, decompressJip } from './loader.js';

export class ChrParam {
  constructor(index) {
    this.index = index;
    this.name = '';
    this.lv = 1;
    this.pat = 0;      // model pattern
    this.algo = 0;     // AI algorithm
    this.add = 0;
    this.item1 = 0;
    this.item2 = 0;
    this.hp = 0;
    this.maxHP = 0;
    this.mp = 0;
    this.maxMP = 0;
    this.str = 0;
    this.int_ = 0;
    this.def = 0;
    this.agi = 0;
    this.dex = 0;
    this.exp = 0;
    this.gold = 0;
    this.ap = 0;
    this.abi1 = 0;
    this.abi2 = 0;
    this.isPlayer = false;
  }

  getStr() { return Math.max(1, this.str); }
  getDef() { return this.def; }
  getInt() { return this.int_; }
  getAgi() { return this.agi; }
  getDex() { return this.dex; }
  getMaxHP() { return this.maxHP; }
  getMaxMP() { return this.maxMP; }

  clone() {
    const p = new ChrParam(this.index);
    Object.assign(p, this);
    return p;
  }
}

export class ItemData {
  constructor() {
    this.name = '';
    this.workNo = 0;
    this.kind = 0;
    this.equip = 0;
    this.algo = 0;
    this.str = 0;
    this.int_ = 0;
    this.def = 0;
    this.agi = 0;
    this.dex = 0;
    this.abi = 0;
    this.help = 0;
    this.effect = 0;
    this.gold = 0;
  }
}

export class SkillData {
  constructor() {
    this.name = '';
    this.workNo = 0;
    this.object = 0;
    this.kind = 0;
    this.mp = 0;
    this.help = 0;
  }
}

export class EnemyParty {
  constructor() {
    this.enemyNum = 0;
    this.flag = 0;
    this.enemies = []; // { kind, xPos }
  }
}

export class ParamAll {
  constructor() {
    this.chrParams = [];
    this.prmUps = [];
    this.parties = [];
    this.items = [];
    this.skills = [];
    this.helps = [];
  }

  load(buffer) {
    const data = decompressJip(buffer);
    const r = new BinaryReader(data);

    const prmNum = r.readShort() & 0xFFFF;
    const prmUpNum = r.readShort() & 0xFFFF;
    const partyNum = r.readShort() & 0xFFFF;
    const itemNum = r.readShort() & 0xFFFF;
    const skillNum = r.readShort() & 0xFFFF;
    const helpNum = r.readShort() & 0xFFFF;

    // Character parameters
    for (let i = 0; i < prmNum; i++) {
      const p = new ChrParam(i);
      p.name = r.readString(14); // 14 bytes = 7 chars
      p.lv = r.readByte() & 0xFF;
      p.pat = r.readByte() & 0xFF;
      p.add = r.readByte() & 0xFF;
      p.item1 = r.readByte() & 0xFF;
      p.item2 = r.readByte() & 0xFF;
      p.algo = r.readByte() & 0xFF;
      p.hp = p.maxHP = r.readInt();
      p.mp = p.maxMP = r.readShort() & 0xFFFF;
      p.str = r.readShort() & 0xFFFF;
      p.int_ = r.readShort() & 0xFFFF;
      p.def = r.readShort() & 0xFFFF;
      p.agi = r.readShort() & 0xFFFF;
      p.dex = r.readShort() & 0xFFFF;
      p.exp = r.readShort() & 0xFFFF;
      p.gold = r.readShort() & 0xFFFF;
      p.ap = r.readShort() & 0xFFFF;
      p.abi1 = r.readByte() & 0xFF;
      p.abi2 = r.readByte() & 0xFF;
      this.chrParams.push(p);
    }

    // Level-up data
    for (let i = 0; i < prmUpNum; i++) {
      this.prmUps.push({
        hp: r.readShort() & 0xFFFF,
        mp: r.readShort() & 0xFFFF,
        hps: r.readShort() & 0xFFFF,
        str: r.readShort() & 0xFFFF,
        int_: r.readShort() & 0xFFFF,
        def: r.readShort() & 0xFFFF,
        agi: r.readShort() & 0xFFFF,
        dex: r.readShort() & 0xFFFF,
      });
    }

    // Enemy parties
    for (let i = 0; i < partyNum; i++) {
      const party = new EnemyParty();
      party.enemyNum = r.readByte() & 0xFF;
      party.flag = r.readByte() & 0xFF;
      const enemies = [];
      for (let j = 0; j < 6; j++) {
        enemies.push({ kind: r.readByte() & 0xFF, xPos: 0 });
      }
      for (let j = 0; j < 6; j++) {
        enemies[j].xPos = r.readShort() & 0xFFFF;
      }
      party.enemies = enemies.slice(0, party.enemyNum);
      this.parties.push(party);
    }

    // Items
    for (let i = 0; i < itemNum; i++) {
      const item = new ItemData();
      item.name = r.readString(14); // 14 bytes = 7 chars
      item.workNo = r.readByte() & 0xFF;
      item.kind = r.readByte() & 0xFF;
      item.equip = r.readByte() & 0xFF;
      item.algo = r.readByte() & 0xFF;
      item.str = r.readByte();
      item.int_ = r.readByte();
      item.def = r.readByte();
      item.agi = r.readByte();
      item.dex = r.readByte();
      item.abi = r.readByte() & 0xFF;
      item.help = r.readShort() & 0xFFFF;
      item.effect = r.readShort() & 0xFFFF;
      item.gold = r.readInt();
      this.items.push(item);
    }

    // Skills
    for (let i = 0; i < skillNum; i++) {
      const skill = new SkillData();
      skill.name = r.readString(16); // 16 bytes = 8 chars
      skill.workNo = r.readByte() & 0xFF;
      skill.object = r.readByte() & 0xFF;
      skill.kind = r.readShort() & 0xFFFF;
      skill.mp = r.readShort() & 0xFFFF;
      skill.help = r.readShort() & 0xFFFF;
      this.skills.push(skill);
    }

    // Help texts
    for (let i = 0; i < helpNum; i++) {
      this.helps.push(r.readString(32)); // 32 bytes = 16 chars
    }

    console.log(`Params loaded: ${prmNum} chars, ${partyNum} parties, ${itemNum} items, ${skillNum} skills`);
    return true;
  }

  getPrm(index) { return this.chrParams[index]; }
  getParty(index) { return this.parties[index]; }
  getItem(index) { return this.items[index]; }
  getSkill(index) { return this.skills[index]; }
}

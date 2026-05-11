// event.js — Event script interpreter (ported from CEventManage)
// Handles NPC dialogue, flags, area transitions, shops, battles, items, etc.

import { BinaryReader } from './loader.js';

// Event commands (from Java CEventManage analysis)
const E = {
  END: 0, SETEF: 1, RESETEF: 2, SETCF: 3, RESETCF: 4,
  VECT: 5, VECT2: 6, LOOK: 7, OPENW: 8, CLOSEW: 9,
  MESS: 10, MOVE: 11, POS: 12, SE: 13, JUMP: 14,
  IF: 15, IFN: 16, YESNO: 17, TSHOP: 18, WSHOP: 19,
  GSHOP: 20, IN: 21, FRAME: 22, FADEIN: 23, FADEOUT: 24,
  WHITEIN: 25, WHITEOUT: 26, HEAL: 27, ADDGOLD: 28, SUBGOLD: 29,
  MAPM: 30, MAPH: 31, CHRALGO: 32, PASSW: 33, CMPI: 34,
  PARTY: 35, BATTLE: 36, INRESET: 37, COIN: 38, PARTYM: 39,
  PAT: 40, CMPP: 41, CAMINIT: 42, SCALE: 43, CAMCHR: 44,
  ITEM: 45, RESETFL: 46, EFFECT: 47, DISPGOLD: 48, CMPH: 49,
  MAPG: 50, SSHOP: 51, QUIZ: 52, BATTLE2: 53, CHRMODE: 54,
  EXCL: 55, AREA: 56, CALL: 57, RETURN: 58, POSADD: 59,
  IFCALL: 60, IFNCALL: 61, POSCOPY: 62, POSY: 63, QUAKE: 64,
  CHRPRM: 65, ADDITEM: 66, IFRET: 67, IFNRET: 68, CHRMENU: 69,
  GETABI: 70, SETABI: 71, CSHOP: 72, AMBIENT: 73, LIGHT: 74,
  NUMBER: 75,
};

class EventData {
  constructor() {
    this.data = null; // Uint8Array
  }
  get(ptr) { return this.data[ptr]; }
  getWord(ptr) {
    return ((this.data[ptr] & 0xFF) << 8) | (this.data[ptr + 1] & 0xFF);
  }
  getSignedWord(ptr) {
    const v = this.getWord(ptr);
    return v >= 32768 ? v - 65536 : v;
  }
  getString(ptr, charCount) {
    let str = '';
    for (let i = 0; i < charCount; i++) {
      const code = ((this.data[ptr + i * 2] & 0xFF) << 8) | (this.data[ptr + i * 2 + 1] & 0xFF);
      if (code !== 0) str += String.fromCharCode(code);
    }
    return str;
  }
}

export class EventManager {
  constructor() {
    this.events = [];
    this.flags = new Set();
    this.gold = 0;
    this.inventory = []; // item indices

    // Callbacks (set by main.js)
    this.messageCallback = null;   // (text) => Promise<void>
    this.choiceCallback = null;    // (opt1, opt2) => Promise<number>
    this.battleCallback = null;    // (partyIndex) => Promise<void>
    this.areaCallback = null;      // (area, x, z, rot) => void
    this.healCallback = null;      // () => void
    this.goldCallback = null;      // (amount) => void
    this.fadeCallback = null;      // (type, speed) => Promise<void>
    this.seCallback = null;        // (seNo) => void
    this.itemCallback = null;      // (itemIdx, add) => void
    this.mapChangeCallback = null; // (type, x, z, val) => void
    this.quakeCallback = null;     // (strength) => void
    this.shopCallback = null;      // (itemIndices[]) => Promise<void>
  }

  load(buffer) {
    const reader = new BinaryReader(buffer);
    const eventCount = reader.readInt();
    const offsets = [];
    for (let i = 0; i < eventCount + 1; i++) {
      offsets.push(reader.readInt());
    }
    const dataStart = reader.offset;
    const allData = new Uint8Array(buffer, dataStart);

    for (let i = 0; i < eventCount; i++) {
      const evt = new EventData();
      const start = offsets[i];
      const end = offsets[i + 1];
      const size = end - start;
      if (size > 0 && start < allData.length) {
        evt.data = allData.slice(start, start + size);
      } else {
        evt.data = new Uint8Array(0);
      }
      this.events.push(evt);
    }
    console.log(`Events loaded: ${this.events.length}`);
  }

  setFlag(n) { this.flags.add(n); }
  resetFlag(n) { this.flags.delete(n); }
  getFlag(n) { return this.flags.has(n); }

  hasItem(itemIdx) { return this.inventory.includes(itemIdx); }
  addItem(itemIdx) { this.inventory.push(itemIdx); }
  removeItem(itemIdx) {
    const i = this.inventory.indexOf(itemIdx);
    if (i >= 0) this.inventory.splice(i, 1);
  }

  async run(eventNo) {
    if (eventNo < 0 || eventNo >= this.events.length) return;
    const evt = this.events[eventNo];
    if (!evt || !evt.data || evt.data.length === 0) return;

    let ptr = 0;

    while (ptr < evt.data.length) {
      const cmd = evt.data[ptr++];

      switch (cmd) {
        case E.END:
          return;

        case E.OPENW:
          ptr += 1; // position byte
          break;

        case E.CLOSEW:
          break;

        case E.MESS: {
          const charCount = evt.data[ptr++] & 0xFF;
          let text = evt.getString(ptr, charCount);
          ptr += charCount * 2;
          text = text.replace(/@[A-Z]/g, '').replace(/\0/g, '').trim();
          if (text && this.messageCallback) {
            await this.messageCallback(text);
          }
          break;
        }

        case E.SETEF: {
          const flag = evt.getWord(ptr); ptr += 2;
          this.setFlag(flag);
          break;
        }

        case E.RESETEF: {
          const flag = evt.getWord(ptr); ptr += 2;
          this.resetFlag(flag);
          break;
        }

        case E.SETCF:
          ptr += 3;
          break;

        case E.RESETCF:
          ptr += 3;
          break;

        case E.VECT:
        case E.VECT2:
        case E.LOOK:
          ptr += 2;
          break;

        case E.SE: {
          const seNo = evt.data[ptr++] & 0xFF;
          if (this.seCallback) this.seCallback(seNo);
          break;
        }

        case E.FRAME:
          ptr += 2;
          // Small delay to simulate frame wait
          await new Promise(r => setTimeout(r, 50));
          break;

        case E.JUMP: {
          const target = evt.getWord(ptr); ptr += 2;
          return this.run(target);
        }

        case E.YESNO: {
          if (this.choiceCallback) {
            const choice = await this.choiceCallback('はい', 'いいえ');
            if (choice === 0) this.setFlag(300);
            else this.resetFlag(300);
          } else {
            this.setFlag(300);
          }
          break;
        }

        case E.IF: {
          const flag = evt.getWord(ptr); ptr += 2;
          const target = evt.getWord(ptr); ptr += 2;
          if (this.getFlag(flag)) return this.run(target);
          break;
        }

        case E.IFN: {
          const flag = evt.getWord(ptr); ptr += 2;
          const target = evt.getWord(ptr); ptr += 2;
          if (!this.getFlag(flag)) return this.run(target);
          break;
        }

        case E.IFCALL: {
          const flag = evt.getWord(ptr); ptr += 2;
          const target = evt.getWord(ptr); ptr += 2;
          if (this.getFlag(flag)) await this.run(target);
          break;
        }

        case E.IFNCALL: {
          const flag = evt.getWord(ptr); ptr += 2;
          const target = evt.getWord(ptr); ptr += 2;
          if (!this.getFlag(flag)) await this.run(target);
          break;
        }

        case E.IFRET: {
          const flag = evt.getWord(ptr); ptr += 2;
          ptr += 2; // unused word
          if (this.getFlag(flag)) return;
          break;
        }

        case E.IFNRET: {
          const flag = evt.getWord(ptr); ptr += 2;
          ptr += 2;
          if (!this.getFlag(flag)) return;
          break;
        }

        case E.CALL: {
          const target = evt.getWord(ptr); ptr += 2;
          await this.run(target);
          break;
        }

        case E.RETURN:
          return;

        case E.FADEIN:
        case E.WHITEIN: {
          const speed = evt.data[ptr++] & 0xFF;
          if (this.fadeCallback) await this.fadeCallback('in', speed);
          break;
        }

        case E.FADEOUT:
        case E.WHITEOUT: {
          const speed = evt.data[ptr++] & 0xFF;
          if (this.fadeCallback) await this.fadeCallback('out', speed);
          break;
        }

        case E.AREA: {
          const area = evt.data[ptr++] & 0xFF;
          const ax = evt.data[ptr++] & 0xFF;
          const az = evt.data[ptr++] & 0xFF;
          const arot = evt.data[ptr++] & 0xFF;
          if (this.areaCallback) this.areaCallback(area, ax, az, arot);
          break;
        }

        case E.HEAL: {
          ptr += 1; // chr byte
          if (this.healCallback) this.healCallback();
          break;
        }

        case E.ADDGOLD: {
          const amount = evt.getWord(ptr); ptr += 2;
          this.gold += amount;
          if (this.goldCallback) this.goldCallback(amount);
          break;
        }

        case E.SUBGOLD: {
          const amount = evt.getWord(ptr); ptr += 2;
          this.gold -= amount;
          if (this.goldCallback) this.goldCallback(-amount);
          break;
        }

        case E.BATTLE:
        case E.BATTLE2: {
          const partyIdx = evt.getWord(ptr); ptr += 2;
          if (this.battleCallback) await this.battleCallback(partyIdx);
          break;
        }

        case E.ITEM: {
          const itemIdx = evt.getWord(ptr); ptr += 2;
          this.addItem(itemIdx);
          if (this.itemCallback) this.itemCallback(itemIdx, true);
          break;
        }

        case E.ADDITEM: {
          const itemIdx = evt.getWord(ptr); ptr += 2;
          this.addItem(itemIdx);
          if (this.itemCallback) this.itemCallback(itemIdx, true);
          break;
        }

        case E.CMPI: {
          // Compare item: if player has item, set flag 300
          const itemIdx = evt.getWord(ptr); ptr += 2;
          ptr += 1; // count
          if (this.hasItem(itemIdx)) this.setFlag(300);
          else this.resetFlag(300);
          break;
        }

        case E.MAPM: {
          const x = evt.data[ptr++] & 0xFF;
          const z = evt.data[ptr++] & 0xFF;
          const model = evt.data[ptr++] & 0xFF;
          if (this.mapChangeCallback) this.mapChangeCallback('model', x, z, model);
          break;
        }

        case E.MAPH: {
          const x = evt.data[ptr++] & 0xFF;
          const z = evt.data[ptr++] & 0xFF;
          const hit = evt.data[ptr++] & 0xFF;
          if (this.mapChangeCallback) this.mapChangeCallback('hit', x, z, hit);
          break;
        }

        case E.MAPG: {
          const x = evt.data[ptr++] & 0xFF;
          const z = evt.data[ptr++] & 0xFF;
          const ground = evt.data[ptr++] & 0xFF;
          if (this.mapChangeCallback) this.mapChangeCallback('ground', x, z, ground);
          break;
        }

        case E.QUAKE: {
          const strength = evt.data[ptr++] & 0xFF;
          if (this.quakeCallback) this.quakeCallback(strength);
          break;
        }

        case E.RESETFL: {
          // Reset a range of flags
          const flag = evt.getWord(ptr); ptr += 2;
          this.resetFlag(flag);
          break;
        }

        // Commands we skip with known sizes
        case E.MOVE: ptr += 4; break;
        case E.POS: ptr += 3; break;
        case E.TSHOP: case E.WSHOP: case E.GSHOP: case E.SSHOP: {
          // Shop: 12 bytes = shopName(0) + 6 item indices (2 bytes each)
          const items = [];
          for (let i = 0; i < 6; i++) {
            const itemIdx = evt.getWord(ptr + i * 2);
            if (itemIdx > 0 && itemIdx < 65535) items.push(itemIdx);
          }
          ptr += 12;
          if (this.shopCallback && items.length > 0) {
            await this.shopCallback(items);
          }
          break;
        }
        case E.IN: {
          // Inn: heal all for gold (simplified — free heal for now)
          if (this.healCallback) this.healCallback();
          if (this.messageCallback) await this.messageCallback('ゆっくり休んだ。HPとMPが回復した！');
          break;
        }
        case E.INRESET: case E.COIN: case E.PASSW:
        case E.QUIZ: case E.CHRMENU: case E.CSHOP: break; // 0 operands
        case E.CHRALGO: ptr += 2; break;
        case E.PARTY: case E.PARTYM: ptr += 2; break;
        case E.PAT: ptr += 2; break;
        case E.CMPP: ptr += 3; break;
        case E.CAMINIT: ptr += 1; break;
        case E.SCALE: ptr += 2; break;
        case E.CAMCHR: ptr += 1; break;
        case E.EFFECT: ptr += 2; break;
        case E.DISPGOLD: ptr += 1; break;
        case E.CMPH: ptr += 3; break;
        case E.CHRMODE: ptr += 2; break;
        case E.EXCL: ptr += 1; break;
        case E.POSADD: ptr += 5; break;
        case E.POSCOPY: ptr += 2; break;
        case E.POSY: ptr += 3; break;
        case E.CHRPRM: ptr += 3; break;
        case E.GETABI: case E.SETABI: ptr += 2; break;
        case E.AMBIENT: case E.LIGHT: ptr += 3; break;
        case E.NUMBER: ptr += 2; break;

        default: {
          console.warn(`Unknown event cmd ${cmd} at ptr ${ptr - 1} in event ${eventNo}`);
          return;
        }
      }
    }
  }
}

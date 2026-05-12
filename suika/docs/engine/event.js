// event.js — Event system (ported from CEventManage)
// Simplified: handles message display and basic commands

import { BinaryReader } from './loader.js';

// Event commands
const E = {
  END: 0, SETEF: 1, RESETEF: 2, SETCF: 3, RESETCF: 4,
  VECT: 5, VECT2: 6, LOOK: 7, OPENW: 8, CLOSEW: 9,
  MESS: 10, MOVE: 11, POS: 12, SE: 13, JUMP: 14,
  IF: 15, IFN: 16, YESNO: 17, FRAME: 22,
  FADEIN: 23, FADEOUT: 24, CALL: 57, RETURN: 58,
  AREA: 56,
};

class EventData {
  constructor() {
    this.data = null; // Uint8Array
  }

  get(ptr) { return this.data[ptr]; }

  getWord(ptr) {
    return ((this.data[ptr] & 0xFF) << 8) | (this.data[ptr + 1] & 0xFF);
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
    this.events = [];  // EventData[]
    this.messageCallback = null; // (text) => Promise<void>
    this.choiceCallback = null;
    this.battleCallback = null;  // (partyIndex) => Promise<void>
    this.areaCallback = null;    // (area, x, z, rot) => void
    this.flags = new Set(); // event flags
  }

  load(buffer) {
    // event.sui is NOT compressed (uses CFile, not CFileJip)
    // Format: [int: eventCount] [int[eventCount+1]: offsets] [raw byte data...]
    // Offsets are relative to start of data section (after offset table)
    const reader = new BinaryReader(buffer);

    const eventCount = reader.readInt();
    const offsets = [];
    for (let i = 0; i < eventCount + 1; i++) {
      offsets.push(reader.readInt());
    }

    // Data section starts here
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
    console.log(`Events loaded: ${this.events.length}, data size: ${allData.length}`);
  }

  setFlag(n) { this.flags.add(n); }
  resetFlag(n) { this.flags.delete(n); }
  getFlag(n) { return this.flags.has(n); }

  // Run an event script (simplified — only handles messages for now)
  async run(eventNo) {
    if (eventNo < 0 || eventNo >= this.events.length) return;
    const evt = this.events[eventNo];
    if (!evt || !evt.data || evt.data.length === 0) return;

    let ptr = 0;
    const stack = [];

    while (ptr < evt.data.length) {
      const cmd = evt.data[ptr++];

      switch (cmd) {
        case E.END:
          return;

        case E.OPENW: {
          ptr++; // position byte (0=top, 1=bottom)
          break;
        }

        case E.CLOSEW: {
          break;
        }

        case E.MESS: {
          const charCount = evt.data[ptr++] & 0xFF;
          let text = evt.getString(ptr, charCount);
          ptr += charCount * 2;
          // Strip control codes: @S (wait), @P (pause), @E (end), etc.
          text = text.replace(/@[A-Z]/g, '').replace(/\0/g, '').trim();
          if (text && this.messageCallback) {
            await this.messageCallback(text);
          }
          break;
        }

        case E.SETEF: {
          const flag = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
          ptr += 2;
          this.setFlag(flag);
          break;
        }

        case E.RESETEF: {
          const flag = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
          ptr += 2;
          this.resetFlag(flag);
          break;
        }

        case E.SETCF: {
          ptr += 3; // chr(1) + flag_word(2)
          break;
        }

        case E.RESETCF: {
          ptr += 3; // chr(1) + flag_word(2)
          break;
        }

        case E.VECT: {
          ptr += 2; // chr, vect
          break;
        }

        case E.VECT2: {
          ptr += 2;
          break;
        }

        case E.LOOK: {
          ptr += 2;
          break;
        }

        case E.SE: {
          ptr += 1;
          break;
        }

        case E.FRAME: {
          ptr += 2; // word
          break;
        }

        case E.JUMP: {
          // Jump changes to a different event entirely
          const target = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
          ptr += 2;
          // Run the target event instead
          return this.run(target);
        }

        case 17: { // E_YESNO — show はい/いいえ choice
          if (this.choiceCallback) {
            const choice = await this.choiceCallback('はい', 'いいえ');
            if (choice === 0) {
              this.setFlag(300);
            } else {
              this.resetFlag(300);
            }
          } else {
            // Default: choose "はい"
            this.setFlag(300);
          }
          break;
        }

        case E.IF: {
          const flag = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
          ptr += 2;
          const targetEvt = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
          ptr += 2;
          if (this.getFlag(flag)) {
            return this.run(targetEvt);
          }
          break;
        }

        case E.IFN: {
          const flag = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
          ptr += 2;
          const targetEvt = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
          ptr += 2;
          if (!this.getFlag(flag)) {
            return this.run(targetEvt);
          }
          break;
        }

        case E.CALL: {
          const target = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
          ptr += 2;
          // Run sub-event then continue
          await this.run(target);
          break;
        }

        case E.RETURN: {
          return;
        }

        case E.FADEIN:
        case E.FADEOUT: {
          ptr += 1;
          break;
        }

        case E.AREA: {
          const area = evt.data[ptr++] & 0xFF;
          const ax = evt.data[ptr++] & 0xFF;
          const az = evt.data[ptr++] & 0xFF;
          const arot = evt.data[ptr++] & 0xFF;
          if (this.areaCallback) {
            this.areaCallback(area, ax, az, arot);
          }
          break;
        }

        // Skip unknown commands with known operand sizes
        default: {
          // Handle battle command specially
          if (cmd === 36) { // E_BATTLE
            const partyIdx = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
            ptr += 2;
            if (this.battleCallback) {
              await this.battleCallback(partyIdx);
            }
            break;
          }
          if (cmd === 53) { // E_BATTLE2
            const partyIdx = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
            ptr += 2;
            if (this.battleCallback) {
              await this.battleCallback(partyIdx);
            }
            break;
          }
          if (cmd === 27) { // E_HEAL — full HP/MP recovery
            ptr += 1; // chr byte (ignored — heal all)
            if (this.healCallback) this.healCallback();
            break;
          }
          if (cmd === 28) { // E_ADDGOLD
            const gold = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
            ptr += 2;
            if (this.goldCallback) this.goldCallback(gold);
            break;
          }
          if (cmd === 29) { // E_SUBGOLD
            const gold = ((evt.data[ptr] & 0xFF) << 8) | (evt.data[ptr + 1] & 0xFF);
            ptr += 2;
            if (this.goldCallback) this.goldCallback(-gold);
            break;
          }

          // Operand sizes for all commands (from Java source analysis)
          const cmdSizes = {
            11: 4,  // E_MOVE: chr(1) + speed(1) + algo(1) + move(1)
            12: 3,  // E_POS: chr(1) + x(1) + z(1)
            13: 1,  // E_SE: se_no(1)
            17: 0,  // E_YESNO: handled above (no operands)
            18: 12, // E_TSHOP: 12 bytes
            19: 12, // E_WSHOP
            20: 12, // E_GSHOP
            21: 0,  // E_IN
            22: 2,  // E_FRAME: word(2)
            23: 1,  // E_FADEIN: speed(1)
            24: 1,  // E_FADEOUT: speed(1)
            25: 1,  // E_WHITEIN
            26: 1,  // E_WHITEOUT
            27: 1,  // E_HEAL: chr(1)
            28: 2,  // E_ADDGOLD: word(2)
            29: 2,  // E_SUBGOLD: word(2)
            30: 3,  // E_MAPM: x(1) + z(1) + model(1)
            31: 3,  // E_MAPH: x(1) + z(1) + hit(1)
            32: 2,  // E_CHRALGO: chr(1) + algo(1)
            33: 0,  // E_PASSW
            34: 3,  // E_CMPI: item(2) + count(1)
            35: 2,  // E_PARTY: chr(1) + flag(1)
            36: 2,  // E_BATTLE: word(2)
            37: 0,  // E_INRESET
            38: 0,  // E_COIN
            39: 2,  // E_PARTYM: chr(1) + flag(1)
            40: 2,  // E_PAT: chr(1) + pat(1)
            41: 3,  // E_CMPP: chr(1) + axis(1) + val(1)
            42: 1,  // E_CAMINIT: vect(1)
            43: 2,  // E_SCALE: chr(1) + scale(1)
            44: 1,  // E_CAMCHR: chr(1)
            45: 2,  // E_ITEM: item(2)
            46: 2,  // E_RESETFL: word(2)
            47: 2,  // E_EFFECT: type(1) + param(1)
            48: 1,  // E_DISPGOLD: flag(1)
            49: 3,  // E_CMPH: chr(1) + val(1) + ???(1)
            50: 3,  // E_MAPG: x(1) + z(1) + ground(1)
            51: 12, // E_SSHOP
            52: 0,  // E_QUIZ
            53: 2,  // E_BATTLE2: word(2)
            54: 2,  // E_CHRMODE: chr(1) + mode(1)
            55: 1,  // E_EXCL: chr(1)
            56: 4,  // E_AREA: area(1) + x(1) + z(1) + rot(1)
            57: 2,  // E_CALL: word(2)
            58: 0,  // E_RETURN
            59: 5,  // E_POSADD: chr(1) + dx_word(2) + dz_word(2)
            60: 4,  // E_IFCALL: flag(2) + target(2)
            61: 4,  // E_IFNCALL: flag(2) + target(2)
            62: 2,  // E_POSCOPY: src(1) + dst(1)
            63: 3,  // E_POSY: chr(1) + y_word(2)
            64: 1,  // E_QUAKE: strength(1)
            65: 3,  // E_CHRPRM: chr(1) + prm(1) + val(1)
            66: 2,  // E_ADDITEM: item(2)
            67: 4,  // E_IFRET: flag(2) + ???(2)
            68: 4,  // E_IFNRET: flag(2) + ???(2)
            69: 0,  // E_CHRMENU
            70: 2,  // E_GETABI
            71: 2,  // E_SETABI
            72: 0,  // E_CSHOP
            73: 3,  // E_AMBIENT: r(1) + g(1) + b(1)
            74: 3,  // E_LIGHT
            75: 2,  // E_NUMBER: word(2)
          };

          const skip = cmdSizes[cmd];
          if (skip !== undefined) {
            ptr += skip;
          } else {
            console.warn(`Unknown event cmd ${cmd} at ptr ${ptr - 1} in event ${eventNo}, stopping`);
            return;
          }
          break;
        }
      }
    }
  }
}

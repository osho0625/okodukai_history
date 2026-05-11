// password.js — Password save system (ported from CPlayData/CPassCode)
// Decodes original game passwords to restore save state

// Character code table (from CPassCode)
const CODE_TABLE = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ';

export class PasswordSystem {
  constructor() {
    this.passTable = new Array(318).fill(0);
    this.passRand = 0;
  }

  // Decode a character to its numeric value
  getNum(str, rand, pos) {
    if (pos >= str.length) return -1;
    const ch = str[pos];
    const idx = CODE_TABLE.indexOf(ch);
    if (idx < 0) return -1;
    // Reverse the encoding: value = (idx - rand - pos) mod 64
    let val = (idx - rand - pos) % 64;
    if (val < 0) val += 64;
    return val;
  }

  // Try to load a password string
  load(passwordStr) {
    // Remove whitespace and newlines
    const clean = passwordStr.replace(/[\s\n\r]/g, '');
    if (clean.length !== 318) return null;

    // First character determines the random seed
    const firstIdx = CODE_TABLE.indexOf(clean[0]);
    if (firstIdx < 0) return null;
    this.passRand = firstIdx;

    // Decode all characters
    for (let i = 0; i < 318; i++) {
      const val = this.getNum(clean, this.passRand, i);
      if (val < 0) return null;
      this.passTable[i] = val;
    }

    // Verify checksum
    if (!this.verifyChecksum()) return null;

    // Parse the data
    return this.parseData();
  }

  verifyChecksum() {
    let sum1 = 0, sum2 = 0;
    for (let i = 0; i < 314; i++) {
      sum1 += this.passTable[i];
      if ((i & 1) === 0) sum2 += this.passTable[i];
      else sum2 -= this.passTable[i];
    }
    return (
      this.passTable[314] === ((sum1 >> 6) & 0x3F) &&
      this.passTable[315] === (sum1 & 0x3F) &&
      this.passTable[316] === ((sum2 >> 6) & 0x3F) &&
      this.passTable[317] === (sum2 & 0x3F)
    );
  }

  readWord(offset) {
    return (this.passTable[offset] << 6) | this.passTable[offset + 1];
  }

  parseData() {
    const data = {};
    let ptr = 0;

    // Header (29 bytes)
    data.areaNo = this.readWord(ptr); ptr += 2;
    data.areaX = this.readWord(ptr); ptr += 2;
    data.areaZ = this.readWord(ptr); ptr += 2;
    data.gold = this.readWord(ptr) * 64 + this.passTable[ptr + 2]; ptr += 3;
    // Player name (7 chars = 14 values)
    let name = '';
    for (let i = 0; i < 7; i++) {
      const code = this.readWord(ptr); ptr += 2;
      if (code > 0) name += String.fromCharCode(code);
    }
    data.playerName = name.trim();
    // Skip remaining header
    ptr = 29;

    // Characters (3 × 45 bytes each)
    data.characters = [];
    for (let c = 0; c < 3; c++) {
      const chr = {};
      chr.lv = this.passTable[ptr++];
      chr.hp = this.readWord(ptr); ptr += 2;
      chr.maxHP = this.readWord(ptr); ptr += 2;
      chr.mp = this.readWord(ptr); ptr += 2;
      chr.maxMP = this.readWord(ptr); ptr += 2;
      chr.str = this.readWord(ptr); ptr += 2;
      chr.int_ = this.readWord(ptr); ptr += 2;
      chr.def = this.readWord(ptr); ptr += 2;
      chr.agi = this.readWord(ptr); ptr += 2;
      chr.dex = this.readWord(ptr); ptr += 2;
      chr.exp = this.readWord(ptr); ptr += 2;
      // Equipment (5 slots × 2 values)
      chr.equip = [];
      for (let e = 0; e < 5; e++) {
        const eq = this.readWord(ptr); ptr += 2;
        chr.equip.push(eq === 4095 ? -1 : eq); // 0xFFF = no equip
      }
      // Skip remaining
      ptr = 29 + (c + 1) * 45;
      data.characters.push(chr);
    }

    // Items (100 values at offset 164)
    ptr = 164;
    data.items = [];
    for (let i = 0; i < 100; i++) {
      const count = this.passTable[ptr++];
      if (count > 0) {
        for (let j = 0; j < count; j++) data.items.push(i);
      }
    }

    // Flags (50 values at offset 264)
    ptr = 264;
    data.flags = [];
    for (let i = 0; i < 50; i++) {
      const val = this.passTable[ptr++];
      // Each value encodes 6 flags (bits)
      for (let b = 0; b < 6; b++) {
        if ((val >> b) & 1) {
          data.flags.push(i * 6 + b);
        }
      }
    }

    return data;
  }
}

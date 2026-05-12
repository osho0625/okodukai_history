// password.js — Password save system (ported from CPlayData/CPassCode)
// Decodes and encodes original game passwords to save/restore state

// Password character table (from CPassCode.m_astrPassCode)
const PASS_CODE = ['K','s','G','T','f','-','n','v','C','O','p','B','8','D','x','F','2','H','I','J','0','L','k','N','9','P','Q','R','S','3','b','V','W','z','Y','Z','a','U','c','d','e','4','g','h','i','j','M','l','m','6','o','A','q','r','1','t','u','7','w','E','y','X','5','+'];

export class PasswordSystem {
  constructor() {
    this.passTable = new Array(318).fill(0);
    this.passRand = 0;
  }

  // Encode: value → character
  static getCode(val, rand, pos) {
    return PASS_CODE[(val + rand + pos * 27) & 0x3F];
  }

  // Decode: character → value
  static getNum(ch, rand, pos) {
    const idx = PASS_CODE.indexOf(ch);
    if (idx < 0) return -1;
    return (idx - rand - pos * 27) & 0x3F;
  }

  writeWord(offset, val) {
    this.passTable[offset] = (val >> 6) & 0x3F;
    this.passTable[offset + 1] = val & 0x3F;
  }

  readWord(offset) {
    return (this.passTable[offset] << 6) | this.passTable[offset + 1];
  }

  equip2Pass(equipIdx, baseIdx) {
    if (equipIdx === -1) return 63;
    return (equipIdx - baseIdx) & 0x3F;
  }

  // Try to load a password string
  load(passwordStr) {
    const clean = passwordStr.replace(/[\s\n\r]/g, '');
    if (clean.length !== 318) return null;

    // First character determines the random seed
    const firstIdx = PASS_CODE.indexOf(clean[0]);
    if (firstIdx < 0) return null;
    // The rand is derived from the first decoded value
    // Actually rand is stored separately — the first value in passTable[0] is decoded using rand
    // We need to find rand such that GetNum(clean[0], rand, 0) gives a valid value
    // From GetCode: code = PASS_CODE[(val + rand + 0*27) & 0x3F]
    // So: idx = (val + rand) & 0x3F → val = (idx - rand) & 0x3F
    // The rand itself is what was used to encode. We try all 64 possible rands.
    // Actually in the original, rand is chosen randomly and the first byte encodes passTable[0]=0 (version marker)
    // So: PASS_CODE[(0 + rand + 0) & 0x3F] = clean[0] → rand = indexOf(clean[0])
    this.passRand = firstIdx;

    // Decode all characters
    for (let i = 0; i < 318; i++) {
      const val = PasswordSystem.getNum(clean[i], this.passRand, i);
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

  makeChecksum() {
    let sum1 = 0, sum2 = 0;
    for (let i = 0; i < 314; i++) {
      sum1 += this.passTable[i];
      if ((i & 1) === 0) sum2 += this.passTable[i];
      else sum2 -= this.passTable[i];
    }
    this.passTable[314] = (sum1 >> 6) & 0x3F;
    this.passTable[315] = sum1 & 0x3F;
    this.passTable[316] = (sum2 >> 6) & 0x3F;
    this.passTable[317] = sum2 & 0x3F;
  }

  parseData() {
    const data = {};
    let ptr = 0;

    // Header: [0]=version marker(0), [1]=format(2)
    ptr = 0;
    // Player name indices (4 chars × 2 values each)
    data.playerNameIdx = [];
    for (let i = 0; i < 4; i++) {
      data.playerNameIdx.push(this.readWord(ptr + 2 + i * 2));
    }
    data.areaNo = this.readWord(ptr + 10);
    data.posX = this.readWord(ptr + 12);
    data.posZ = this.readWord(ptr + 14);
    data.vect = this.passTable[ptr + 16];
    data.gold = this.passTable[ptr + 17] * 262144 + this.passTable[ptr + 18] * 4096 + this.passTable[ptr + 19] * 64 + this.passTable[ptr + 20];
    data.shipX = this.readWord(ptr + 24);
    data.shipZ = this.passTable[ptr + 27];
    data.shipV = this.passTable[ptr + 28];
    ptr = 29;

    // Characters (3 × 45 bytes each)
    data.characters = [];
    for (let c = 0; c < 3; c++) {
      const chr = {};
      const base = ptr;
      chr.exp = this.passTable[base] * 262144 + this.passTable[base + 1] * 4096 + this.passTable[base + 2] * 64 + this.passTable[base + 3];
      chr.ap = this.readWord(base + 4);
      chr.gem = this.passTable[base + 6] === 63 ? -1 : this.passTable[base + 6] + 110;
      chr.gemFlags = [this.passTable[base + 7], this.passTable[base + 8], this.passTable[base + 9]];
      chr.equip = [
        this.passTable[base + 10] === 63 ? -1 : this.passTable[base + 10] + 20,
        this.passTable[base + 11] === 63 ? -1 : this.passTable[base + 11] + 50,
        this.passTable[base + 12] === 63 ? -1 : this.passTable[base + 12] + 70,
        this.passTable[base + 13] === 63 ? -1 : this.passTable[base + 13] + 89,
        this.passTable[base + 14] === 63 ? -1 : this.passTable[base + 14] + 89,
      ];
      // Abilities (magic flags: 19 values, cmd flags: 2 values, cmd slots: 4 values)
      chr.abiM = [];
      for (let i = 0; i < 19; i++) chr.abiM.push(this.passTable[base + 15 + i]);
      chr.abiC = [this.passTable[base + 34], this.passTable[base + 35]];
      chr.cmdAb = [this.passTable[base + 36], this.passTable[base + 37], this.passTable[base + 38], this.passTable[base + 39]];
      chr.hp = this.passTable[base + 40] * 4096 + this.passTable[base + 41] * 64 + this.passTable[base + 42];
      chr.mp = this.passTable[base + 43] * 64 + this.passTable[base + 44];
      ptr += 45;
      data.characters.push(chr);
    }

    // Items (100 values, packed 3 items per 2 bytes)
    ptr = 164;
    data.items = new Array(150).fill(0);
    let itemPtr = 0;
    for (let i = 0; i < 50; i++) {
      const v0 = this.passTable[ptr + i * 2];
      const v1 = this.passTable[ptr + i * 2 + 1];
      data.items[itemPtr++] = v0 & 0xF;
      data.items[itemPtr++] = ((v0 >> 4) & 0x3) | ((v1 >> 4) << 2);
      data.items[itemPtr++] = v1 & 0xF;
    }

    // Flags (50 values at offset 264)
    ptr = 264;
    data.flags = [];
    for (let i = 0; i < 50; i++) {
      const val = this.passTable[ptr + i];
      for (let b = 0; b < 6; b++) {
        if ((val >> b) & 1) {
          data.flags.push(i * 6 + b);
        }
      }
    }

    return data;
  }

  // ============================================================
  // Password Generation (encode current game state)
  // ============================================================

  generate(gameState) {
    // gameState: { playerNameIdx, areaNo, posX, posZ, vect, gold, characters[], items[], flags[], shipX, shipZ, shipV }
    this.passTable.fill(0);

    // Pick a new random seed
    let newRand;
    do { newRand = Math.floor(Math.random() * 64); } while (newRand === this.passRand);
    this.passRand = newRand;

    // Header (29 bytes)
    let ptr = 0;
    this.passTable[ptr] = 0;     // version marker
    this.passTable[ptr + 1] = 2; // format version
    // Player name (4 indices × 2 values)
    const nameIdx = gameState.playerNameIdx || [117, 118, 119, 120]; // default: 西瓜太郎
    for (let i = 0; i < 4; i++) {
      this.passTable[ptr + 2 + i * 2] = (nameIdx[i] >> 6) & 0x3F;
      this.passTable[ptr + 2 + i * 2 + 1] = nameIdx[i] & 0x3F;
    }
    this.writeWord(ptr + 10, gameState.areaNo || 0);
    this.writeWord(ptr + 12, gameState.posX || 16);
    this.writeWord(ptr + 14, gameState.posZ || 35);
    this.passTable[ptr + 16] = gameState.vect || 0;
    const gold = gameState.gold || 0;
    this.passTable[ptr + 17] = (gold >> 18) & 0x3F;
    this.passTable[ptr + 18] = (gold >> 12) & 0x3F;
    this.passTable[ptr + 19] = (gold >> 6) & 0x3F;
    this.passTable[ptr + 20] = gold & 0x3F;
    // Play time (simplified: 0)
    this.passTable[ptr + 21] = 0;
    this.passTable[ptr + 22] = 0;
    this.passTable[ptr + 23] = 0;
    this.writeWord(ptr + 24, gameState.shipX || 17);
    this.passTable[ptr + 26] = 0;
    this.passTable[ptr + 27] = (gameState.shipZ || 36) & 0x3F;
    this.passTable[ptr + 28] = (gameState.shipV || 1) & 0x3F;

    // Characters (3 × 45 bytes)
    ptr = 29;
    const chars = gameState.characters || [];
    for (let c = 0; c < 3; c++) {
      const chr = chars[c] || {};
      const base = ptr;
      const exp = chr.exp || 0;
      this.passTable[base] = (exp >> 18) & 0x3F;
      this.passTable[base + 1] = (exp >> 12) & 0x3F;
      this.passTable[base + 2] = (exp >> 6) & 0x3F;
      this.passTable[base + 3] = exp & 0x3F;
      this.writeWord(base + 4, chr.ap || 0);
      this.passTable[base + 6] = this.equip2Pass(chr.gem !== undefined ? chr.gem : -1, 110);
      const gf = chr.gemFlags || [0, 0, 0];
      this.passTable[base + 7] = gf[0] & 0x3F;
      this.passTable[base + 8] = gf[1] & 0x3F;
      this.passTable[base + 9] = gf[2] & 0x3F;
      const eq = chr.equip || [-1, -1, -1, -1, -1];
      this.passTable[base + 10] = this.equip2Pass(eq[0], 20);
      this.passTable[base + 11] = this.equip2Pass(eq[1], 50);
      this.passTable[base + 12] = this.equip2Pass(eq[2], 70);
      this.passTable[base + 13] = this.equip2Pass(eq[3], 89);
      this.passTable[base + 14] = this.equip2Pass(eq[4], 89);
      const abiM = chr.abiM || new Array(19).fill(0);
      for (let i = 0; i < 19; i++) this.passTable[base + 15 + i] = abiM[i] & 0x3F;
      const abiC = chr.abiC || [0, 0];
      this.passTable[base + 34] = abiC[0] & 0x3F;
      this.passTable[base + 35] = abiC[1] & 0x3F;
      const cmdAb = chr.cmdAb || [0, 0, 0, 0];
      for (let i = 0; i < 4; i++) this.passTable[base + 36 + i] = cmdAb[i] & 0x3F;
      const hp = chr.hp || 0;
      this.passTable[base + 40] = (hp >> 12) & 0x3F;
      this.passTable[base + 41] = (hp >> 6) & 0x3F;
      this.passTable[base + 42] = hp & 0x3F;
      const mp = chr.mp || 0;
      this.passTable[base + 43] = (mp >> 6) & 0x3F;
      this.passTable[base + 44] = mp & 0x3F;
      ptr += 45;
    }

    // Items (packed: 3 items per 2 table entries)
    ptr = 164;
    const items = gameState.items || new Array(150).fill(0);
    let itemIdx = 0;
    for (let i = 0; i < 50; i++) {
      const i0 = items[itemIdx++] || 0;
      const i1 = items[itemIdx++] || 0;
      const i2 = items[itemIdx++] || 0;
      this.passTable[ptr + i * 2] = (i0 & 0xF) | ((i1 & 0x3) << 4);
      this.passTable[ptr + i * 2 + 1] = (i2 & 0xF) | ((i1 >> 2) << 4);
    }

    // Flags (50 values at offset 264)
    ptr = 264;
    const flags = new Set(gameState.flags || []);
    for (let i = 0; i < 50; i++) {
      let val = 0;
      for (let b = 0; b < 6; b++) {
        if (flags.has(i * 6 + b)) val |= (1 << b);
      }
      this.passTable[ptr + i] = val & 0x3F;
    }

    // Checksum
    this.makeChecksum();

    // Encode to string
    let result = '';
    for (let i = 0; i < 318; i++) {
      result += PasswordSystem.getCode(this.passTable[i], this.passRand, i);
      if ((i + 1) % 53 === 0) result += '\n';
    }
    return result;
  }
}

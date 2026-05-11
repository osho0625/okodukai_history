// compose.js — Composition/crafting shop (ported from CComposition/CCompTable)

// Composition recipes: [resultItemIdx, gold, mat1Idx, mat1Num, mat2Idx, mat2Num, mat3Idx, mat3Num]
// -1 = no material needed for that slot
const COMP_TABLE = [
  [8, 100, 145, 2, -1, -1, -1, -1],
  [27, 6000, 141, 1, 140, 9, 20, 1],
  [36, 4000, 33, 1, 34, 1, 35, 1],
  [39, 20000, 38, 3, 146, 9, -1, -1],
  [79, 20000, 74, 1, 144, 4, 146, 7],
  [42, 400, 40, 3, -1, -1, -1, -1],
  [44, 800, 42, 4, -1, -1, -1, -1],
  [45, 1600, 44, 5, -1, -1, -1, -1],
  [15, 2000, 102, 1, 144, 2, 146, 1],
  [88, 15000, 86, 1, 143, 3, 144, 3],
  [108, 12000, 144, 3, 145, 3, 146, 3],
  [145, 1000, 6, 7, -1, -1, -1, -1],
  [146, 10000, 145, 9, -1, -1, -1, -1],
  [118, 5000, 142, 5, 114, 1, 115, 1],
];

export class ComposeShop {
  constructor(ctx, input, paramAll) {
    this.ctx = ctx;
    this.input = input;
    this.paramAll = paramAll;
    this.visible = false;
    this.cursor = 0;
    this.gold = 0;
    this.inventory = [];
    this.message = '';
    this.messageTimer = 0;
    this.resolve = null;
  }

  open(playerGold, playerInventory) {
    this.visible = true;
    this.cursor = 0;
    this.gold = playerGold;
    this.inventory = playerInventory;
    this.message = '合成屋「いらっしゃいませ」';
    this.messageTimer = 0;
    return new Promise(resolve => { this.resolve = resolve; });
  }

  close() {
    this.visible = false;
    if (this.resolve) {
      this.resolve({ gold: this.gold, inventory: [...this.inventory] });
      this.resolve = null;
    }
  }

  countItem(itemIdx) {
    return this.inventory.filter(i => i === itemIdx).length;
  }

  removeItems(itemIdx, count) {
    for (let i = 0; i < count; i++) {
      const pos = this.inventory.indexOf(itemIdx);
      if (pos >= 0) this.inventory.splice(pos, 1);
    }
  }

  canCraft(recipeIdx) {
    const r = COMP_TABLE[recipeIdx];
    if (this.gold < r[1]) return false;
    for (let m = 0; m < 3; m++) {
      const matIdx = r[2 + m * 2];
      const matNum = r[3 + m * 2];
      if (matIdx === -1) continue;
      if (this.countItem(matIdx) < matNum) return false;
    }
    return true;
  }

  update() {
    if (!this.visible) return;
    if (this.messageTimer > 0) { this.messageTimer--; return; }

    if (this.input.isKeyDown('arrowup')) this.cursor = (this.cursor - 1 + COMP_TABLE.length) % COMP_TABLE.length;
    if (this.input.isKeyDown('arrowdown')) this.cursor = (this.cursor + 1) % COMP_TABLE.length;

    if (this.input.isOK()) {
      const r = COMP_TABLE[this.cursor];
      if (this.canCraft(this.cursor)) {
        // Craft!
        this.gold -= r[1];
        for (let m = 0; m < 3; m++) {
          const matIdx = r[2 + m * 2];
          const matNum = r[3 + m * 2];
          if (matIdx >= 0) this.removeItems(matIdx, matNum);
        }
        this.inventory.push(r[0]);
        const item = this.paramAll.getItem(r[0]);
        this.message = `${item ? item.name.trim() : '???'}を合成した！`;
        this.messageTimer = 40;
      } else if (this.gold < r[1]) {
        this.message = 'お金が足りません';
        this.messageTimer = 30;
      } else {
        this.message = '素材が足りません';
        this.messageTimer = 30;
      }
    }

    if (this.input.isCancel()) this.close();
  }

  draw() {
    if (!this.visible) return;
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, 400, 320);

    // Title + message
    ctx.fillStyle = 'rgba(0,40,0,0.9)';
    ctx.fillRect(10, 8, 380, 28);
    ctx.strokeStyle = '#6a6';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 8, 380, 28);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.message || '合成屋 (X:閉じる)', 200, 26);

    // Gold
    ctx.fillStyle = '#fd0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`所持金: ${this.gold}G`, 385, 50);

    // Recipe list
    const x = 10, y = 55, w = 380, maxShow = 7;
    const h = 10 + Math.min(COMP_TABLE.length, maxShow) * 34;
    ctx.fillStyle = 'rgba(0,40,0,0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#6a6';
    ctx.strokeRect(x, y, w, h);

    const startIdx = Math.max(0, this.cursor - maxShow + 1);
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';

    for (let i = 0; i < maxShow && startIdx + i < COMP_TABLE.length; i++) {
      const idx = startIdx + i;
      const r = COMP_TABLE[idx];
      const canCraft = this.canCraft(idx);
      const resultItem = this.paramAll.getItem(r[0]);
      const ry = y + 8 + i * 34;

      // Highlight
      if (idx === this.cursor) {
        ctx.fillStyle = 'rgba(100,200,100,0.15)';
        ctx.fillRect(x + 2, ry - 4, w - 4, 32);
      }

      // Result item name
      ctx.fillStyle = idx === this.cursor ? (canCraft ? '#ff0' : '#a66') : (canCraft ? '#ddd' : '#666');
      const prefix = idx === this.cursor ? '▶' : '  ';
      ctx.fillText(`${prefix}${resultItem ? resultItem.name.trim() : '???'}`, x + 6, ry + 10);

      // Gold cost
      ctx.fillStyle = this.gold >= r[1] ? '#fd0' : '#a44';
      ctx.textAlign = 'right';
      ctx.fillText(`${r[1]}G`, x + w - 6, ry + 10);
      ctx.textAlign = 'left';

      // Materials
      ctx.font = '9px monospace';
      let matStr = '';
      for (let m = 0; m < 3; m++) {
        const matIdx = r[2 + m * 2];
        const matNum = r[3 + m * 2];
        if (matIdx < 0) continue;
        const matItem = this.paramAll.getItem(matIdx);
        const have = this.countItem(matIdx);
        const enough = have >= matNum;
        matStr += `${matItem ? matItem.name.trim().slice(0,5) : '?'}(${have}/${matNum}) `;
      }
      ctx.fillStyle = canCraft ? '#8c8' : '#866';
      ctx.fillText(matStr, x + 20, ry + 24);
      ctx.font = '11px sans-serif';
    }
  }
}

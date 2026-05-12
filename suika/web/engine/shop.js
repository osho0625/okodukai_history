// shop.js — Shop system (ported from CToolShop/CInShop)
// Provides buy/sell UI for items, weapons, armor

export class ShopUI {
  constructor(ctx, input, paramAll) {
    this.ctx = ctx;
    this.input = input;
    this.paramAll = paramAll;
    this.visible = false;
    this.mode = 'main'; // main, buy, sell
    this.cursor = 0;
    this.itemList = [];  // { index, name, gold }
    this.inventory = []; // player's items (reference)
    this.gold = 0;
    this.shopName = '';
    this.resolve = null;
    this.message = '';
    this.messageTimer = 0;
  }

  // Open shop with item indices to sell
  open(shopName, itemIndices, playerGold, playerInventory) {
    this.visible = true;
    this.mode = 'greeting'; // Start with greeting message
    this.cursor = 0;
    this.shopName = shopName;
    this.gold = playerGold;
    this.inventory = playerInventory;
    this.message = '';
    this.messageTimer = 0;
    this._greetingDone = false;

    // Greeting messages per shop type
    const greetings = {
      '道具屋': 'いらっしゃい！\n何をお探しかな？',
      '武器屋': 'よう来たな！\nいい武器が揃ってるぜ。',
      '勾玉屋': 'ようこそ。\n勾玉はいかがですか？',
      '土産屋': 'いらっしゃいませ。\nお土産はいかが？',
      '合成屋': 'いらっしゃい。\n何か作りましょうか？',
    };
    this._greeting = greetings[shopName] || `${shopName}「いらっしゃいませ」`;

    this.itemList = [];
    for (const idx of itemIndices) {
      const item = this.paramAll.getItem(idx);
      if (item && item.name) {
        this.itemList.push({ index: idx, name: item.name.trim(), gold: item.gold });
      }
    }

    return new Promise(resolve => { this.resolve = resolve; });
  }

  close() {
    this.visible = false;
    const result = { gold: this.gold, inventory: [...this.inventory] };
    if (this.resolve) { this.resolve(result); this.resolve = null; }
  }

  update() {
    if (!this.visible) return;
    if (this.messageTimer > 0) {
      this.messageTimer--;
      // Still process direction input during message display to prevent stuck keys
      if (this.mode === 'buy') {
        if (this.input.isUp()) this.cursor = (this.cursor - 1 + this.itemList.length) % this.itemList.length;
        if (this.input.isDown()) this.cursor = (this.cursor + 1) % this.itemList.length;
      } else if (this.mode === 'sell') {
        // Allow cursor movement during sell message too
        const sellCount = this.inventory.filter((_, i) => this.paramAll.getItem(this.inventory[i])).length;
        if (sellCount > 0) {
          if (this.input.isUp()) this.cursor = Math.max(0, this.cursor - 1);
          if (this.input.isDown()) this.cursor = Math.min(sellCount - 1, this.cursor + 1);
        }
      }
      return;
    }

    if (this.mode === 'greeting') {
      // Show greeting, wait for OK to proceed to main menu
      if (this.input.isOK() || this.input.isCancel()) {
        this.mode = 'main';
        this.cursor = 0;
      }
      return;
    }

    if (this.mode === 'main') {
      const items = ['買う', '売る', 'やめる'];
      if (this.input.isUp()) this.cursor = (this.cursor - 1 + items.length) % items.length;
      if (this.input.isDown()) this.cursor = (this.cursor + 1) % items.length;
      if (this.input.isOK()) {
        if (this.cursor === 0) { this.mode = 'buy'; this.cursor = 0; }
        else if (this.cursor === 1) { this.mode = 'sell'; this.cursor = 0; }
        else this.close();
      }
      if (this.input.isCancel()) this.close();
    } else if (this.mode === 'buy') {
      if (this.itemList.length === 0) { this.mode = 'main'; this.cursor = 0; return; }
      if (this.input.isUp()) this.cursor = (this.cursor - 1 + this.itemList.length) % this.itemList.length;
      if (this.input.isDown()) this.cursor = (this.cursor + 1) % this.itemList.length;
      if (this.input.isOK()) {
        const item = this.itemList[this.cursor];
        if (this.gold >= item.gold) {
          this.gold -= item.gold;
          this.inventory.push(item.index);
          this.message = `${item.name}を買った！`;
          this.messageTimer = 30;
        } else {
          this.message = 'お金が足りない！';
          this.messageTimer = 30;
        }
      }
      if (this.input.isCancel()) { this.mode = 'main'; this.cursor = 0; }
    } else if (this.mode === 'sell') {
      const sellable = this.inventory.map((idx, i) => {
        const item = this.paramAll.getItem(idx);
        return item ? { invIdx: i, index: idx, name: item.name.trim(), gold: Math.floor(item.gold / 2) } : null;
      }).filter(Boolean);
      if (sellable.length === 0) { this.message = '売れるものがない'; this.messageTimer = 30; this.mode = 'main'; this.cursor = 0; return; }
      if (this.cursor >= sellable.length) this.cursor = sellable.length - 1;
      if (this.input.isUp()) this.cursor = (this.cursor - 1 + sellable.length) % sellable.length;
      if (this.input.isDown()) this.cursor = (this.cursor + 1) % sellable.length;
      if (this.input.isOK()) {
        const s = sellable[this.cursor];
        this.gold += s.gold;
        this.inventory.splice(s.invIdx, 1);
        this.message = `${s.name}を${s.gold}Gで売った`;
        this.messageTimer = 30;
        if (this.cursor > 0) this.cursor--;
      }
      if (this.input.isCancel()) { this.mode = 'main'; this.cursor = 0; }
    }
  }

  draw() {
    if (!this.visible) return;
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 400, 320);

    // Greeting mode: show dialogue box
    if (this.mode === 'greeting') {
      ctx.fillStyle = 'rgba(0,0,60,0.92)';
      ctx.fillRect(30, 100, 340, 100);
      ctx.strokeStyle = '#88f';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 100, 340, 100);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      const lines = this._greeting.split('\n');
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 200, 135 + i * 24);
      }
      ctx.fillStyle = '#aaa';
      ctx.font = '10px sans-serif';
      ctx.fillText('▼', 200, 190);
      return;
    }

    // Shop title
    ctx.fillStyle = 'rgba(0,0,60,0.9)';
    ctx.fillRect(10, 10, 380, 30);
    ctx.strokeStyle = '#88f';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 380, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.message || `${this.shopName}`, 200, 30);

    // Gold display
    ctx.fillStyle = '#fd0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`所持金: ${this.gold} G`, 380, 58);

    if (this.mode === 'main') {
      this._drawMainMenu(ctx);
    } else if (this.mode === 'buy') {
      this._drawBuyMenu(ctx);
    } else if (this.mode === 'sell') {
      this._drawSellMenu(ctx);
    }
  }

  _drawMainMenu(ctx) {
    const items = ['買う', '売る', 'やめる'];
    const x = 150, y = 100;
    ctx.fillStyle = 'rgba(0,0,60,0.9)';
    ctx.fillRect(x, y, 100, 80);
    ctx.strokeStyle = '#88f';
    ctx.strokeRect(x, y, 100, 80);
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = i === this.cursor ? '#ff0' : '#fff';
      ctx.fillText((i === this.cursor ? '▶' : '  ') + items[i], x + 10, y + 22 + i * 24);
    }
  }

  _drawBuyMenu(ctx) {
    const x = 20, y = 65, w = 360, maxShow = 8;
    const h = 20 + Math.min(this.itemList.length, maxShow) * 22;
    ctx.fillStyle = 'rgba(0,0,60,0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#88f';
    ctx.strokeRect(x, y, w, h);

    ctx.font = '12px sans-serif';
    const startIdx = Math.max(0, this.cursor - maxShow + 1);
    for (let i = 0; i < maxShow && startIdx + i < this.itemList.length; i++) {
      const idx = startIdx + i;
      const item = this.itemList[idx];
      const canBuy = this.gold >= item.gold;
      ctx.fillStyle = idx === this.cursor ? (canBuy ? '#ff0' : '#a66') : (canBuy ? '#fff' : '#666');
      ctx.textAlign = 'left';
      ctx.fillText((idx === this.cursor ? '▶' : '  ') + item.name, x + 10, y + 18 + i * 22);
      ctx.textAlign = 'right';
      ctx.fillText(`${item.gold}G`, x + w - 10, y + 18 + i * 22);
    }
  }

  _drawSellMenu(ctx) {
    const sellable = this.inventory.map((idx, i) => {
      const item = this.paramAll.getItem(idx);
      return item ? { name: item.name.trim(), gold: Math.floor(item.gold / 2) } : null;
    }).filter(Boolean);

    const x = 20, y = 65, w = 360, maxShow = 8;
    const h = 20 + Math.min(sellable.length, maxShow) * 22;
    ctx.fillStyle = 'rgba(0,0,60,0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#88f';
    ctx.strokeRect(x, y, w, h);

    ctx.font = '12px sans-serif';
    const startIdx = Math.max(0, this.cursor - maxShow + 1);
    for (let i = 0; i < maxShow && startIdx + i < sellable.length; i++) {
      const idx = startIdx + i;
      const item = sellable[idx];
      ctx.fillStyle = idx === this.cursor ? '#ff0' : '#fff';
      ctx.textAlign = 'left';
      ctx.fillText((idx === this.cursor ? '▶' : '  ') + item.name, x + 10, y + 18 + i * 22);
      ctx.textAlign = 'right';
      ctx.fillText(`${item.gold}G`, x + w - 10, y + 18 + i * 22);
    }
  }
}

// main.js — Entry point for the HTML5 port of "すいかが食べたい"

import { Renderer } from './engine/renderer.js';
import { Input, DIR } from './engine/input.js';
import { GameLoop } from './engine/loop.js';
import { AssetLoader, BinaryReader, decompressJip } from './engine/loader.js';
import { Vec3, Color } from './engine/math.js';
import { StageManager, MapData } from './engine/stage.js';
import { Field } from './engine/field.js';
import { EventManager } from './engine/event.js';
import { MessageWindow, ChoiceWindow } from './engine/message.js';
import { ParamAll } from './engine/params.js';
import { BattleEngine, BATTLE_RESULT, CMD } from './engine/battle.js';
import { BattleUI } from './engine/battle-ui.js';
import { TouchUI } from './engine/touch-ui.js';
import { AudioManager } from './engine/audio.js';
import { ShopUI } from './engine/shop.js';

class SuikaGame {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.renderer = new Renderer();
    this.input = new Input(this.canvas);
    this.touchUI = new TouchUI(this.input);
    this.loop = new GameLoop(90);
    this.loader = new AssetLoader(new URL('../', import.meta.url).href);

    this.images = [];
    this.models = [];
    this.audio = new AudioManager();
    this.stageManager = new StageManager();
    this.eventManager = new EventManager();
    this.paramAll = new ParamAll();
    this.messageWindow = new MessageWindow(this.ctx);
    this.choiceWindow = new ChoiceWindow(this.ctx);
    this.field = null;
    this.currentArea = 0;
    this.frameCount = 0;
    this.state = 'loading';
    this.eventRunning = false;

    // Battle system
    this.battleEngine = null;
    this.battleUI = null;
    this.playerParams = []; // player party params for battle
    this.fadeAlpha = 0; // 0=no fade, 1=fully black
    this.titleCursor = 0;
    this.menuCursor = 0;
    this.menuOpen = false;
    this.shopUI = null;
    this.battleResult = null; // { exp, gold, levelUps[] }
  }

  async init() {
    this.renderer.create(this.canvas);
    this.showLoadingScreen('初期化中...');

    try {
      this.showLoadingScreen('画像読込中...');
      this.images = await this.loader.loadAllImages(32);

      this.models = await this.loader.loadAllModels(204, (i, total) => {
        this.showLoadingScreen(`モデル読込中... ${i}/${total}`);
      });

      this.showLoadingScreen('ステージデータ読込中...');
      const stageBuf = await this.loader.fetchBinary('data/stage._su');
      const stageData = decompressJip(stageBuf);
      const stageReader = new BinaryReader(stageData);
      this.stageManager.load(stageReader);

      this.showLoadingScreen('イベントデータ読込中...');
      try {
        const eventBuf = await this.loader.fetchBinary('data/event.sui');
        this.eventManager.load(eventBuf);
      } catch (e) {
        console.warn('Event data load failed:', e.message);
      }

      // Load parameter data
      this.showLoadingScreen('パラメータ読込中...');
      try {
        const paramBuf = await this.loader.fetchBinary('data/param._da');
        this.paramAll.load(paramBuf);
        // Setup default player party (first 3 character params)
        if (this.paramAll.chrParams.length >= 3) {
          this.playerParams = [
            this.paramAll.chrParams[0].clone(),
            this.paramAll.chrParams[1].clone(),
            this.paramAll.chrParams[2].clone(),
          ];
          // Mark as player
          this.playerParams.forEach(p => { p.isPlayer = true; });
        }
      } catch (e) {
        console.warn('Param data load failed:', e.message);
      }

      // Load audio (non-blocking, don't fail if unavailable)
      this.audio.init();
      this.audio.loadAll(this.loader.baseUrl, 30).catch(() => {});

      // Wire up message callback
      this.eventManager.messageCallback = (text) => this.messageWindow.show(text);
      this.eventManager.choiceCallback = (opt1, opt2) => this.choiceWindow.show(opt1, opt2);
      this.eventManager.battleCallback = (partyIndex) => {
        return new Promise((resolve) => {
          this.startBattle(partyIndex);
          // Wait for battle to end
          const checkEnd = setInterval(() => {
            if (this.state !== 'battle') {
              clearInterval(checkEnd);
              resolve();
            }
          }, 100);
        });
      };
      this.eventManager.areaCallback = (area, x, z, rot) => {
        if (area < this.stageManager.stages.length) {
          const stageArea = this.stageManager.stages[area];
          this.field.changeArea(stageArea, x, z, rot);
          this.currentArea = area;
        }
      };
      this.eventManager.healCallback = () => {
        // Restore all player HP/MP
        for (const p of this.playerParams) {
          p.hp = p.maxHP;
          p.mp = p.maxMP;
        }
      };
      this.eventManager.goldCallback = (amount) => {
        this.gold = (this.gold || 0) + amount;
      };
      this.eventManager.fadeCallback = async (type, speed) => {
        // Fade in/out effect
        const duration = Math.max(200, speed * 50);
        const start = performance.now();
        const fadeOut = (type === 'out');
        return new Promise(resolve => {
          const animate = () => {
            const elapsed = performance.now() - start;
            const t = Math.min(1, elapsed / duration);
            this.fadeAlpha = fadeOut ? t : (1 - t);
            if (t < 1) requestAnimationFrame(animate);
            else resolve();
          };
          animate();
        });
      };
      this.eventManager.mapChangeCallback = (type, x, z, val) => {
        if (!this.field.area) return;
        const map = this.field.area.map;
        if (x >= map.xNum || z >= map.zNum) return;
        const idx = map.getPtr(x, z);
        if (type === 'model') map.mapModel[idx] = val;
        else if (type === 'hit') map.hit[idx] = val;
        else if (type === 'ground') map.ground[idx] = val;
      };
      this.eventManager.itemCallback = (itemIdx, add) => {
        const item = this.paramAll.getItem(itemIdx);
        if (item && this.messageWindow) {
          this.messageWindow.show(`${item.name}を手に入れた！`);
        }
      };
      this.eventManager.seCallback = (seNo) => {
        this.audio.play(seNo);
      };
      this.eventManager.shopCallback = async (itemIndices) => {
        this.shopUI = new ShopUI(this.ctx, this.input, this.paramAll);
        const result = await this.shopUI.open('お店', itemIndices, this.gold || 0, this.eventManager.inventory);
        this.gold = result.gold;
        this.eventManager.inventory = result.inventory;
        this.eventManager.gold = this.gold;
        this.shopUI = null;
      };

      // Setup field with first area
      this.field = new Field(this.renderer, this.models);
      this.field.eventFlags = this.eventManager.flags; // Share flags for ifFlag checks
      this.field.onAreaChange = (areaIdx, x, z, rot) => {
        if (areaIdx < this.stageManager.stages.length) {
          const area = this.stageManager.stages[areaIdx];
          this.field.changeArea(area, x, z, rot);
          this.currentArea = areaIdx;
          console.log(`Area changed to ${areaIdx}, pos ${x},${z}`);
        }
      };
      this.field.onTalkNpc = (npc) => {
        console.log(`Talk to NPC kind:${npc.kind} event:${npc.event}`);
      };
      this.field.onWallEvent = (eventNo) => {
        if (this.eventRunning) return;
        this.eventRunning = true;
        this.eventManager.run(eventNo).then(() => {
          this.eventRunning = false;
        }).catch((e) => {
          console.warn('Wall event error:', e);
          this.eventRunning = false;
        });
      };

      if (this.stageManager.stages.length > 0) {
        // Log areas with encounters for debugging
        for (let i = 0; i < this.stageManager.stages.length; i++) {
          const s = this.stageManager.stages[i];
          if (s.enemies && s.enemies.length > 0) {
            console.log(`Area ${i}: ${s.map.xNum}x${s.map.zNum}, enemies:${s.enemies.length}, npcs:${s.npcs.length}`);
          }
          if (s.wallEvents && s.wallEvents.length > 0) {
            for (const we of s.wallEvents) {
              console.log(`  WallEvent: pos(${we.xPos},${we.zPos}) vect:${we.vect} event:${we.event}`);
            }
          }
        }

        // Start at area 1 (first playable area)
        let areaIdx = 1;
        if (areaIdx >= this.stageManager.stages.length) areaIdx = 0;
        const area = this.stageManager.stages[areaIdx];
        this.field.setArea(area);
        this.currentArea = areaIdx;

        // Find a walkable starting position
        let placed = false;
        for (let z = 1; z < area.map.zNum - 1 && !placed; z++) {
          for (let x = 1; x < area.map.xNum - 1 && !placed; x++) {
            const idx = area.map.getPtr(x, z);
            if (area.map.hit[idx] === 0 && area.map.ground[idx] !== 0) {
              this.field.playerPos.x = MapData.getXPos(x);
              this.field.playerPos.z = MapData.getZPos(z);
              placed = true;
            }
          }
        }
        if (!placed) {
          this.field.playerPos.x = MapData.getXPos(Math.floor(area.map.xNum / 2));
          this.field.playerPos.z = MapData.getZPos(Math.floor(area.map.zNum / 2));
        }
        console.log(`Area ${areaIdx}: ${area.map.xNum}x${area.map.zNum}, player at ${this.field.playerPos.x}, ${this.field.playerPos.z}`);
      }

      this.showLoadingScreen('読み込み完了！');
      this.state = 'title';
    } catch (e) {
      console.error('Load error:', e);
      this.showLoadingScreen('読込エラー: ' + e.message);
      return;
    }

    this.loop.start((dt) => this.frame(dt));
  }

  showLoadingScreen(msg) {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, 400, 320);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(msg, 200, 160);
  }

  frame(dt) {
    this.input.update();
    this.frameCount++;

    switch (this.state) {
      case 'title':
        this.updateTitle();
        this.drawTitle();
        break;
      case 'game':
        this.updateGame();
        this.drawGame();
        break;
      case 'battle':
        this.updateBattle();
        this.drawBattle();
        break;
      case 'menu':
        this.updateMenu();
        this.drawMenu();
        break;
    }
  }

  updateTitle() {
    if (this.input.isKeyDown('arrowup') || this.input.isKeyDown('arrowleft')) {
      this.titleCursor = 0;
    }
    if (this.input.isKeyDown('arrowdown') || this.input.isKeyDown('arrowright')) {
      this.titleCursor = 1;
    }
    if (this.input.isOK()) {
      this.audio.resume();
      if (this.titleCursor === 0) {
        this.state = 'game';
      } else {
        if (this.loadGame()) {
          this.state = 'game';
        }
      }
    }
  }

  drawTitle() {
    const ctx = this.ctx;
    // Blue gradient background (matching original CTitle.ClearSurface)
    for (let i = 0; i < 80; i++) {
      const c = i * 2 + 40;
      ctx.fillStyle = `rgb(${c},${c},255)`;
      ctx.fillRect(0, i * 4, 400, 4);
    }

    // Title text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('すいかが食べたい', 200, 80);

    // Subtitle
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#ddf';
    ctx.fillText('HTML5 Port', 200, 110);

    // Menu
    const menuY = 180;
    const items = ['初めから', '続きから'];
    ctx.font = '16px sans-serif';
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = i === this.titleCursor ? '#ff0' : '#fff';
      const prefix = i === this.titleCursor ? '▶ ' : '   ';
      ctx.fillText(prefix + items[i], 200, menuY + i * 30);
    }

    // Has save data indicator
    if (localStorage.getItem('suika_save')) {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#8f8';
      ctx.fillText('セーブデータあり', 200, 250);
    }

    // Credits
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('2002-2008 製作・著作 くろすけ', 200, 295);
  }

  updateGame() {
    // Shop takes priority
    if (this.shopUI && this.shopUI.visible) {
      this.shopUI.update();
      return;
    }

    // Battle result display
    if (this.battleResult) {
      if (this.input.isOK()) this.battleResult = null;
      return;
    }

    // Choice window takes priority
    if (this.choiceWindow.visible) {
      this.choiceWindow.update(this.input);
      return;
    }

    // Message window takes priority
    if (this.messageWindow.visible) {
      this.messageWindow.update(this.input.isOK());
      return;
    }

    // Don't process input while event is running
    if (this.eventRunning) return;

    // Player movement
    const dir = this.input.getDirection();
    if (dir !== DIR.NONE) {
      this.field.movePlayer(dir);
      // Random encounter check
      this.checkEncounter();
    }

    // Talk to NPC (Enter/Space/Touch OK)
    if (this.input.isOK()) {
      const result = this.field.tryTalk();
      if (result && result.event > 0 && result.event < 0xFFFF) {
        this.eventRunning = true;
        this.eventManager.run(result.event).then(() => {
          this.eventRunning = false;
        }).catch((e) => {
          console.warn('Event error:', e);
          this.eventRunning = false;
        });
      }
    }

    // Camera rotation (A/S keys or touch buttons)
    if (this.input.isKeyDown('a') || this.input.touchButtons['camL']) this.field.rotateCameraLeft();
    if (this.input.isKeyDown('s') || this.input.touchButtons['camR']) this.field.rotateCameraRight();

    // System menu (Z key or touch menu button)
    if (this.input.isKeyDown('z') || this.input.touchButtonDown['menu']) {
      this.menuCursor = 0;
      this.state = 'menu';
      return;
    }

    // Debug: B key to start test battle
    if (this.input.isKeyDown('b') && this.paramAll.parties.length > 0) {
      this.startBattle(0);
    }
  }

  checkEncounter() {
    if (!this.field.area || !this.field.area.enemies) return;
    if (this.playerParams.length === 0) return;

    const bx = MapData.getXBlock(this.field.playerPos.x);
    const bz = MapData.getZBlock(this.field.playerPos.z);

    for (const enc of this.field.area.enemies) {
      if (bx >= enc.xPos && bx < enc.xPos + enc.xSize &&
          bz >= enc.zPos && bz < enc.zPos + enc.zSize) {
        // Random chance based on rnd1/rnd2
        const chance = enc.rnd1 > 0 ? enc.rnd1 : 30;
        if (Math.floor(Math.random() * chance) === 0) {
          this.startBattle(enc.kind);
          return;
        }
      }
    }
  }

  startBattle(partyIndex) {
    if (partyIndex >= this.paramAll.parties.length) {
      console.warn('Invalid party index:', partyIndex);
      return;
    }
    if (this.playerParams.length === 0) {
      console.warn('No player params for battle');
      return;
    }
    this.battleEngine = new BattleEngine(this.paramAll);
    this.battleUI = new BattleUI(this.ctx, this.input, this.renderer, this.models, this.paramAll);

    // Set enemy model patterns from party data
    const party = this.paramAll.getParty(partyIndex);
    if (party) {
      const pats = party.enemies.map(e => {
        const prm = this.paramAll.getPrm(e.kind);
        return prm ? prm.pat : 0;
      });
      this.battleUI.setEnemyPats(pats);
    }

    // Setup inventory for battle (consumable items: kind=0)
    this.battleUI.inventory = [];
    for (let i = 0; i < this.paramAll.items.length; i++) {
      const item = this.paramAll.items[i];
      if (item.kind === 0 && item.name && item.name.trim()) {
        this.battleUI.inventory.push({ ...item, index: i });
        if (this.battleUI.inventory.length >= 10) break; // limit display
      }
    }

    this.battleEngine.onBattleEnd = (result, exp, gold) => {
      // Sync HP/MP back to playerParams after battle
      for (let i = 0; i < this.playerParams.length; i++) {
        const bUnit = this.battleEngine.players[i];
        if (bUnit) {
          this.playerParams[i].hp = bUnit.hp;
          this.playerParams[i].mp = bUnit.mp;
        }
      }
      // Apply EXP and check level-up
      const levelUps = [];
      if (result === BATTLE_RESULT.WIN && exp > 0) {
        this.gold = (this.gold || 0) + gold;
        for (const p of this.playerParams) {
          if (p.hp > 0) {
            const prevLv = p.lv;
            this.applyExp(p, exp);
            if (p.lv > prevLv) {
              levelUps.push({ name: p.name, prevLv, newLv: p.lv });
            }
          }
        }
      }
      // Return to field
      setTimeout(() => {
        this.state = 'game';
        this.battleEngine = null;
        this.battleUI = null;
        // Show result screen for wins
        if (result === BATTLE_RESULT.WIN) {
          this.battleResult = { exp, gold, levelUps };
        }
      }, 800);
    };

    this.battleEngine.onDamage = (target, dmg) => {
      if (this.battleUI) {
        // Position damage number near the target
        const idx = target.index;
        const total = target.isPlayer ? this.playerParams.length : this.battleEngine.enemies.length;
        const spacing = target.isPlayer ? 85 : 70;
        const startX = target.isPlayer ? 180 : 200 - (total - 1) * spacing / 2;
        const x = startX + idx * spacing;
        const y = target.isPlayer ? 260 : 90;
        this.battleUI.effect.addDamageNum(String(dmg), x, y, target.isPlayer ? '#f44' : '#ff0');
      }
    };

    this.battleEngine.start(partyIndex, this.playerParams);
    this.state = 'battle';
  }

  updateBattle() {
    if (!this.battleEngine || !this.battleUI) return;
    const bState = this.battleEngine.getState();

    if (bState.state === 'playerTurn') {
      const action = this.battleUI.update(bState);
      if (action) {
        this.battleEngine.doPlayerCommand(action.cmd, action.target, action.extra);
        this.battleUI.reset();
      }
    }
  }

  drawBattle() {
    if (!this.battleEngine || !this.battleUI) return;
    const bState = this.battleEngine.getState();
    this.battleUI.draw(bState);
  }

  drawGame() {
    this.field.draw();

    // Shop overlay
    if (this.shopUI && this.shopUI.visible) {
      this.shopUI.draw();
      return;
    }

    // Battle result overlay
    if (this.battleResult) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillRect(0, 0, 400, 320);
      this.ctx.fillStyle = 'rgba(0,0,60,0.9)';
      this.ctx.fillRect(60, 60, 280, 200);
      this.ctx.strokeStyle = '#88f';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(60, 60, 280, 200);

      this.ctx.fillStyle = '#ff0';
      this.ctx.font = 'bold 16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('勝利！', 200, 90);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = '13px sans-serif';
      this.ctx.fillText(`EXP: ${this.battleResult.exp}  Gold: ${this.battleResult.gold}`, 200, 120);

      let y = 145;
      for (const lu of this.battleResult.levelUps) {
        this.ctx.fillStyle = '#8f8';
        this.ctx.fillText(`${lu.name} Lv${lu.prevLv}→${lu.newLv}!`, 200, y);
        y += 20;
      }

      this.ctx.fillStyle = '#aaa';
      this.ctx.font = '11px sans-serif';
      this.ctx.fillText('Press Enter', 200, 240);
      return;
    }

    // Message window (on top of everything)
    this.messageWindow.draw();
    this.choiceWindow.draw();

    // Fade overlay
    if (this.fadeAlpha > 0.01) {
      this.ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
      this.ctx.fillRect(0, 0, 400, 320);
    }

    // HUD overlay
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    // Player status mini-HUD
    if (this.playerParams.length > 0 && !this.messageWindow.visible) {
      const p = this.playerParams[0];
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(2, 2, 130, 36);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '9px monospace';
      this.ctx.fillText(`${p.name} Lv${p.lv}`, 6, 12);
      this.ctx.fillText(`HP:${p.hp}/${p.maxHP} MP:${p.mp}/${p.maxMP}`, 6, 23);
      this.ctx.fillText(`G:${this.gold || 0}`, 6, 34);
    }
    if (!this.messageWindow.visible) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      this.ctx.fillRect(2, 306, 396, 14);
      this.ctx.fillStyle = '#aaa';
      this.ctx.font = '9px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('矢印:移動 A/S:カメラ Enter:話す B:戦闘テスト', 200, 316);
    }
  }

  // Level-up system (uses prmUps data from param._da)
  applyExp(player, exp) {
    const prevLv = player.lv;
    player.exp = (player.exp || 0) + exp;

    // EXP thresholds: simplified curve (100 * lv^1.5)
    while (true) {
      const nextLvExp = Math.floor(100 * Math.pow(player.lv, 1.5));
      if (player.exp < nextLvExp) break;
      if (player.lv >= 99) break;

      player.exp -= nextLvExp;
      player.lv++;

      // Apply stat growth from prmUps table
      const upIdx = Math.min(player.lv - 2, this.paramAll.prmUps.length - 1);
      if (upIdx >= 0 && upIdx < this.paramAll.prmUps.length) {
        const up = this.paramAll.prmUps[upIdx];
        player.maxHP += up.hp + Math.floor(Math.random() * (up.hps + 1));
        player.maxMP += up.mp;
        player.str += up.str;
        player.int_ += up.int_;
        player.def += up.def;
        player.agi += up.agi;
        player.dex += up.dex;
      } else {
        // Fallback growth
        player.maxHP += 5 + Math.floor(Math.random() * 5);
        player.maxMP += 2;
        player.str += 1;
        player.def += 1;
        player.agi += 1;
      }

      // Full heal on level up
      player.hp = player.maxHP;
      player.mp = player.maxMP;
    }

    if (player.lv > prevLv) {
      console.log(`${player.name} Lv${prevLv}→${player.lv}!`);
    }
  }

  // --- System Menu ---
  updateMenu() {
    const items = ['ステータス', 'セーブ', 'タイトルへ', '閉じる'];
    if (this.input.isKeyDown('arrowup')) {
      this.menuCursor = (this.menuCursor - 1 + items.length) % items.length;
    }
    if (this.input.isKeyDown('arrowdown')) {
      this.menuCursor = (this.menuCursor + 1) % items.length;
    }
    if (this.input.isOK()) {
      switch (this.menuCursor) {
        case 0: break; // Status shown in draw
        case 1: this.saveGame(); this.state = 'game'; break;
        case 2: this.state = 'title'; this.titleCursor = 0; break;
        case 3: this.state = 'game'; break;
      }
    }
    if (this.input.isCancel() || this.input.isKeyDown('z')) {
      this.state = 'game';
    }
  }

  drawMenu() {
    const ctx = this.ctx;
    // Draw field behind
    this.field.draw();

    // Darken
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, 400, 320);

    // Menu panel
    const mx = 20, my = 20, mw = 140, mh = 120;
    ctx.fillStyle = 'rgba(0,0,60,0.92)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#88f';
    ctx.lineWidth = 2;
    ctx.strokeRect(mx, my, mw, mh);

    const items = ['ステータス', 'セーブ', 'タイトルへ', '閉じる'];
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = i === this.menuCursor ? '#ff0' : '#fff';
      const prefix = i === this.menuCursor ? '▶' : '  ';
      ctx.fillText(prefix + items[i], mx + 10, my + 24 + i * 24);
    }

    // Status panel (right side)
    const sx = 170, sy = 20, sw = 210, sh = 280;
    ctx.fillStyle = 'rgba(0,0,60,0.92)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#88f';
    ctx.strokeRect(sx, sy, sw, sh);

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    let py = sy + 18;
    for (let i = 0; i < this.playerParams.length; i++) {
      const p = this.playerParams[i];
      ctx.fillStyle = '#ff0';
      ctx.fillText(`${p.name}  Lv${p.lv}`, sx + 10, py);
      py += 16;
      ctx.fillStyle = '#fff';
      ctx.fillText(`HP:${p.hp}/${p.maxHP}  MP:${p.mp}/${p.maxMP}`, sx + 10, py);
      py += 14;
      ctx.fillStyle = '#ccc';
      ctx.font = '10px monospace';
      ctx.fillText(`STR:${p.str} INT:${p.int_} DEF:${p.def}`, sx + 10, py);
      py += 13;
      ctx.fillText(`AGI:${p.agi} DEX:${p.dex} EXP:${p.exp||0}`, sx + 10, py);
      py += 20;
      ctx.font = '11px sans-serif';
    }
    // Gold
    ctx.fillStyle = '#fd0';
    ctx.fillText(`所持金: ${this.gold || 0} G`, sx + 10, py + 5);
  }

  // --- Save / Load ---
  saveGame() {
    const data = {
      playerParams: this.playerParams.map(p => ({
        index: p.index, name: p.name, lv: p.lv, hp: p.hp, maxHP: p.maxHP,
        mp: p.mp, maxMP: p.maxMP, str: p.str, int_: p.int_, def: p.def,
        agi: p.agi, dex: p.dex, exp: p.exp, pat: p.pat, algo: p.algo,
        abi1: p.abi1, abi2: p.abi2,
      })),
      gold: this.gold || 0,
      area: this.currentArea,
      px: this.field.playerPos.x,
      pz: this.field.playerPos.z,
      pvect: this.playerVect,
      flags: [...this.eventManager.flags],
      inventory: this.eventManager.inventory,
    };
    localStorage.setItem('suika_save', JSON.stringify(data));
    console.log('Game saved');
  }

  loadGame() {
    const raw = localStorage.getItem('suika_save');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      // Restore player params
      this.playerParams = data.playerParams.map(d => {
        const p = this.paramAll.chrParams[d.index] ? this.paramAll.chrParams[d.index].clone() : new (Object.getPrototypeOf(this.paramAll.chrParams[0]).constructor)(d.index);
        Object.assign(p, d);
        p.isPlayer = true;
        // Restore getter methods
        p.getStr = () => Math.max(1, p.str);
        p.getDef = () => p.def;
        p.getInt = () => p.int_;
        p.getAgi = () => p.agi;
        p.getDex = () => p.dex;
        p.getMaxHP = () => p.maxHP;
        p.getMaxMP = () => p.maxMP;
        return p;
      });
      this.gold = data.gold || 0;
      this.eventManager.flags = new Set(data.flags || []);
      this.eventManager.inventory = data.inventory || [];
      this.eventManager.gold = this.gold;

      // Restore area
      if (data.area < this.stageManager.stages.length) {
        const area = this.stageManager.stages[data.area];
        this.field.setArea(area);
        this.field.area = area;
        this.currentArea = data.area;
        this.field.playerPos.x = data.px;
        this.field.playerPos.z = data.pz;
      }
      this.field.eventFlags = this.eventManager.flags;
      console.log('Game loaded');
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }
}

const game = new SuikaGame();
game.init();

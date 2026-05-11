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
import { Credits } from './engine/credits.js';
import { PasswordSystem } from './engine/password.js';
import { QuizUI } from './engine/quiz.js';
import { ComposeShop } from './engine/compose.js';

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
    this.equipMenu = null; // equipment sub-state
    this.gameOverTimer = 0;
    this.credits = new Credits(this.ctx);
    this.passwordSystem = new PasswordSystem();
    this.quizUI = new QuizUI(this.ctx, this.input);
    this.composeShop = null;
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
        // Setup initial player party (only protagonist at start, matching original)
        if (this.paramAll.chrParams.length >= 1) {
          const p0 = this.paramAll.chrParams[0].clone();
          p0.isPlayer = true;
          p0.equip = [-1, -1, -1, -1, -1];
          this.playerParams = [p0];
        }
        // Initial gold (matching original: 1000G)
        this.gold = 1000;
        // Initial items: 3x item[1] (healing herb)
        this.eventManager.inventory = [1, 1, 1];
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
      this.eventManager.posCallback = (chr, x, z) => {
        if (chr === 0 || chr === 98) {
          // Player teleport
          if (x !== 255) this.field.playerPos.x = MapData.getXPos(x);
          if (z !== 255) this.field.playerPos.z = MapData.getZPos(z);
        }
      };
      this.eventManager.moveCallback = (chr, speed, algo, move) => {
        if (chr > 0 && chr < 99 && this.field.area) {
          const npcIdx = chr - 3; // NPC indices start at 3 in original
          if (npcIdx >= 0 && npcIdx < this.field.area.npcs.length) {
            const npc = this.field.area.npcs[npcIdx];
            let tx = npc.xPos, tz = npc.zPos;
            const dist = move || 1;
            switch (algo) {
              case 0: tz -= dist; break;
              case 1: tx += dist; break;
              case 2: tz += dist; break;
              case 3: tx -= dist; break;
              case 4: {
                const px = MapData.getXBlock(this.field.playerPos.x);
                const pz = MapData.getZBlock(this.field.playerPos.z);
                if (Math.abs(px - npc.xPos) > Math.abs(pz - npc.zPos)) {
                  tx += px > npc.xPos ? dist : -dist;
                } else {
                  tz += pz > npc.zPos ? dist : -dist;
                }
                break;
              }
            }
            this.field.startNpcMove(npcIdx, tx, tz, speed);
          }
        }
      };
      this.eventManager.vectCallback = (chr, vect) => {
        if (chr === 0 || chr === 98) {
          this.field.playerVect = vect * (Math.PI / 2);
        }
      };
      this.eventManager.creditsCallback = async () => {
        this.credits.start();
        // Wait for credits to finish
        await new Promise(resolve => {
          const check = setInterval(() => {
            if (!this.credits.active) { clearInterval(check); resolve(); }
          }, 100);
        });
      };
      this.eventManager.gameOverCallback = () => {
        this.gameOverTimer = 0;
        this.state = 'gameover';
      };
      this.eventManager.partyCallback = (chr, join) => {
        // Add/remove party member (simplified)
        if (join && chr < this.paramAll.chrParams.length && this.playerParams.length < 3) {
          const exists = this.playerParams.find(p => p.index === chr);
          if (!exists) {
            const p = this.paramAll.chrParams[chr].clone();
            p.isPlayer = true;
            this.playerParams.push(p);
          }
        }
      };
      this.eventManager.posQueryCallback = (chr, axis) => {
        // Return block position of character
        if (chr === 0 || chr === 98) {
          return axis === 0 ? MapData.getXBlock(this.field.playerPos.x) : MapData.getZBlock(this.field.playerPos.z);
        }
        return 0;
      };
      this.eventManager.hitCheckCallback = (x, z) => {
        if (!this.field.area) return false;
        const map = this.field.area.map;
        if (x >= map.xNum || z >= map.zNum) return false;
        return map.hit[map.getPtr(x, z)] > 0;
      };
      this.eventManager.quizCallback = async (difficulty) => {
        const passed = await this.quizUI.start(difficulty);
        if (passed) {
          this.eventManager.resetFlag(303);
          this.eventManager.setFlag(304);
        } else {
          this.eventManager.setFlag(303);
          this.eventManager.resetFlag(304);
        }
      };
      this.eventManager.numberCallback = async (start) => {
        // Number selection — use choice callback with numbers
        if (this.choiceCallback) {
          // Simplified: show as yes/no with the number
          return 0;
        }
        return 0;
      };
      this.eventManager.ambientCallback = (r, g, b) => {
        this.renderer.setAmbient({ r, g, b, limits() {} });
        this.renderer.ambPowR = r / 255;
        this.renderer.ambPowG = g / 255;
        this.renderer.ambPowB = b / 255;
      };
      this.eventManager.lightCallback = (r, g, b) => {
        this.renderer.setRenderState(10, { r, g, b, clone() { return { r, g, b }; }, limits() {} });
      };
      this.eventManager.compShopCallback = async () => {
        this.composeShop = new ComposeShop(this.ctx, this.input, this.paramAll);
        const result = await this.composeShop.open(this.gold || 0, this.eventManager.inventory);
        this.gold = result.gold;
        this.eventManager.inventory = result.inventory;
        this.composeShop = null;
      };

      // Setup field with first area
      this.field = new Field(this.renderer, this.models);
      this.field.eventFlags = this.eventManager.flags; // Share flags for ifFlag checks
      this.field.onAreaChange = (areaIdx, x, z, rot) => {
        if (areaIdx < this.stageManager.stages.length) {
          const area = this.stageManager.stages[areaIdx];
          this.field.changeArea(area, x, z, rot);
          this.currentArea = areaIdx;
          // Auto-save on area change
          this.saveGame(true);
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
        // Start at area 0, position (16, 35) — matching original CInitGame
        let areaIdx = 0;
        const area = this.stageManager.stages[areaIdx];
        this.field.setArea(area);
        this.currentArea = areaIdx;
        this.field.playerPos.x = MapData.getXPos(16);
        this.field.playerPos.z = MapData.getZPos(35);
        this.field.playerVect = 0; // facing north
      }

      this.showLoadingScreen('読み込み完了！');
      this.state = 'title';
      // Default to "続きから" if save data exists
      this.titleCursor = localStorage.getItem('suika_save') ? 1 : 0;
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
      case 'gameover':
        this.updateGameOver();
        this.drawGameOver();
        break;
      case 'worldmap':
        this.updateWorldMap();
        this.drawWorldMap();
        break;
      case 'credits':
        this.credits.update(this.input);
        this.credits.draw();
        if (!this.credits.active) this.state = 'title';
        break;
    }
  }

  updateTitle() {
    if (this.input.isKeyDown('arrowup') || this.input.isKeyDown('arrowleft')) {
      this.titleCursor = (this.titleCursor - 1 + 3) % 3;
    }
    if (this.input.isKeyDown('arrowdown') || this.input.isKeyDown('arrowright')) {
      this.titleCursor = (this.titleCursor + 1) % 3;
    }
    if (this.input.isOK()) {
      this.audio.resume();
      if (this.titleCursor === 0) {
        // New game — reset to initial state
        this.resetNewGame();
        this.state = 'game';
      } else if (this.titleCursor === 1) {
        if (this.loadGame()) {
          this.state = 'game';
        }
      } else if (this.titleCursor === 2) {
        // Password input
        const pw = prompt('復活の呪文を入力してください:');
        if (pw) {
          const data = this.passwordSystem.load(pw);
          if (data) {
            this.loadFromPassword(data);
            this.state = 'game';
          } else {
            alert('復活の呪文が違います');
          }
        }
      }
    }
  }

  loadFromPassword(data) {
    // Apply password data to game state
    if (data.characters && data.characters.length >= 3) {
      for (let i = 0; i < Math.min(3, data.characters.length); i++) {
        const chr = data.characters[i];
        const p = this.playerParams[i];
        if (!p) continue;
        p.lv = chr.lv || 1;
        p.hp = chr.hp; p.maxHP = chr.maxHP;
        p.mp = chr.mp; p.maxMP = chr.maxMP;
        p.str = chr.str; p.int_ = chr.int_;
        p.def = chr.def; p.agi = chr.agi; p.dex = chr.dex;
        p.exp = chr.exp || 0;
        p.equip = chr.equip || [-1,-1,-1,-1,-1];
      }
    }
    if (data.playerName) this.playerParams[0].name = data.playerName;
    this.gold = data.gold || 0;
    this.eventManager.inventory = data.items || [];
    this.eventManager.flags = new Set(data.flags || []);
    this.field.eventFlags = this.eventManager.flags;

    // Restore area
    if (data.areaNo !== undefined && data.areaNo < this.stageManager.stages.length) {
      const area = this.stageManager.stages[data.areaNo];
      this.field.setArea(area);
      this.currentArea = data.areaNo;
      if (data.areaX !== undefined) this.field.playerPos.x = MapData.getXPos(data.areaX);
      if (data.areaZ !== undefined) this.field.playerPos.z = MapData.getZPos(data.areaZ);
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
    const menuY = 170;
    const items = ['初めから', '続きから', '復活の呪文'];
    ctx.font = '16px sans-serif';
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = i === this.titleCursor ? '#ff0' : '#fff';
      const prefix = i === this.titleCursor ? '▶ ' : '   ';
      ctx.fillText(prefix + items[i], 200, menuY + i * 28);
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
    // Compose shop takes priority
    if (this.composeShop && this.composeShop.visible) {
      this.composeShop.update();
      return;
    }

    // Quiz takes priority
    if (this.quizUI.active) {
      this.quizUI.update();
      return;
    }

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
        // Game over on loss
        if (result === BATTLE_RESULT.LOSE) {
          this.gameOverTimer = 0;
          this.state = 'gameover';
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

    // Compose shop overlay
    if (this.composeShop && this.composeShop.visible) {
      this.composeShop.draw();
      return;
    }

    // Quiz overlay
    if (this.quizUI.active) {
      this.quizUI.draw();
      return;
    }

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
    const items = ['ステータス', '装備', 'マップ', 'セーブ', 'タイトルへ', '閉じる'];

    // Equipment sub-menu
    if (this.equipMenu) {
      this.updateEquipMenu();
      return;
    }

    if (this.input.isKeyDown('arrowup')) {
      this.menuCursor = (this.menuCursor - 1 + items.length) % items.length;
    }
    if (this.input.isKeyDown('arrowdown')) {
      this.menuCursor = (this.menuCursor + 1) % items.length;
    }
    if (this.input.isOK()) {
      switch (this.menuCursor) {
        case 0: break; // Status shown in draw
        case 1: this.equipMenu = { chrIdx: 0, slot: 0, phase: 'chr' }; break;
        case 2: this.state = 'worldmap'; break;
        case 3: this.saveGame(); this.state = 'game'; break;
        case 4: this.state = 'title'; this.titleCursor = 0; break;
        case 5: this.state = 'game'; break;
      }
    }
    if (this.input.isCancel() || this.input.isKeyDown('z')) {
      this.state = 'game';
    }
  }

  updateEquipMenu() {
    const eq = this.equipMenu;
    if (eq.phase === 'chr') {
      // Select character
      if (this.input.isKeyDown('arrowup')) eq.chrIdx = (eq.chrIdx - 1 + this.playerParams.length) % this.playerParams.length;
      if (this.input.isKeyDown('arrowdown')) eq.chrIdx = (eq.chrIdx + 1) % this.playerParams.length;
      if (this.input.isOK()) { eq.phase = 'slot'; eq.slot = 0; }
      if (this.input.isCancel()) { this.equipMenu = null; }
    } else if (eq.phase === 'slot') {
      // Select equipment slot (weapon/armor/shield/acc1/acc2)
      const slots = ['武器', '防具', '盾', '装飾1', '装飾2'];
      if (this.input.isKeyDown('arrowup')) eq.slot = (eq.slot - 1 + slots.length) % slots.length;
      if (this.input.isKeyDown('arrowdown')) eq.slot = (eq.slot + 1) % slots.length;
      if (this.input.isOK()) { eq.phase = 'item'; eq.itemCursor = 0; }
      if (this.input.isCancel()) { eq.phase = 'chr'; }
    } else if (eq.phase === 'item') {
      // Select item to equip from inventory
      const slotKind = eq.slot + 1; // kind: 1=weapon, 2=armor, 3=shield, 4=acc
      const equippable = this.eventManager.inventory
        .map((idx, i) => ({ invIdx: i, item: this.paramAll.getItem(idx), idx }))
        .filter(e => e.item && e.item.kind === slotKind);
      equippable.unshift({ invIdx: -1, item: { name: 'はずす' }, idx: -1 }); // unequip option

      if (equippable.length === 0) { eq.phase = 'slot'; return; }
      if (eq.itemCursor >= equippable.length) eq.itemCursor = equippable.length - 1;
      if (this.input.isKeyDown('arrowup')) eq.itemCursor = (eq.itemCursor - 1 + equippable.length) % equippable.length;
      if (this.input.isKeyDown('arrowdown')) eq.itemCursor = (eq.itemCursor + 1) % equippable.length;
      if (this.input.isOK()) {
        const selected = equippable[eq.itemCursor];
        const p = this.playerParams[eq.chrIdx];
        if (!p.equip) p.equip = [-1, -1, -1, -1, -1];
        // Unequip current
        const oldEquip = p.equip[eq.slot];
        if (oldEquip >= 0) {
          this.unapplyEquip(p, oldEquip);
          this.eventManager.inventory.push(oldEquip);
        }
        // Equip new
        if (selected.idx >= 0) {
          p.equip[eq.slot] = selected.idx;
          this.applyEquip(p, selected.idx);
          // Remove from inventory
          const invPos = this.eventManager.inventory.indexOf(selected.idx);
          if (invPos >= 0) this.eventManager.inventory.splice(invPos, 1);
        } else {
          p.equip[eq.slot] = -1;
        }
        eq.phase = 'slot';
      }
      if (this.input.isCancel()) { eq.phase = 'slot'; }
    }
  }

  applyEquip(player, itemIdx) {
    const item = this.paramAll.getItem(itemIdx);
    if (!item) return;
    player.str += item.str;
    player.int_ += item.int_;
    player.def += item.def;
    player.agi += item.agi;
    player.dex += item.dex;
  }

  unapplyEquip(player, itemIdx) {
    const item = this.paramAll.getItem(itemIdx);
    if (!item) return;
    player.str -= item.str;
    player.int_ -= item.int_;
    player.def -= item.def;
    player.agi -= item.agi;
    player.dex -= item.dex;
  }

  drawMenu() {
    const ctx = this.ctx;
    this.field.draw();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, 400, 320);

    // Menu panel
    const mx = 10, my = 10, mw = 110, mh = 160;
    ctx.fillStyle = 'rgba(0,0,60,0.92)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#88f';
    ctx.lineWidth = 2;
    ctx.strokeRect(mx, my, mw, mh);

    const items = ['ステータス', '装備', 'マップ', 'セーブ', 'タイトルへ', '閉じる'];
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = i === this.menuCursor ? '#ff0' : '#fff';
      const prefix = i === this.menuCursor ? '▶' : '  ';
      ctx.fillText(prefix + items[i], mx + 6, my + 20 + i * 22);
    }

    // Equipment sub-menu overlay
    if (this.equipMenu) {
      this.drawEquipMenu(ctx);
      return;
    }

    // Status panel (right side)
    const sx = 130, sy = 10, sw = 260, sh = 300;
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
      py += 15;
      ctx.fillStyle = '#fff';
      ctx.fillText(`HP:${p.hp}/${p.maxHP}  MP:${p.mp}/${p.maxMP}`, sx + 10, py);
      py += 14;
      ctx.fillStyle = '#ccc';
      ctx.font = '10px monospace';
      ctx.fillText(`STR:${p.str} INT:${p.int_} DEF:${p.def}`, sx + 10, py);
      py += 13;
      ctx.fillText(`AGI:${p.agi} DEX:${p.dex} EXP:${p.exp||0}`, sx + 10, py);
      py += 13;
      // Show equipment
      if (p.equip) {
        const slotNames = ['武', '防', '盾', '飾', '飾'];
        let eqStr = '';
        for (let s = 0; s < 5; s++) {
          if (p.equip[s] >= 0) {
            const it = this.paramAll.getItem(p.equip[s]);
            eqStr += `${slotNames[s]}:${it ? it.name.trim().slice(0,4) : '?'} `;
          }
        }
        if (eqStr) { ctx.fillStyle = '#8cf'; ctx.fillText(eqStr, sx + 10, py); py += 13; }
      }
      py += 10;
      ctx.font = '11px sans-serif';
    }
    ctx.fillStyle = '#fd0';
    ctx.fillText(`所持金: ${this.gold || 0} G`, sx + 10, py + 5);
  }

  drawEquipMenu(ctx) {
    const eq = this.equipMenu;
    const sx = 130, sy = 10, sw = 260, sh = 300;
    ctx.fillStyle = 'rgba(0,0,60,0.95)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#8af';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';

    if (eq.phase === 'chr') {
      ctx.fillStyle = '#adf';
      ctx.fillText('装備するキャラを選択:', sx + 10, sy + 20);
      for (let i = 0; i < this.playerParams.length; i++) {
        ctx.fillStyle = i === eq.chrIdx ? '#ff0' : '#fff';
        ctx.fillText((i === eq.chrIdx ? '▶' : '  ') + this.playerParams[i].name, sx + 10, sy + 42 + i * 22);
      }
    } else if (eq.phase === 'slot') {
      const p = this.playerParams[eq.chrIdx];
      ctx.fillStyle = '#ff0';
      ctx.fillText(`${p.name} の装備:`, sx + 10, sy + 20);
      const slots = ['武器', '防具', '盾', '装飾1', '装飾2'];
      for (let i = 0; i < slots.length; i++) {
        ctx.fillStyle = i === eq.slot ? '#ff0' : '#fff';
        const equipped = (p.equip && p.equip[i] >= 0) ? this.paramAll.getItem(p.equip[i]) : null;
        const eqName = equipped ? equipped.name.trim() : 'なし';
        ctx.fillText((i === eq.slot ? '▶' : '  ') + `${slots[i]}: ${eqName}`, sx + 10, sy + 42 + i * 22);
      }
    } else if (eq.phase === 'item') {
      const slotKind = eq.slot + 1;
      const equippable = this.eventManager.inventory
        .map((idx, i) => ({ invIdx: i, item: this.paramAll.getItem(idx), idx }))
        .filter(e => e.item && e.item.kind === slotKind);
      equippable.unshift({ invIdx: -1, item: { name: 'はずす' }, idx: -1 });

      ctx.fillStyle = '#adf';
      ctx.fillText('装備するアイテム:', sx + 10, sy + 20);
      const maxShow = 10;
      const startIdx = Math.max(0, (eq.itemCursor || 0) - maxShow + 1);
      for (let i = 0; i < maxShow && startIdx + i < equippable.length; i++) {
        const idx = startIdx + i;
        const e = equippable[idx];
        ctx.fillStyle = idx === eq.itemCursor ? '#ff0' : '#fff';
        ctx.fillText((idx === eq.itemCursor ? '▶' : '  ') + (e.item.name || '').trim(), sx + 10, sy + 42 + i * 20);
      }
    }
  }

  // --- Game Over ---
  updateGameOver() {
    this.gameOverTimer++;
    if (this.gameOverTimer > 90 && this.input.isOK()) {
      this.state = 'title';
      this.titleCursor = 1; // default to "continue"
    }
  }

  drawGameOver() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 400, 320);

    const t = Math.min(1, this.gameOverTimer / 32);
    const alpha = Math.floor(t * 255);

    // Animated lines (matching original)
    ctx.strokeStyle = `rgba(255,255,255,${t})`;
    ctx.lineWidth = 1;
    const lineProgress = Math.min(1, this.gameOverTimer / 32);
    ctx.beginPath();
    ctx.moveTo(50, 128);
    ctx.lineTo(50 + 300 * lineProgress, 128);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(350 - 300 * lineProgress, 176);
    ctx.lineTo(350, 176);
    ctx.stroke();

    // GAME OVER text
    const textAlpha = this.gameOverTimer < 32 ? t : (this.gameOverTimer > 96 ? Math.max(0, 1 - (this.gameOverTimer - 96) / 32) : 1);
    ctx.fillStyle = `rgba(255,255,255,${textAlpha})`;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ＧＡＭＥ　ＯＶＥＲ', 200, 160);

    if (this.gameOverTimer > 90) {
      ctx.fillStyle = '#aaa';
      ctx.font = '12px sans-serif';
      ctx.fillText('Press Enter', 200, 260);
    }
  }

  // --- World Map ---
  updateWorldMap() {
    if (this.input.isOK() || this.input.isCancel()) {
      this.state = 'menu';
    }
  }

  drawWorldMap() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 400, 320);

    // Draw world map image (image31 is the map in original)
    if (this.images[31]) {
      ctx.drawImage(this.images[31], 44, 14);
    } else {
      // Fallback: draw a simple map representation
      ctx.fillStyle = '#1a3a1a';
      ctx.fillRect(44, 14, 312, 292);
      ctx.strokeStyle = '#4a8a4a';
      ctx.lineWidth = 1;
      // Draw grid
      for (let x = 0; x < 8; x++) {
        for (let z = 0; z < 8; z++) {
          ctx.strokeRect(44 + x * 39, 14 + z * 36, 39, 36);
        }
      }
    }

    // Draw player position (blinking red dot)
    const area = this.field.area;
    if (area && area.worldMapX !== 65535 && area.worldMapZ !== 65535) {
      const blink = (this.frameCount & 4) ? 1 : 0;
      ctx.fillStyle = blink ? '#f00' : '#fff';
      const mapX = 60 + (area.worldMapX - 3) * 4;
      const mapZ = 30 + (area.worldMapZ - 4) * 4;
      ctx.fillRect(mapX, mapZ, 6, 6);
    }

    // Title
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 400, 14);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ワールドマップ (Enter/Xで閉じる)', 200, 11);
  }

  // --- Save / Load ---

  resetNewGame() {
    // Reset to initial game state (matching original CInitGame)
    if (this.paramAll.chrParams.length >= 1) {
      const p0 = this.paramAll.chrParams[0].clone();
      p0.isPlayer = true;
      p0.equip = [-1, -1, -1, -1, -1];
      this.playerParams = [p0];
    }
    this.gold = 1000;
    this.eventManager.flags = new Set();
    this.eventManager.inventory = [1, 1, 1]; // 3x healing herb
    this.eventManager.gold = 1000;
    this.field.eventFlags = this.eventManager.flags;

    // Start at area 0, position (16, 35)
    if (this.stageManager.stages.length > 0) {
      const area = this.stageManager.stages[0];
      this.field.setArea(area);
      this.currentArea = 0;
      this.field.playerPos.x = MapData.getXPos(16);
      this.field.playerPos.z = MapData.getZPos(35);
      this.field.playerVect = 0;
      this.field.cameraVect = Math.PI;
    }
    this.battleResult = null;
    this.fadeAlpha = 0;
  }

  saveGame(silent = false) {
    const data = {
      playerParams: this.playerParams.map(p => ({
        index: p.index, name: p.name, lv: p.lv, hp: p.hp, maxHP: p.maxHP,
        mp: p.mp, maxMP: p.maxMP, str: p.str, int_: p.int_, def: p.def,
        agi: p.agi, dex: p.dex, exp: p.exp, pat: p.pat, algo: p.algo,
        abi1: p.abi1, abi2: p.abi2, equip: p.equip || [-1,-1,-1,-1,-1],
      })),
      gold: this.gold || 0,
      area: this.currentArea,
      px: this.field.playerPos.x,
      pz: this.field.playerPos.z,
      pvect: this.field.playerVect,
      flags: [...this.eventManager.flags],
      inventory: this.eventManager.inventory,
    };
    localStorage.setItem('suika_save', JSON.stringify(data));
    if (!silent && this.messageWindow) this.messageWindow.show('セーブしました');
  }

  loadGame() {
    const raw = localStorage.getItem('suika_save');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      this.playerParams = data.playerParams.map(d => {
        const p = this.paramAll.chrParams[d.index] ? this.paramAll.chrParams[d.index].clone() : new (Object.getPrototypeOf(this.paramAll.chrParams[0]).constructor)(d.index);
        Object.assign(p, d);
        p.isPlayer = true;
        p.getStr = () => Math.max(1, p.str);
        p.getDef = () => p.def;
        p.getInt = () => p.int_;
        p.getAgi = () => p.agi;
        p.getDex = () => p.dex;
        p.getMaxHP = () => p.maxHP;
        p.getMaxMP = () => p.maxMP;
        if (!p.equip) p.equip = [-1,-1,-1,-1,-1];
        return p;
      });
      this.gold = data.gold || 0;
      this.eventManager.flags = new Set(data.flags || []);
      this.eventManager.inventory = data.inventory || [];
      this.eventManager.gold = this.gold;

      if (data.area < this.stageManager.stages.length) {
        const area = this.stageManager.stages[data.area];
        this.field.setArea(area);
        this.field.area = area;
        this.currentArea = data.area;
        this.field.playerPos.x = data.px;
        this.field.playerPos.z = data.pz;
        if (data.pvect !== undefined) this.field.playerVect = data.pvect;
      }
      this.field.eventFlags = this.eventManager.flags;
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }
}

const game = new SuikaGame();
game.init();

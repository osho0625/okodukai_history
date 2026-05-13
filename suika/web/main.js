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

const SUIKA_VERSION = 'v0.5.4';

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
    this.messageWindow.onAdvance = () => { this.audio.play(5); }; // text tick SE
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
    this.equipMenu = null;
    this.gemMenu = null;
    this.itemMenu = null; // equipment sub-state
    this.gameOverTimer = 0;
    this.credits = new Credits(this.ctx);
    this.passwordSystem = new PasswordSystem();
    this.quizUI = new QuizUI(this.ctx, this.input);
    this.composeShop = null;
    this.openingFrame = 0;
    this._titleDirHeld = false;
    this.quakeFrames = 0;
    this.battleFlash = 0;
    this.playTime = 0; // seconds
    this._lastTime = Date.now();
    // Battle speed setting: 0=slow(1200/1600ms), 1=normal(600/800ms), 2=fast(300/400ms), 3=instant(50/100ms)
    this.battleSpeed = parseInt(localStorage.getItem('suika_battle_speed') || '0');
    // Encounter rate: 0=off, 1=low, 2=normal, 3=high
    this.encounterRate = parseInt(localStorage.getItem('suika_encounter_rate') || '1');
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
        // Override item[1] (いちご): no ATK bonus, small DEX bonus only
        const ichigo = this.paramAll.getItem(1);
        if (ichigo) {
          ichigo.str = 0;
          ichigo.dex = 2; // small evasion boost
        }
        // Setup initial player party (only protagonist at start, matching original)
        if (this.paramAll.chrParams.length >= 1) {
          const p0 = this.paramAll.chrParams[0].clone();
          p0.isPlayer = true;
          p0.equip = [-1, -1, -1, -1, -1];
          this.playerParams = [p0];
        }
        // Initial gold (matching original: 1000G)
        this.gold = 1000;
        // No initial items (いちご is obtained from NPC in town)
        this.eventManager.inventory = [];
      } catch (e) {
        console.warn('Param data load failed:', e.message);
      }

      // Load audio (non-blocking, don't fail if unavailable)
      this.audio.init();
      this.audio.loadAll(this.loader.baseUrl, 30).catch(() => {});

      // Wire up message callback
      this.eventManager.messageCallback = (text) => this.messageWindow.show(text);
      this.eventManager.closeWindowCallback = () => this.messageWindow.close();
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
      this.eventManager.shopCallback = async (itemIndices, shopName) => {
        this.shopUI = new ShopUI(this.ctx, this.input, this.paramAll);
        const result = await this.shopUI.open(shopName || 'お店', itemIndices, this.gold || 0, this.eventManager.inventory);
        this.gold = result.gold;
        this.eventManager.inventory = result.inventory;
        this.eventManager.gold = this.gold;
        this.shopUI = null;
        // Clear input state to prevent stale key presses from affecting field
        this.input.update();
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
        if (join && chr < this.paramAll.chrParams.length && this.playerParams.length < 3) {
          const exists = this.playerParams.find(p => p.index === chr);
          if (!exists) {
            const p = this.paramAll.chrParams[chr].clone();
            p.isPlayer = true;
            this.playerParams.push(p);
          }
        }
        // Update field party models for following display
        this.updateFieldPartyModels();
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
        this.input.update();
      };
      this.eventManager.saveCallback = async () => {
        this.saveGame(false);
      };
      this.eventManager.quakeCallback = (strength) => {
        this.quakeFrames = strength * 3;
      };
      this.eventManager.effectCallback = (type, x, z, param) => {
        // Spawn visual particles on the field at the given position
        if (!this.fieldEffects) this.fieldEffects = [];
        const px = MapData.getXPos(x);
        const pz = MapData.getZPos(z);
        // Add particles based on effect type
        const colors = { 31: '#f80', 36: '#4af', 48: '#fa0', 59: '#ff4', 60: '#f44', 106: '#8f8' };
        const color = colors[type] || '#fff';
        for (let i = 0; i < 8; i++) {
          this.fieldEffects.push({
            x: px + (Math.random() - 0.5) * 100,
            z: pz + (Math.random() - 0.5) * 100,
            y: Math.random() * 100,
            vy: 2 + Math.random() * 3,
            life: 30 + Math.floor(Math.random() * 20),
            color
          });
        }
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
          this.messageWindow.close();
        }).catch((e) => {
          console.warn('Wall event error:', e);
          this.eventRunning = false;
          this.messageWindow.close();
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

    this.loop.start(null, (dt) => this.update(dt), () => this.draw());
  }

  showLoadingScreen(msg) {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, 400, 320);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(msg, 200, 160);
  }

  update(dt) {
    this.input.update();
    this.frameCount++;

    // Track play time (only during gameplay)
    const now = Date.now();
    if (this.state === 'game' || this.state === 'battle' || this.state === 'menu') {
      this.playTime += (now - this._lastTime) / 1000;
    }
    this._lastTime = now;

    switch (this.state) {
      case 'title': this.updateTitle(); break;
      case 'game': this.updateGame(); break;
      case 'battle': this.updateBattle(); break;
      case 'menu': this.updateMenu(); break;
      case 'gameover': this.updateGameOver(); break;
      case 'worldmap': this.updateWorldMap(); break;
      case 'credits':
        this.credits.update(this.input);
        if (!this.credits.active) this.state = 'title';
        break;
      case 'opening': this.updateOpening(); break;
    }
  }

  draw() {
    switch (this.state) {
      case 'title': this.drawTitle(); break;
      case 'game': this.drawGame(); break;
      case 'battle': this.drawBattle(); break;
      case 'menu': this.drawMenu(); break;
      case 'gameover': this.drawGameOver(); break;
      case 'worldmap': this.drawWorldMap(); break;
      case 'credits': this.credits.draw(); break;
      case 'opening': this.drawOpening(); break;
    }
    // Touch UI overlay (always drawn)
    this.touchUI.draw(this.ctx);
  }

  updateTitle() {
    // Name confirmation dialog
    if (this.nameConfirm) {
      if (this.input.isUp() || this.input.isLeft()) this.nameConfirm.cursor = 0;
      if (this.input.isDown() || this.input.isRight()) this.nameConfirm.cursor = 1;
      if (this.input.isOK()) {
        if (this.nameConfirm.cursor === 0) {
          // Yes — open name input
          this.nameConfirm = null;
          this.nameInput = { chars: ['　','　','　','　'], cursor: 0, gridX: 0, gridY: 0, page: 0 };
        } else {
          // No — use default name, start game
          this.nameConfirm = null;
          this.resetNewGame();
          this.playerParams[0].name = '西瓜太郎';
          this.state = 'opening';
          this.openingFrame = 0;
        }
      }
      if (this.input.isCancel()) {
        // Cancel = No
        this.nameConfirm = null;
        this.resetNewGame();
        this.playerParams[0].name = '西瓜太郎';
        this.state = 'opening';
        this.openingFrame = 0;
      }
      return;
    }

    // Name input mode
    if (this.nameInput) {
      this.updateNameInput();
      return;
    }

    // Keyboard or touch stick navigation
    if (this.input.isUp() || this.input.isLeft()) {
      if (!this._titleDirHeld) {
        this.titleCursor = (this.titleCursor - 1 + 3) % 3;
        this._titleDirHeld = true;
      }
    } else if (this.input.isDown() || this.input.isRight()) {
      if (!this._titleDirHeld) {
        this.titleCursor = (this.titleCursor + 1) % 3;
        this._titleDirHeld = true;
      }
    } else {
      this._titleDirHeld = false;
    }
    if (this.input.isOK()) {
      this.audio.resume();
      if (this.titleCursor === 0) {
        // New game — ask if player wants to change name
        this.nameConfirm = { cursor: 1 }; // default: いいえ (index 1)
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

  // Name input grid (ported from CInputNameWondow)
  updateNameInput() {
    const ni = this.nameInput;
    // Grid: 13 columns × 5 rows per page, 2 pages (hiragana / katakana)
    const GRID = [
      // Page 0: Hiragana
      ['あ','い','う','え','お','　','は','ひ','ふ','へ','ほ','　','▼'],
      ['か','き','く','け','こ','　','ま','み','む','め','も','　','←'],
      ['さ','し','す','せ','そ','　','や','　','ゆ','　','よ','　','▲'],
      ['た','ち','つ','て','と','　','ら','り','る','れ','ろ','　','→'],
      ['な','に','ぬ','ね','の','　','わ','　','を','　','ん','　','決'],
      // Page 1: Katakana + special
      ['ア','イ','ウ','エ','オ','　','ハ','ヒ','フ','ヘ','ホ','　','▼'],
      ['カ','キ','ク','ケ','コ','　','マ','ミ','ム','メ','モ','　','←'],
      ['サ','シ','ス','セ','ソ','　','ヤ','　','ユ','　','ヨ','　','▲'],
      ['タ','チ','ツ','テ','ト','　','ラ','リ','ル','レ','ロ','　','→'],
      ['ナ','ニ','ヌ','ネ','ノ','　','ワ','　','ヲ','　','ン','　','決'],
    ];
    const pageOffset = ni.page * 5;
    const cols = 13, rows = 5;

    if (this.input.isUp()) { ni.gridY = (ni.gridY - 1 + rows) % rows; this.audio.play(5); }
    if (this.input.isDown()) { ni.gridY = (ni.gridY + 1) % rows; this.audio.play(5); }
    if (this.input.isLeft()) { ni.gridX = (ni.gridX - 1 + cols) % cols; this.audio.play(5); }
    if (this.input.isRight()) { ni.gridX = (ni.gridX + 1) % cols; this.audio.play(5); }

    if (this.input.isOK()) {
      const ch = GRID[pageOffset + ni.gridY][ni.gridX];
      if (ch === '▼') { ni.page = (ni.page + 1) % 2; }
      else if (ch === '▲') { ni.page = (ni.page - 1 + 2) % 2; }
      else if (ch === '←') {
        // Delete
        if (ni.cursor > 0) { ni.cursor--; ni.chars[ni.cursor] = '　'; }
      } else if (ch === '→') {
        // Move cursor right
        if (ni.cursor < 3) ni.cursor++;
      } else if (ch === '決') {
        // Confirm name
        let name = ni.chars.join('').replace(/　/g, '').trim();
        if (!name) name = '西瓜太郎'; // Default name
        this.resetNewGame();
        this.playerParams[0].name = name.slice(0, 4);
        this.nameInput = null;
        this.state = 'opening';
        this.openingFrame = 0;
      } else if (ch !== '　') {
        ni.chars[ni.cursor] = ch;
        if (ni.cursor < 3) ni.cursor++;
        this.audio.play(8);
      }
    }
    if (this.input.isCancel()) {
      // Delete last char
      if (ni.cursor > 0) { ni.cursor--; ni.chars[ni.cursor] = '　'; }
      else { this.nameInput = null; } // Cancel back to title
    }
  }

  loadFromPassword(data) {
    // Initialize game state first
    this.resetNewGame();

    // Apply password data to game state
    // Password stores EXP (cumulative), equipment, gem, abilities — not raw stats
    // Stats are recalculated from base params + level ups
    if (data.characters && data.characters.length > 0) {
      for (let i = 0; i < Math.min(3, data.characters.length); i++) {
        const chr = data.characters[i];
        // Get base character from paramAll (index 0=hero, 21=うな, 28=かるび)
        const baseIdx = i === 0 ? 0 : (i === 1 ? 21 : 28);
        if (baseIdx < this.paramAll.chrParams.length) {
          const p = this.paramAll.chrParams[baseIdx].clone();
          p.isPlayer = true;
          p.exp = chr.exp || 0;
          p.equip = chr.equip || [-1, -1, -1, -1, -1];
          p.gem = chr.gem !== undefined ? chr.gem : -1;
          p.hp = chr.hp || p.maxHP;
          p.mp = chr.mp || p.maxMP;
          // Apply level ups based on EXP
          while (p.lv < 99 && p.exp >= p.lv * p.lv * (p.lv + 1) * 10) {
            const upIdx = (p.add || 1) - 1;
            if (upIdx >= 0 && upIdx < this.paramAll.prmUps.length) {
              const up = this.paramAll.prmUps[upIdx];
              if (up.hp > 100 && p.maxHP < 9999) p.maxHP = Math.floor(p.maxHP * up.hp / 100);
              p.maxMP = Math.floor(p.maxMP * up.mp / 100);
              p.str += Math.floor(up.str / 10) || 1;
              p.int_ += Math.floor(up.int_ / 10) || 1;
              p.def += Math.floor(up.def / 10) || 1;
              p.agi += Math.floor(up.agi / 10) || 1;
              p.dex += Math.floor(up.dex / 10) || 1;
            }
            p.lv++;
          }
          // Apply equipment stat bonuses
          for (const eqIdx of p.equip) {
            if (eqIdx >= 0) {
              const item = this.paramAll.getItem(eqIdx);
              if (item) {
                p.str = Math.max(1, p.str + item.str);
                p.int_ = Math.max(1, p.int_ + item.int_);
                p.def = Math.max(0, p.def + item.def);
                p.agi = Math.max(1, p.agi + item.agi);
                p.dex = Math.max(1, p.dex + item.dex);
              }
            }
          }
          if (chr.hp > 0) p.hp = Math.min(chr.hp, p.maxHP);
          if (chr.mp > 0) p.mp = Math.min(chr.mp, p.maxMP);
          if (i < this.playerParams.length) {
            this.playerParams[i] = p;
          } else {
            this.playerParams.push(p);
          }
        }
      }
    }
    this.gold = data.gold || 0;
    this.eventManager.gold = this.gold;

    // Restore items
    this.eventManager.inventory = [];
    if (data.items) {
      for (let i = 0; i < data.items.length; i++) {
        const count = data.items[i] || 0;
        for (let j = 0; j < count; j++) this.eventManager.inventory.push(i);
      }
    }

    // Restore flags
    this.eventManager.flags = new Set(data.flags || []);
    this.field.eventFlags = this.eventManager.flags;

    // Restore area
    if (data.areaNo !== undefined && data.areaNo < this.stageManager.stages.length) {
      const area = this.stageManager.stages[data.areaNo];
      this.field.setArea(area);
      this.currentArea = data.areaNo;
      if (data.posX !== undefined) this.field.playerPos.x = MapData.getXPos(data.posX);
      if (data.posZ !== undefined) this.field.playerPos.z = MapData.getZPos(data.posZ);
      if (data.vect !== undefined) this.field.playerVect = data.vect * (Math.PI / 2);
    }
    this.updateFieldPartyModels();
  }

  drawTitle() {
    const ctx = this.ctx;
    // Blue gradient background (matching original CTitle.ClearSurface)
    for (let i = 0; i < 80; i++) {
      const c = i * 2 + 40;
      ctx.fillStyle = `rgb(${c},${c},255)`;
      ctx.fillRect(0, i * 4, 400, 4);
    }

    // Name confirmation dialog
    if (this.nameConfirm) {
      ctx.fillStyle = 'rgba(0,0,60,0.92)';
      ctx.fillRect(80, 110, 240, 100);
      ctx.strokeStyle = '#88f';
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 110, 240, 100);
      ctx.fillStyle = '#fff';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('主人公の名前を変更しますか？', 200, 140);
      ctx.fillStyle = '#aaa';
      ctx.font = '11px sans-serif';
      ctx.fillText('（デフォルト: 西瓜太郎）', 200, 158);
      // Yes/No
      const opts = ['はい', 'いいえ'];
      ctx.font = '14px sans-serif';
      for (let i = 0; i < 2; i++) {
        ctx.fillStyle = i === this.nameConfirm.cursor ? '#ff0' : '#fff';
        ctx.fillText((i === this.nameConfirm.cursor ? '▶ ' : '   ') + opts[i], 160 + i * 80, 190);
      }
      return;
    }

    // Name input overlay
    if (this.nameInput) {
      this.drawNameInput(ctx);
      return;
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
    const saveRaw = localStorage.getItem('suika_save');
    if (saveRaw) {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#8f8';
      try {
        const save = JSON.parse(saveRaw);
        const h = Math.floor((save.playTime || 0) / 3600);
        const m = Math.floor(((save.playTime || 0) % 3600) / 60);
        ctx.fillText(`セーブデータあり (${h}:${String(m).padStart(2,'0')})`, 200, 258);
      } catch(e) {
        ctx.fillText('セーブデータあり', 200, 258);
      }
    }

    // Credits
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('2002-2008 製作・著作 くろすけ', 200, 295);

    // Version
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'right';
    ctx.fillText(SUIKA_VERSION, 395, 295);
    ctx.textAlign = 'center';

    // Volume control (bottom-left)
    const vol = Math.round(this.audio.volume * 100);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText(`SE: ${vol}%`, 10, 305);
    // Volume bar
    ctx.fillStyle = '#444';
    ctx.fillRect(55, 298, 60, 8);
    ctx.fillStyle = '#4af';
    ctx.fillRect(55, 298, 60 * this.audio.volume, 8);
    // Battle speed
    const speedLabels = ['おそい', 'ふつう', 'はやい', '瞬間'];
    ctx.fillStyle = '#fc8';
    ctx.fillText(`速度: ${speedLabels[this.battleSpeed] || 'ふつう'}`, 10, 318);
    ctx.textAlign = 'center';

    // Touch hint
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('スティック↑↓で選択 / Aで決定', 260, 312);
  }

  drawNameInput(ctx) {
    const ni = this.nameInput;
    const GRID = [
      ['あ','い','う','え','お','　','は','ひ','ふ','へ','ほ','　','▼'],
      ['か','き','く','け','こ','　','ま','み','む','め','も','　','←'],
      ['さ','し','す','せ','そ','　','や','　','ゆ','　','よ','　','▲'],
      ['た','ち','つ','て','と','　','ら','り','る','れ','ろ','　','→'],
      ['な','に','ぬ','ね','の','　','わ','　','を','　','ん','　','決'],
      ['ア','イ','ウ','エ','オ','　','ハ','ヒ','フ','ヘ','ホ','　','▼'],
      ['カ','キ','ク','ケ','コ','　','マ','ミ','ム','メ','モ','　','←'],
      ['サ','シ','ス','セ','ソ','　','ヤ','　','ユ','　','ヨ','　','▲'],
      ['タ','チ','ツ','テ','ト','　','ラ','リ','ル','レ','ロ','　','→'],
      ['ナ','ニ','ヌ','ネ','ノ','　','ワ','　','ヲ','　','ン','　','決'],
    ];
    const pageOffset = ni.page * 5;

    // Panel background
    ctx.fillStyle = 'rgba(0,0,60,0.95)';
    ctx.fillRect(20, 20, 360, 280);
    ctx.strokeStyle = '#88f';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 360, 280);

    // Title
    ctx.fillStyle = '#fd0';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('なまえを いれてください', 200, 48);

    // Name display
    ctx.font = '20px monospace';
    for (let i = 0; i < 4; i++) {
      const ch = ni.chars[i];
      ctx.fillStyle = i === ni.cursor ? '#ff0' : '#fff';
      ctx.fillText(ch, 140 + i * 35, 80);
      // Underline for current position
      if (i === ni.cursor) {
        ctx.fillRect(128 + i * 35, 85, 24, 2);
      }
    }

    // Page indicator
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText(ni.page === 0 ? 'ひらがな' : 'カタカナ', 200, 100);

    // Character grid
    ctx.font = '14px sans-serif';
    const gx0 = 35, gy0 = 115;
    const cellW = 27, cellH = 30;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 13; col++) {
        const ch = GRID[pageOffset + row][col];
        if (ch === '　') continue;
        const x = gx0 + col * cellW;
        const y = gy0 + row * cellH;
        const selected = row === ni.gridY && col === ni.gridX;
        if (selected) {
          ctx.fillStyle = 'rgba(255,255,0,0.2)';
          ctx.fillRect(x - 10, y - 16, cellW - 2, cellH - 4);
          ctx.fillStyle = '#ff0';
        } else {
          ctx.fillStyle = ch === '←' || ch === '→' || ch === '▼' || ch === '▲' || ch === '決' ? '#8cf' : '#fff';
        }
        ctx.textAlign = 'center';
        ctx.fillText(ch, x + 3, y);
      }
    }

    // Hint
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText('方向キーで選択 / A:入力 / B:削除 / 「決」で決定', 200, 290);
  }

  // --- Opening sequence (matching original CTitle.Opening) ---
  updateOpening() {
    this.openingFrame++;
    // Total duration: ~220 frames — no skip (matching original)
    if (this.openingFrame > 220) {
      this.state = 'game';
    }
  }

  drawOpening() {
    const ctx = this.ctx;
    const f = this.openingFrame;

    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 400, 320);

    if (f < 20) {
      // Initial pause — black screen
      return;
    }

    const phase = f - 20;

    // Title text grows in 5 stages, final stage goes huge (overflows screen)
    // Stage 0: 16px, 1: 24px, 2: 36px, 3: 52px, 4: 80-140px (overflow!)
    const stage = Math.min(4, Math.floor(phase / 36));
    const stageProgress = (phase % 36) / 36;

    let fontSize;
    if (stage === 0) fontSize = 16;
    else if (stage === 1) fontSize = 24;
    else if (stage === 2) fontSize = 36;
    else if (stage === 3) fontSize = 52;
    else {
      // Final stage: continuously grow from 80px using total elapsed time since stage 4 start
      const stage4Elapsed = phase - 4 * 36;
      fontSize = 80 + (stage4Elapsed / 36) * 60; // grows without resetting
    }

    // Brightness pulse (0→255→0 per stage)
    let brightness;
    if (stage < 4) {
      const pulseT = stageProgress;
      if (pulseT < 0.5) brightness = pulseT * 2;
      else brightness = (1 - pulseT) * 2;
    } else {
      // Final stage: hold full brightness then fade
      brightness = 1;
    }

    // Fade out at end
    if (f > 185) {
      brightness *= Math.max(0, (210 - f) / 25);
    }

    const c = Math.floor(Math.min(255, brightness * 255));
    ctx.fillStyle = `rgb(${c},${c},${c})`;
    ctx.font = `bold ${Math.floor(fontSize)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('すいかが食べたい', 200, 160);
    ctx.textBaseline = 'alphabetic';
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
      const moved = this.field.movePlayer(dir);
      // Footstep SE (every 4 steps)
      if (moved) {
        this.stepCount = (this.stepCount || 0) + 1;
        if (this.stepCount % 4 === 0) this.audio.play(2);
      }
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
          this.messageWindow.close();
          // Special: first NPC in starting area gives いちご (flag 500 = already received)
          if (this.currentArea === 0 && !this.eventManager.flags.has(500)) {
            this.eventManager.flags.add(500);
            this.eventManager.inventory.push(1, 1, 1); // 3x いちご
            this.eventRunning = true;
            this.messageWindow.show('いちごを3つもらった！').then(() => {
              this.eventRunning = false;
              this.messageWindow.close();
            });
          }
        }).catch((e) => {
          console.warn('Event error:', e);
          this.eventRunning = false;
          this.messageWindow.close();
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
    if (this.encounterRate === 0) return; // Encounters off

    const bx = MapData.getXBlock(this.field.playerPos.x);
    const bz = MapData.getZBlock(this.field.playerPos.z);

    // Stealth counter (忍び足) halves encounter rate
    const stealthMod = (this.stealthCounter && this.stealthCounter > 0) ? 2 : 1;
    if (this.stealthCounter > 0) this.stealthCounter--;

    // Encounter rate multiplier: 0=off, 1=low(x4), 2=normal(x2), 3=high(x1)
    const rateMod = [999, 4, 2, 1][this.encounterRate] || 4;

    for (const enc of this.field.area.enemies) {
      if (bx >= enc.xPos && bx < enc.xPos + enc.xSize &&
          bz >= enc.zPos && bz < enc.zPos + enc.zSize) {
        // Random chance based on rnd1, modified by stealth and rate setting
        const baseChance = enc.rnd1 > 0 ? enc.rnd1 : 30;
        const chance = baseChance * stealthMod * rateMod;
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

    // Battle start flash effect
    this.battleFlash = 8;
    this.audio.play(0); // SE: battle start

    this.battleEngine = new BattleEngine(this.paramAll);
    // Apply battle speed setting
    const speedTable = [[1200, 1600], [600, 800], [300, 400], [50, 100]];
    const [pDelay, eDelay] = speedTable[Math.min(this.battleSpeed, 3)] || [600, 800];
    this.battleEngine.playerTurnDelay = pDelay;
    this.battleEngine.enemyTurnDelay = eDelay;

    this.battleUI = new BattleUI(this.ctx, this.input, this.renderer, this.models, this.paramAll);

    // Set battle background color from current area
    if (this.field.area) {
      this.battleUI.bgColor = this.field.area.backColor;
    }

    // Set enemy model patterns from party data
    const party = this.paramAll.getParty(partyIndex);
    if (party) {
      // Convert pat (CChrPrm index) to actual model index
      // Same mapping as field.js: CChrPrm[pat][0] + CChrPrm[pat][1] + 55
      const CChrPrm = [
        [0,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[10,0],[11,0],
        [13,0],[15,0],[17,0],[19,0],[20,0],[2,0],[7,0],[35,0],[37,0],[39,0],
        [41,0],[42,0],[46,0],[47,0],[48,0],[49,0],[50,0],[47,0],[51,0],[53,0],
        [54,0],[8,0],[55,0],[3,0],[5,0],[54,0],[41,0],[42,0],[42,0],[42,0],
        [42,0],[56,0],[39,0],[57,0]
      ];
      const pats = party.enemies.map(e => {
        const prm = this.paramAll.getPrm(e.kind);
        if (!prm) return 55;
        const pat = prm.pat;
        if (pat < CChrPrm.length) {
          return CChrPrm[pat][0] + CChrPrm[pat][1] + 55;
        }
        return 55;
      });
      this.battleUI.setEnemyPats(pats);
    }

    // Set player model indices for battle display
    const CChrPrmTable = [
      [0,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[10,0],[11,0],
      [13,0],[15,0],[17,0],[19,0],[20,0],[2,0],[7,0],[35,0],[37,0],[39,0],
      [41,0],[42,0],[46,0],[47,0],[48,0],[49,0],[50,0],[47,0],[51,0],[53,0],
      [54,0],[8,0],[55,0],[3,0],[5,0],[54,0],[41,0],[42,0],[42,0],[42,0],
      [42,0],[56,0],[39,0],[57,0]
    ];
    this.battleUI.playerModelPats = this.playerParams.map(p => {
      const pat = p.pat || 0;
      if (pat < CChrPrmTable.length) return CChrPrmTable[pat][0] + CChrPrmTable[pat][1] + 55;
      return 55;
    });
    this.battleUI.playerCount = this.playerParams.length;

    // Setup inventory for battle (actual player inventory, consumable items only)
    this.battleUI.inventory = [];
    const invCount = {};
    for (const idx of this.eventManager.inventory) { invCount[idx] = (invCount[idx] || 0) + 1; }
    for (const [idxStr, count] of Object.entries(invCount)) {
      const idx = Number(idxStr);
      const item = this.paramAll.getItem(idx);
      if (item && item.kind === 0 && item.name && item.name.trim()) {
        this.battleUI.inventory.push({ ...item, index: idx, count });
      }
    }

    // Setup player skill sets (skills each character has learned)
    // NOTE: abi1/abi2 are BATTLE COMMAND indices (1=たたかう,2=アイテム,3=盗む,4=ぶんどる,
    //   5=特技,6=神官魔法,7=陰陽術,8=連陰陽,9=敵の技,10=逃げる,11=唄,12=西瓜魔法)
    // They are NOT skill indices. Skills come from gems only.
    this.battleUI.playerSkillSets = this.playerParams.map(p => {
      const skills = [];
      // Add skills learned from gems (gemFlags tracks learned skill flags)
      if (p.gemFlags) {
        for (const [gemId, flags] of Object.entries(p.gemFlags)) {
          if (!flags) continue;
          if (Array.isArray(flags)) {
            for (const skillIdx of flags) {
              if (skillIdx > 0 && skillIdx < this.paramAll.skills.length) {
                const s = this.paramAll.skills[skillIdx];
                if (s && s.name && s.name.trim() && !skills.find(sk => sk.index === skillIdx)) {
                  skills.push({ ...s, index: skillIdx });
                }
              }
            }
          }
        }
      }
      return skills;
    });

    // Check if current party has steal/seize abilities (learned via gems)
    // In original: CMD_TABLE[1]=3 (steal), CMD_TABLE[2]=4 (seize)
    // These are ability flags checked via CAbility.GetFlagC
    this.battleUI.hasSteal = this.playerParams.some(p => p.abi1 === 3 || p.abi2 === 3);
    this.battleUI.hasSeize = this.playerParams.some(p => p.abi1 === 4 || p.abi2 === 4);
    // Cosmic background for space areas (flag 330 or 331)
    this.battleUI.cosmoMode = this.eventManager.flags.has(330) || this.eventManager.flags.has(331);

    this.battleEngine.onBattleEnd = (result, exp, gold) => {
      // Play victory/defeat SE
      if (result === BATTLE_RESULT.WIN) this.audio.play(10);
      else if (result === BATTLE_RESULT.LOSE) this.audio.play(12);

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
      const gemAPGains = [];
      if (result === BATTLE_RESULT.WIN && exp > 0) {
        this.gold = (this.gold || 0) + gold;
        for (const p of this.playerParams) {
          if (p.hp > 0) {
            const prevLv = p.lv;
            this.applyExp(p, exp);
            if (p.lv > prevLv) {
              levelUps.push({ name: p.name, prevLv, newLv: p.lv });
            }
            // Gem AP gain: based on enemy party's total AP (not EXP)
            // Original: AP = totalEnemyAP * 0.1 (or 0.13 with ability)
            if (p.gem >= 0) {
              if (!p.gemAP) p.gemAP = {};
              // Calculate total AP from defeated enemies
              let totalEnemyAP = 0;
              for (const enemy of this.battleEngine.enemies) {
                if (!enemy.isAlive()) totalEnemyAP += (enemy.exp || 0); // ap field stored as exp in enemy params
              }
              // Use the party's AP value (stored in enemy params as 'ap' field)
              const party = this.paramAll.getParty(partyIndex);
              if (party) {
                totalEnemyAP = 0;
                for (const e of party.enemies) {
                  const prm = this.paramAll.getPrm(e.kind);
                  if (prm) totalEnemyAP += prm.ap;
                }
              }
              const apGain = Math.max(1, Math.floor(totalEnemyAP * 0.1));
              p.gemAP[p.gem] = (p.gemAP[p.gem] || 0) + apGain;
              gemAPGains.push({ name: p.name, gemName: this.paramAll.getItem(p.gem)?.name?.trim() || '勾玉', gain: apGain });
              // Check if all skills learned → gem breaks
              const progress = this.getGemProgress(p, p.gem);
              if (progress.learned >= progress.total) {
                // Gem mastered — it breaks (disappears)
                levelUps.push({ name: p.name, prevLv: 0, newLv: 0, gemBreak: true, gemName: this.paramAll.getItem(p.gem)?.name?.trim() || '勾玉' });
                p.gem = -1;
              }
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
          this.battleResult = { exp, gold, levelUps, gemAP: gemAPGains };
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
        const idx = target.index;
        let x, y;
        if (!target.isPlayer && this.battleUI._enemyScreenPos && this.battleUI._enemyScreenPos[idx]) {
          // Use actual 3D screen position for enemies
          x = this.battleUI._enemyScreenPos[idx].x;
          y = this.battleUI._enemyScreenPos[idx].y;
        } else {
          // Fallback calculation
          const total = target.isPlayer ? this.playerParams.length : this.battleEngine.enemies.length;
          const spacing = total <= 2 ? 80 : 60;
          const startX = 200 - (total - 1) * spacing / 2;
          x = startX + idx * spacing;
          y = target.isPlayer ? 240 : 90;
        }
        this.battleUI.effect.addDamageNum(String(dmg), x, y, target.isPlayer ? '#f44' : '#ff0');
      }
    };
    this.battleEngine.onAttackHit = (isCrit) => {
      this.audio.play(isCrit ? 4 : 1); // SE: critical or normal hit
    };
    this.battleEngine.onMiss = () => {
      this.audio.play(6); // SE: miss
    };
    this.battleEngine.onSkillUse = (kind) => {
      // 0=attack magic, 1=heal, 2=buff, 3=debuff, 4=status
      const seMap = [3, 10, 8, 7, 7];
      this.audio.play(seMap[kind] || 3);
      // Pass skill kind to UI for animation selection
      if (this.battleUI) this.battleUI._lastSkillKind = kind;
    };
    this.battleEngine.onItemUse = (itemIndex) => {
      // Remove used item from actual inventory
      const pos = this.eventManager.inventory.indexOf(itemIndex);
      if (pos >= 0) this.eventManager.inventory.splice(pos, 1);
    };
    this.battleEngine.onSteal = (itemIndex) => {
      // Add stolen item to inventory
      this.eventManager.inventory.push(itemIndex);
      const item = this.paramAll.getItem(itemIndex);
      if (item) this.audio.play(8);
    };

    this.battleEngine.start(partyIndex, this.playerParams);
    this.state = 'battle';
  }

  updateBattle() {
    if (!this.battleEngine || !this.battleUI) return;
    const bState = this.battleEngine.getState();

    // Fast-forward only during non-player turns (enemy actions / waiting)
    const isPlayerTurn = bState.state === 'playerTurn';
    const fastForward = !isPlayerTurn && this.input.isOKHeld();
    this.battleEngine.fastForward = fastForward;
    this.battleUI._fastForward = fastForward;

    if (isPlayerTurn) {
      const action = this.battleUI.update(bState);
      if (action) {
        this.audio.play(8); // SE: command confirm
        this.battleEngine.doPlayerCommand(action.cmd, action.target, action.extra);
        this.battleUI.reset();
      }
    } else {
      // During enemy/animating turns, still update UI for animations
      this.battleUI.update(bState);
    }
  }

  drawBattle() {
    if (!this.battleEngine || !this.battleUI) return;
    const bState = this.battleEngine.getState();
    this.battleUI.draw(bState);

    // Battle start flash overlay
    if (this.battleFlash > 0) {
      this.battleFlash--;
      const alpha = this.battleFlash / 8;
      this.ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      this.ctx.fillRect(0, 0, 400, 320);
    }
  }

  drawGame() {
    // Screen shake
    const shaking = this.quakeFrames > 0;
    if (shaking) {
      this.quakeFrames--;
      const shakeX = (Math.random() - 0.5) * this.quakeFrames * 0.8;
      const shakeY = (Math.random() - 0.5) * this.quakeFrames * 0.5;
      this.ctx.save();
      this.ctx.translate(shakeX, shakeY);
    }

    this.field.draw();

    // Field effects (particles from EFFECT command)
    if (this.fieldEffects && this.fieldEffects.length > 0) {
      for (let i = this.fieldEffects.length - 1; i >= 0; i--) {
        const ef = this.fieldEffects[i];
        ef.y += ef.vy;
        ef.life--;
        if (ef.life <= 0) { this.fieldEffects.splice(i, 1); continue; }
        const dx = ef.x - this.field.playerPos.x;
        const dz = ef.z - this.field.playerPos.z;
        if (dx * dx + dz * dz > 4000000) continue;
        const screenX = 200 + dx * 0.1;
        const screenY = 160 - ef.y * 0.1 - dz * 0.05;
        const alpha = Math.min(1, ef.life / 15);
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = ef.color;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
    }

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
      this.ctx.fillStyle = 'rgba(0,0,60,0.92)';
      this.ctx.fillRect(60, 50, 280, 220);
      this.ctx.strokeStyle = '#88f';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(60, 50, 280, 220);

      // Victory header with decorative lines
      this.ctx.strokeStyle = 'rgba(255,255,100,0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(80, 72);
      this.ctx.lineTo(320, 72);
      this.ctx.stroke();

      this.ctx.fillStyle = '#ff0';
      this.ctx.font = 'bold 16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('勝利！', 200, 68);

      // EXP and Gold with icons
      this.ctx.font = '13px sans-serif';
      this.ctx.fillStyle = '#8cf';
      this.ctx.fillText(`⭐ EXP +${this.battleResult.exp}`, 150, 95);
      this.ctx.fillStyle = '#fd0';
      this.ctx.fillText(`💰 Gold +${this.battleResult.gold}`, 260, 95);

      // Separator
      this.ctx.strokeStyle = 'rgba(100,100,200,0.4)';
      this.ctx.beginPath();
      this.ctx.moveTo(80, 105);
      this.ctx.lineTo(320, 105);
      this.ctx.stroke();

      let y = 120;
      for (const lu of this.battleResult.levelUps) {
        if (lu.gemBreak) {
          this.ctx.fillStyle = '#f8f';
          this.ctx.font = '12px sans-serif';
          this.ctx.fillText(`💎 ${lu.name}の${lu.gemName}が砕け散った！`, 200, y);
        } else {
          this.ctx.fillStyle = '#8f8';
          this.ctx.font = '13px sans-serif';
          this.ctx.fillText(`🎉 ${lu.name} Lv${lu.prevLv} → Lv${lu.newLv}!`, 200, y);
        }
        y += 22;
      }

      // Show gem AP gains for each character
      if (this.battleResult.gemAP) {
        for (const ga of this.battleResult.gemAP) {
          this.ctx.fillStyle = '#c8f';
          this.ctx.font = '11px sans-serif';
          this.ctx.fillText(`${ga.name}: ${ga.gemName} AP+${ga.gain}`, 200, y);
          y += 18;
        }
      }

      this.ctx.fillStyle = '#aaa';
      this.ctx.font = '11px sans-serif';
      this.ctx.fillText('Enter で閉じる', 200, 252);
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
    // Player status mini-HUD (hide during conversations/events)
    if (this.playerParams.length > 0 && !this.messageWindow.visible && !this.choiceWindow.visible && !this.eventRunning) {
      const p = this.playerParams[0];
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(2, 2, 130, 36);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '9px monospace';
      this.ctx.fillText(`${p.name} Lv${p.lv}`, 6, 12);
      this.ctx.fillText(`HP:${p.hp}/${p.maxHP} MP:${p.mp}/${p.maxMP}`, 6, 23);
      this.ctx.fillText(`G:${this.gold || 0}`, 6, 34);

      // Mini-map (top-right corner)
      this.drawMiniMap();
    }

    // End screen shake
    if (shaking) {
      this.ctx.restore();
    }
  }

  // Update party member models on field (for following display)
  updateFieldPartyModels() {
    if (!this.field) return;
    // CChrPrm model mapping: party member index → model index
    // Original: model = CChrPrm[kind][0] + CChrPrm[kind][1] + 55
    const CChrPrmModels = [55, 57, 58, 59, 60, 61, 62, 63]; // approximate model indices
    this.field.partyModels = [];
    for (let i = 1; i < this.playerParams.length; i++) {
      const p = this.playerParams[i];
      // Use pat field if available, otherwise use index-based lookup
      const modelIdx = p.pat ? p.pat + 55 : CChrPrmModels[Math.min(i, CChrPrmModels.length - 1)];
      this.field.partyModels.push(modelIdx);
    }
  }

  // Mini-map display (top-right corner)
  drawMiniMap() {
    if (!this.field.area) return;
    const ctx = this.ctx;
    const map = this.field.area.map;
    const mapSize = 50;
    const mx = 395 - mapSize;
    const my = 4;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(mx - 2, my - 2, mapSize + 4, mapSize + 4);

    const cellW = mapSize / map.xNum;
    const cellH = mapSize / map.zNum;
    const px = MapData.getXBlock(this.field.playerPos.x);
    const pz = MapData.getZBlock(this.field.playerPos.z);

    // Draw visible range around player
    const viewRange = Math.floor(mapSize / (2 * Math.max(cellW, cellH)));
    for (let z = 0; z < map.zNum; z++) {
      for (let x = 0; x < map.xNum; x++) {
        const idx = map.getPtr(x, z);
        const ground = map.ground[idx];
        const hit = map.hit[idx];
        if (ground === 0 && hit === 0) continue;

        let color;
        if (hit >= 3) color = '#444'; // wall
        else if (ground > 0) color = '#2a4a2a'; // walkable
        else color = '#1a1a1a';

        ctx.fillStyle = color;
        ctx.fillRect(mx + x * cellW, my + z * cellH, Math.max(1, cellW), Math.max(1, cellH));
      }
    }

    // Draw NPCs as dots
    if (this.field.area.npcs) {
      ctx.fillStyle = '#88f';
      for (const npc of this.field.area.npcs) {
        ctx.fillRect(mx + npc.xPos * cellW, my + npc.zPos * cellH, Math.max(1, cellW + 1), Math.max(1, cellH + 1));
      }
    }

    // Draw player (blinking)
    if ((this.frameCount >> 2) & 1) {
      ctx.fillStyle = '#f44';
    } else {
      ctx.fillStyle = '#ff0';
    }
    ctx.fillRect(mx + px * cellW - 1, my + pz * cellH - 1, Math.max(2, cellW + 1), Math.max(2, cellH + 1));
  }

  // Level-up system (uses prmUps data from param._da)
  applyExp(player, exp) {
    const prevLv = player.lv;
    player.exp = (player.exp || 0) + exp;

    // EXP threshold: original formula n * n * (n + 1) * 10 (cumulative, not subtracted)
    while (true) {
      const nextLvExp = player.lv * player.lv * (player.lv + 1) * 10;
      if (player.exp < nextLvExp) break;
      if (player.lv >= 99) break;

      // Level up — apply stat growth (ported from CChrParam.LevelUp)
      // Original uses float accumulation with percentage-based growth
      const upIdx = (player.add || 1) - 1;
      if (upIdx >= 0 && upIdx < this.paramAll.prmUps.length) {
        const up = this.paramAll.prmUps[upIdx];
        // HP: multiply by (hp - (lv-1)*hps/100) / 100
        const hpDecay = (player.lv - 1) * up.hps / 100;
        const hpMul = (up.hp - hpDecay) / 100;
        if (hpMul > 1 && player.maxHP < 9999) {
          player.maxHP = Math.floor(player.maxHP * hpMul);
        }
        // MP: multiply by mp/100
        player.maxMP = Math.floor(player.maxMP * up.mp / 100);
        // Stats: add value/10
        player.str += Math.floor(up.str / 10) || 1;
        player.int_ += Math.floor(up.int_ / 10) || 1;
        player.def += Math.floor(up.def / 10) || 1;
        player.agi += Math.floor(up.agi / 10) || 1;
        player.dex += Math.floor(up.dex / 10) || 1;
      } else {
        // Fallback growth
        player.maxHP += 8 + Math.floor(Math.random() * 5);
        player.maxMP += 3;
        player.str += 1;
        player.int_ += 1;
        player.def += 1;
        player.agi += 1;
        player.dex += 1;
      }

      player.lv++;
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
    const items = ['アイテム', '特技', '装備', '勾玉', 'ステータス', 'コマンド', '設定', 'マップ', 'セーブ', 'じゅもん', 'タイトルへ', '閉じる'];

    // Equipment sub-menu
    if (this.equipMenu) {
      this.updateEquipMenu();
      return;
    }

    // Gem sub-menu
    if (this.gemMenu) {
      this.updateGemMenu();
      return;
    }

    // Item list sub-menu
    if (this.itemMenu) {
      this.updateItemMenu();
      return;
    }

    // Skill use sub-menu
    if (this.skillMenu) {
      this.updateSkillMenu();
      return;
    }

    // Command slot config
    if (this.cmdConfig) {
      this.updateCmdConfig();
      return;
    }

    // Settings sub-menu
    if (this.settingsMenu) {
      this.updateSettings();
      return;
    }

    // Password display
    if (this.passwordDisplay) {
      if (this.input.isOK() || this.input.isCancel()) {
        this.passwordDisplay = null;
      }
      return;
    }

    if (this.input.isUp()) {
      this.menuCursor = (this.menuCursor - 1 + items.length) % items.length;
      this.audio.play(5);
    }
    if (this.input.isDown()) {
      this.menuCursor = (this.menuCursor + 1) % items.length;
      this.audio.play(5);
    }
    if (this.input.isOK()) {
      switch (this.menuCursor) {
        case 0: this.itemMenu = { cursor: 0 }; break;
        case 1: this.skillMenu = { chrIdx: 0, skillIdx: 0, phase: 'chr' }; break;
        case 2: this.equipMenu = { chrIdx: 0, slot: 0, phase: 'chr' }; break;
        case 3: this.gemMenu = { chrIdx: 0, phase: 'chr', cursor: 0 }; break;
        case 4: break; // Status shown in draw
        case 5: this.cmdConfig = { chrIdx: 0, slot: 0, phase: 'chr' }; break;
        case 6: this.settingsMenu = { cursor: 0 }; break;
        case 7: this.state = 'worldmap'; break;
        case 8: this.saveGame(); this.state = 'game'; break;
        case 9: this.generatePassword(); break;
        case 10: this.state = 'title'; this.titleCursor = 0; break;
        case 11: this.state = 'game'; break;
      }
    }
    if (this.input.isCancel() || this.input.isKeyDown('z')) {
      this.state = 'game';
    }
  }

  updateItemMenu() {
    const inv = this.eventManager.inventory;
    // Build item list with counts
    const itemMap = {};
    for (const idx of inv) {
      itemMap[idx] = (itemMap[idx] || 0) + 1;
    }
    const itemList = Object.entries(itemMap).map(([idx, count]) => {
      const item = this.paramAll.getItem(Number(idx));
      return { idx: Number(idx), name: item ? item.name.trim() : '???', count, item };
    });

    if (itemList.length === 0) {
      this.itemMenu = null;
      return;
    }
    if (this.itemMenu.cursor >= itemList.length) this.itemMenu.cursor = itemList.length - 1;

    if (this.input.isUp()) this.itemMenu.cursor = (this.itemMenu.cursor - 1 + itemList.length) % itemList.length;
    if (this.input.isDown()) this.itemMenu.cursor = (this.itemMenu.cursor + 1) % itemList.length;

    if (this.input.isOK()) {
      // Use consumable items (kind=0)
      const selected = itemList[this.itemMenu.cursor];
      if (selected.item && selected.item.kind === 0) {
        const algo = selected.item.workNo || 0;
        if (algo === 1 || algo === 2 || (selected.item.effect > 0 && algo <= 3)) {
          // Heal item: heal first alive player who needs it
          for (const p of this.playerParams) {
            if (p.hp > 0 && p.hp < p.maxHP) {
              const heal = Math.min(selected.item.effect || 50, p.maxHP - p.hp);
              p.hp += heal;
              this.audio.play(10);
              const pos = this.eventManager.inventory.indexOf(selected.idx);
              if (pos >= 0) this.eventManager.inventory.splice(pos, 1);
              break;
            }
          }
        } else if (algo === 4) {
          // Cat's eye item (light expansion)
          this.field.catsEyeCounter = 500;
          this.audio.play(10);
          const pos = this.eventManager.inventory.indexOf(selected.idx);
          if (pos >= 0) this.eventManager.inventory.splice(pos, 1);
        } else if (algo === 5) {
          // Stealth item (encounter rate reduction)
          this.stealthCounter = 500;
          this.audio.play(10);
          const pos = this.eventManager.inventory.indexOf(selected.idx);
          if (pos >= 0) this.eventManager.inventory.splice(pos, 1);
        } else if (algo === 6) {
          // Revive item
          for (const p of this.playerParams) {
            if (p.hp <= 0) {
              p.hp = Math.floor(p.maxHP / 4);
              this.audio.play(10);
              const pos = this.eventManager.inventory.indexOf(selected.idx);
              if (pos >= 0) this.eventManager.inventory.splice(pos, 1);
              break;
            }
          }
        }
      }
    }
    if (this.input.isCancel()) this.itemMenu = null;
  }

  // Skill menu — view and use skills from field (heal spells)
  updateSkillMenu() {
    const sm = this.skillMenu;
    if (sm.phase === 'chr') {
      // Select character
      if (this.input.isUp()) sm.chrIdx = (sm.chrIdx - 1 + this.playerParams.length) % this.playerParams.length;
      if (this.input.isDown()) sm.chrIdx = (sm.chrIdx + 1) % this.playerParams.length;
      if (this.input.isOK()) {
        sm.phase = 'skill';
        sm.skillIdx = 0;
      }
      if (this.input.isCancel()) { this.skillMenu = null; }
    } else if (sm.phase === 'skill') {
      // Build skill list for selected character
      const p = this.playerParams[sm.chrIdx];
      const skills = [];
      for (let i = 0; i < Math.min(30, this.paramAll.skills.length); i++) {
        const s = this.paramAll.skills[i];
        if (s && s.name && s.name.trim() && s.mp > 0) {
          skills.push({ ...s, index: i });
        }
      }
      if (skills.length === 0) { sm.phase = 'chr'; return; }
      if (sm.skillIdx >= skills.length) sm.skillIdx = skills.length - 1;

      if (this.input.isUp()) sm.skillIdx = (sm.skillIdx - 1 + skills.length) % skills.length;
      if (this.input.isDown()) sm.skillIdx = (sm.skillIdx + 1) % skills.length;
      if (this.input.isOK()) {
        const skill = skills[sm.skillIdx];
        // Heal skills (kind=1) can be used from field
        if (skill.kind === 1 && p.mp >= skill.mp) {
          sm.phase = 'target';
          sm.targetIdx = 0;
          sm.selectedSkill = skill;
        // Buff skills (kind=2) with specific workNo: stealth/cat's eye
        } else if (skill.kind === 2 && p.mp >= skill.mp) {
          p.mp -= skill.mp;
          // workNo determines effect: some buffs are field-usable
          if (skill.workNo >= 100) {
            // Cat's eye effect (light expansion)
            this.field.catsEyeCounter = 500;
            this.audio.play(10);
          } else {
            // Stealth effect (encounter rate reduction)
            this.stealthCounter = 500;
            this.audio.play(10);
          }
        } else if (skill.kind !== 1 && skill.kind !== 2) {
          this.audio.play(6); // Can't use attack/debuff from field
        } else {
          this.audio.play(6); // Not enough MP
        }
      }
      if (this.input.isCancel()) { sm.phase = 'chr'; }
    } else if (sm.phase === 'target') {
      // Select heal target
      if (this.input.isUp()) sm.targetIdx = (sm.targetIdx - 1 + this.playerParams.length) % this.playerParams.length;
      if (this.input.isDown()) sm.targetIdx = (sm.targetIdx + 1) % this.playerParams.length;
      if (this.input.isOK()) {
        const skill = sm.selectedSkill;
        const caster = this.playerParams[sm.chrIdx];
        const target = this.playerParams[sm.targetIdx];
        if (caster.mp >= skill.mp && target.hp > 0) {
          caster.mp -= skill.mp;
          const intVal = caster.int_ || 10;
          let healAmt = (intVal + 2) * (intVal + 1);
          healAmt = Math.floor(healAmt * (Math.random() * 30 + 70) / 100);
          const power = skill.workNo || 85;
          healAmt = Math.floor(healAmt * power / 100);
          const actual = Math.min(healAmt, target.maxHP - target.hp);
          target.hp += actual;
          this.audio.play(10);
        }
        sm.phase = 'skill';
      }
      if (this.input.isCancel()) { sm.phase = 'skill'; }
    }
  }

  // Battle command slot configuration (ported from CSysMenu command config)
  updateCmdConfig() {
    const cc = this.cmdConfig;
    const CMD_OPTIONS = ['こうげき', 'まほう', 'アイテム', 'ぼうぎょ', '盗む', 'ぶん取る', 'にげる'];
    const CMD_IDS = [1, 9, 10, 2, 3, 4, 5]; // matching original CAbility command IDs

    if (cc.phase === 'chr') {
      if (this.input.isUp()) cc.chrIdx = (cc.chrIdx - 1 + this.playerParams.length) % this.playerParams.length;
      if (this.input.isDown()) cc.chrIdx = (cc.chrIdx + 1) % this.playerParams.length;
      if (this.input.isOK()) { cc.phase = 'slot'; cc.slot = 0; }
      if (this.input.isCancel()) { this.cmdConfig = null; }
    } else if (cc.phase === 'slot') {
      // 4 command slots per character
      if (this.input.isUp()) cc.slot = (cc.slot - 1 + 4) % 4;
      if (this.input.isDown()) cc.slot = (cc.slot + 1) % 4;
      if (this.input.isOK()) { cc.phase = 'select'; cc.optCursor = 0; }
      if (this.input.isCancel()) { cc.phase = 'chr'; }
    } else if (cc.phase === 'select') {
      if (this.input.isUp()) cc.optCursor = (cc.optCursor - 1 + CMD_OPTIONS.length) % CMD_OPTIONS.length;
      if (this.input.isDown()) cc.optCursor = (cc.optCursor + 1) % CMD_OPTIONS.length;
      if (this.input.isOK()) {
        const p = this.playerParams[cc.chrIdx];
        if (!p.cmdSlots) p.cmdSlots = [1, 9, 10, 2]; // default: attack, magic, item, defend
        p.cmdSlots[cc.slot] = CMD_IDS[cc.optCursor];
        this.audio.play(8);
        cc.phase = 'slot';
      }
      if (this.input.isCancel()) { cc.phase = 'slot'; }
    }
  }

  // Settings sub-menu (volume + battle speed + encounter rate)
  updateSettings() {
    const sm = this.settingsMenu;
    const items = ['SE音量', '戦闘速度', 'エンカウント率', '戻る'];
    if (this.input.isUp()) { sm.cursor = (sm.cursor - 1 + items.length) % items.length; this.audio.play(5); }
    if (this.input.isDown()) { sm.cursor = (sm.cursor + 1) % items.length; this.audio.play(5); }
    if (this.input.isLeft()) {
      if (sm.cursor === 0) this.audio.setVolume(this.audio.volume - 0.1);
      if (sm.cursor === 1) { this.battleSpeed = Math.max(0, this.battleSpeed - 1); localStorage.setItem('suika_battle_speed', String(this.battleSpeed)); }
      if (sm.cursor === 2) { this.encounterRate = Math.max(0, this.encounterRate - 1); localStorage.setItem('suika_encounter_rate', String(this.encounterRate)); }
    }
    if (this.input.isRight()) {
      if (sm.cursor === 0) { this.audio.setVolume(this.audio.volume + 0.1); this.audio.play(5); }
      if (sm.cursor === 1) { this.battleSpeed = Math.min(3, this.battleSpeed + 1); localStorage.setItem('suika_battle_speed', String(this.battleSpeed)); this.audio.play(5); }
      if (sm.cursor === 2) { this.encounterRate = Math.min(3, this.encounterRate + 1); localStorage.setItem('suika_encounter_rate', String(this.encounterRate)); this.audio.play(5); }
    }
    if (this.input.isOK() && sm.cursor === 3) { this.settingsMenu = null; }
    if (this.input.isCancel()) { this.settingsMenu = null; }
  }

  updateGemMenu() {
    const gm = this.gemMenu;
    if (gm.phase === 'chr') {
      // Select character
      if (this.input.isUp()) gm.chrIdx = (gm.chrIdx - 1 + this.playerParams.length) % this.playerParams.length;
      if (this.input.isDown()) gm.chrIdx = (gm.chrIdx + 1) % this.playerParams.length;
      if (this.input.isOK()) { gm.phase = 'gem'; gm.cursor = 0; }
      if (this.input.isCancel()) { this.gemMenu = null; }
    } else if (gm.phase === 'gem') {
      // Select gem to equip
      const p = this.playerParams[gm.chrIdx];
      const gems = this.eventManager.inventory
        .map((idx, i) => ({ invIdx: i, item: this.paramAll.getItem(idx), idx }))
        .filter(e => e.item && e.idx >= 110 && e.idx <= 126);
      const available = gems.filter(g => this.getGemRestriction(g.idx, gm.chrIdx) !== 2);
      available.unshift({ invIdx: -1, item: { name: 'はずす' }, idx: -1 });

      if (gm.cursor >= available.length) gm.cursor = available.length - 1;
      if (this.input.isUp()) gm.cursor = (gm.cursor - 1 + available.length) % available.length;
      if (this.input.isDown()) gm.cursor = (gm.cursor + 1) % available.length;
      if (this.input.isOK()) {
        const selected = available[gm.cursor];
        // Unequip current gem (AP preserved)
        if (p.gem >= 0) {
          this.eventManager.inventory.push(p.gem);
        }
        // Equip new gem
        if (selected.idx >= 0) {
          p.gem = selected.idx;
          if (!p.gemFlags) p.gemFlags = {};
          p.gemFlags[selected.idx - 110] = true;
          const pos = this.eventManager.inventory.indexOf(selected.idx);
          if (pos >= 0) this.eventManager.inventory.splice(pos, 1);
        } else {
          p.gem = -1;
        }
        gm.phase = 'chr';
      }
      if (this.input.isCancel()) { gm.phase = 'chr'; }
    }
  }

  updateEquipMenu() {
    const eq = this.equipMenu;
    if (eq.phase === 'chr') {
      // Select character
      if (this.input.isUp()) eq.chrIdx = (eq.chrIdx - 1 + this.playerParams.length) % this.playerParams.length;
      if (this.input.isDown()) eq.chrIdx = (eq.chrIdx + 1) % this.playerParams.length;
      if (this.input.isOK()) { eq.phase = 'slot'; eq.slot = 0; }
      if (this.input.isCancel()) { this.equipMenu = null; }
    } else if (eq.phase === 'slot') {
      // Select equipment slot: 5 slots (no gem — gem is separate menu)
      const p = this.playerParams[eq.chrIdx];
      const slotLabel2 = eq.chrIdx === 2 ? '手袋' : '盾　';
      const slots = ['武器', '防具', slotLabel2, '装飾', '装飾'];
      if (this.input.isUp()) eq.slot = (eq.slot - 1 + slots.length) % slots.length;
      if (this.input.isDown()) eq.slot = (eq.slot + 1) % slots.length;
      if (this.input.isOK()) {
        eq.phase = 'item';
        eq.itemCursor = 0;
      }
      if (this.input.isCancel()) { eq.phase = 'chr'; }
    } else if (eq.phase === 'item') {
      // Select item to equip from inventory
      // kind: 1=weapon, 2=armor, 3=shield, 4=accessory
      const kindMap = [1, 2, 3, 4, 4];
      const slotKind = kindMap[eq.slot] || 1;
      const equippable = this.eventManager.inventory
        .map((idx, i) => ({ invIdx: i, item: this.paramAll.getItem(idx), idx }))
        .filter(e => e.item && e.item.kind === slotKind);
      equippable.unshift({ invIdx: -1, item: { name: 'はずす' }, idx: -1 });

      if (equippable.length === 0) { eq.phase = 'slot'; return; }
      if (eq.itemCursor >= equippable.length) eq.itemCursor = equippable.length - 1;
      if (this.input.isUp()) eq.itemCursor = (eq.itemCursor - 1 + equippable.length) % equippable.length;
      if (this.input.isDown()) eq.itemCursor = (eq.itemCursor + 1) % equippable.length;
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
    player.str = Math.max(1, player.str + item.str);
    player.int_ = Math.max(1, player.int_ + item.int_);
    player.def = Math.max(0, player.def + item.def);
    player.agi = Math.max(1, player.agi + item.agi);
    player.dex = Math.max(1, player.dex + item.dex);
  }

  unapplyEquip(player, itemIdx) {
    const item = this.paramAll.getItem(itemIdx);
    if (!item) return;
    player.str = Math.max(1, player.str - item.str);
    player.int_ = Math.max(1, player.int_ - item.int_);
    player.def = Math.max(0, player.def - item.def);
    player.agi = Math.max(1, player.agi - item.agi);
    player.dex = Math.max(1, player.dex - item.dex);
  }

  // Gem restriction check (matching original CGemData.IsEquip)
  // Returns: 0=can equip, 1=already bound to this char, 2=cannot equip
  getGemRestriction(gemIdx, chrIdx) {
    const p = this.playerParams[chrIdx];
    const gemId = gemIdx - 110;
    // Already bound to this character
    if (p.gemFlags && p.gemFlags[gemId]) return 1;
    // Currently equipped by this character
    if (p.gem === gemIdx) return 1;
    // Check if bound to another character
    for (let i = 0; i < this.playerParams.length; i++) {
      if (i === chrIdx) continue;
      const other = this.playerParams[i];
      if (other.gemFlags && other.gemFlags[gemId]) return 2;
    }
    // Character-specific restrictions (from original)
    if (gemIdx === 120 && chrIdx !== 0) return 2; // 主人公専用
    if (gemIdx === 124 && chrIdx !== 2) return 2; // かるび専用
    if (gemIdx === 125 && chrIdx !== 1) return 2; // うな専用
    return 0;
  }

  // Get gem growth progress: current AP / max AP for next skill
  getGemProgress(player, gemIdx) {
    if (!player.gemAP) player.gemAP = {};
    const ap = player.gemAP[gemIdx] || 0;
    // GEM_DATA: 7 skills per gem, each has [threshold, skillId]
    const GEM_DATA = [25,16,55,0,90,26,130,17,175,18,225,19,300,15,25,26,55,27,90,4,130,28,175,29,225,37,300,110,25,0,55,17,90,4,130,20,175,8,225,21,300,22,25,10,55,1001,90,88,130,27,175,12,225,89,300,105,25,39,55,40,90,41,130,6,175,42,225,43,300,44,25,1000,55,12,90,104,130,2,175,103,225,6,300,102,30,68,65,69,105,70,150,71,200,72,255,73,330,74,35,50,75,51,120,6,170,52,225,53,285,54,380,55,40,82,95,83,135,84,190,3,250,85,315,86,400,87,50,30,95,11,155,90,220,1002,290,31,370,13,500,33,50,50,95,90,155,51,220,62,290,1,370,52,500,65,60,45,130,46,210,3,300,47,400,48,520,7,670,49,70,23,150,1,240,5,340,24,550,9,670,109,800,25,70,31,150,32,240,5,340,38,550,34,670,36,800,111,80,56,170,97,270,93,380,57,600,7,730,58,870,59,80,75,170,76,270,91,380,77,600,78,730,11,870,79,80,55,170,94,270,63,380,5,600,35,730,106,870,66];
    const gemId = gemIdx - 110;
    if (gemId < 0 || gemId >= 17) return { ap, maxAP: 300, learned: 0, total: 7 };
    let learned = 0;
    let nextThreshold = 999;
    for (let i = 0; i < 7; i++) {
      const threshold = GEM_DATA[gemId * 14 + i * 2];
      if (ap >= threshold) learned++;
      else if (threshold < nextThreshold) nextThreshold = threshold;
    }
    const maxAP = GEM_DATA[gemId * 14 + 6 * 2]; // last skill's threshold
    return { ap, maxAP, learned, total: 7, nextThreshold };
  }

  _getGemData() {
    return [25,16,55,0,90,26,130,17,175,18,225,19,300,15,25,26,55,27,90,4,130,28,175,29,225,37,300,110,25,0,55,17,90,4,130,20,175,8,225,21,300,22,25,10,55,1001,90,88,130,27,175,12,225,89,300,105,25,39,55,40,90,41,130,6,175,42,225,43,300,44,25,1000,55,12,90,104,130,2,175,103,225,6,300,102,30,68,65,69,105,70,150,71,200,72,255,73,330,74,35,50,75,51,120,6,170,52,225,53,285,54,380,55,40,82,95,83,135,84,190,3,250,85,315,86,400,87,50,30,95,11,155,90,220,1002,290,31,370,13,500,33,50,50,95,90,155,51,220,62,290,1,370,52,500,65,60,45,130,46,210,3,300,47,400,48,520,7,670,49,70,23,150,1,240,5,340,24,550,9,670,109,800,25,70,31,150,32,240,5,340,38,550,34,670,36,800,111,80,56,170,97,270,93,380,57,600,7,730,58,870,59,80,75,170,76,270,91,380,77,600,78,730,11,870,79,80,55,170,94,270,63,380,5,600,35,730,106,870,66];
  }

  _getGemSkillName(skillId) {
    if (skillId === 1000) return '戦闘アイテム';
    if (skillId === 1001) return '盗む';
    if (skillId === 1002) return 'ぶん取る';
    // Try to get from paramAll skills
    const skill = this.paramAll.getSkill(skillId);
    if (skill && skill.name) return skill.name.trim();
    // Fallback names for common ability IDs
    const abilityNames = {
      0:'ファイア',1:'ヒール',2:'逃走成功率UP',3:'ガード',4:'MP回復',5:'HP回復',
      6:'全体攻撃',7:'全体回復',8:'リジェネ',9:'リレイズ',10:'アイテム強化',
      11:'カウンター',12:'二回攻撃',13:'即死攻撃',15:'AP1.3倍',
      16:'炎攻撃',17:'氷攻撃',18:'雷攻撃',19:'風攻撃',20:'水攻撃',21:'土攻撃',22:'闇攻撃',
      23:'聖攻撃',24:'無属性攻撃',25:'究極攻撃',26:'炎耐性',27:'氷耐性',28:'雷耐性',29:'風耐性',
      30:'毒攻撃',31:'石化攻撃',32:'麻痺攻撃',33:'即死耐性',34:'石化耐性',35:'全状態耐性',
      36:'吸収攻撃',37:'全体炎',38:'全体氷',39:'小回復',40:'中回復',41:'大回復',42:'全体小回復',
      43:'全体中回復',44:'全体大回復',45:'攻撃UP',46:'防御UP',47:'素早さUP',48:'全能力UP',
      49:'究極バフ',50:'連続斬り',51:'強斬り',52:'必殺斬り',53:'乱れ斬り',54:'奥義斬り',55:'極意斬り',
      56:'火炎弾',57:'氷結弾',58:'雷撃弾',59:'暴風弾',
      62:'会心率UP',63:'回避率UP',65:'EXP1.5倍',66:'ゴールド2倍',
      68:'初級魔法',69:'中級魔法',70:'上級魔法',71:'超級魔法',72:'炎魔法',73:'氷魔法',74:'雷魔法',
      75:'連撃',76:'強撃',77:'必殺撃',78:'乱撃',79:'奥義撃',
      80:'大火炎',82:'火球',83:'火柱',84:'火炎嵐',85:'灼熱',86:'煉獄',87:'業火',
      88:'毒攻撃',89:'猛毒攻撃',90:'石化',91:'麻痺',93:'暗闇',94:'混乱',
      97:'デスペル',102:'盗む強化',103:'逃走確実',104:'先制攻撃',105:'アイテム効果2倍',
      106:'状態異常耐性',109:'全体蘇生',110:'全体大回復',111:'究極魔法',
    };
    return abilityNames[skillId] || `スキル${skillId}`;
  }

  _getGemSkillDesc(skillId) {
    if (skillId === 1000) return '戦闘中にアイテムが使える';
    if (skillId === 1001) return '敵からアイテムを盗む';
    if (skillId === 1002) return '敵からアイテムを強奪する';
    const descMap = {
      0:'単体に炎ダメージ',1:'味方1人のHPを回復',2:'逃走の成功率が上がる',3:'ダメージを半減する',
      4:'毎ターンMPが少し回復',5:'毎ターンHPが少し回復',6:'敵全体に物理攻撃',7:'味方全体のHPを回復',
      8:'毎ターンHP自動回復',9:'戦闘不能時に自動復活',10:'回復アイテムの効果UP',
      11:'攻撃を受けた時に反撃',12:'通常攻撃が2回になる',13:'一定確率で即死させる',15:'AP獲得量1.3倍',
      16:'炎属性の攻撃魔法',17:'氷属性の攻撃魔法',18:'雷属性の攻撃魔法',19:'風属性の攻撃魔法',
      20:'水属性の攻撃魔法',21:'土属性の攻撃魔法',22:'闇属性の攻撃魔法',
      23:'聖属性の攻撃魔法',24:'無属性の強力な魔法',25:'最強の攻撃魔法',
      26:'炎ダメージを軽減',27:'氷ダメージを軽減',28:'雷ダメージを軽減',29:'風ダメージを軽減',
      30:'攻撃時に毒を付与',31:'攻撃時に石化を付与',32:'攻撃時に麻痺を付与',33:'即死攻撃を無効化',
      34:'石化を無効化',35:'全ての状態異常を無効化',36:'与ダメージの一部をHP吸収',
      37:'敵全体に炎ダメージ',38:'敵全体に氷ダメージ',
      39:'少量のHP回復',40:'中量のHP回復',41:'大量のHP回復',
      42:'味方全体を少し回復',43:'味方全体を中回復',44:'味方全体を大回復',
      45:'攻撃力を一時的に上昇',46:'防御力を一時的に上昇',47:'素早さを一時的に上昇',
      48:'全能力を一時的に上昇',49:'全能力を大幅に上昇',
      50:'2連続の斬撃',51:'強力な一撃',52:'必殺の一撃',53:'ランダム4回攻撃',54:'奥義の一撃',55:'極意の一撃',
      56:'炎の弾を放つ',57:'氷の弾を放つ',58:'雷の弾を放つ',59:'暴風の弾を放つ',
      62:'会心の一撃が出やすくなる',63:'敵の攻撃を回避しやすくなる',65:'獲得EXPが1.5倍',66:'獲得ゴールドが2倍',
      68:'基本的な攻撃魔法',69:'中級の攻撃魔法',70:'上級の攻撃魔法',71:'超級の攻撃魔法',
      72:'強力な炎魔法',73:'強力な氷魔法',74:'強力な雷魔法',
      75:'2連続攻撃',76:'強力な打撃',77:'必殺の打撃',78:'乱れ打ち',79:'奥義の打撃',
      82:'火の玉を放つ',83:'火柱を立てる',84:'炎の嵐',85:'灼熱の炎',86:'煉獄の炎',87:'業火の炎',
      88:'毒を付与する攻撃',89:'猛毒を付与する攻撃',90:'石化させる魔法',91:'麻痺させる魔法',
      93:'暗闇にする魔法',94:'混乱させる魔法',97:'魔法効果を解除',
      102:'盗む成功率UP',103:'逃走が必ず成功する',104:'先制攻撃しやすくなる',105:'アイテム効果2倍',
      106:'状態異常にかかりにくい',109:'味方全体を蘇生',110:'味方全体を大回復',111:'最強の魔法',
    };
    return descMap[skillId] || '';
  }

  drawMenu() {
    const ctx = this.ctx;
    this.field.draw();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, 400, 320);

    // Menu panel
    const mx = 10, my = 10, mw = 110, mh = 240;
    ctx.fillStyle = 'rgba(0,0,60,0.92)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#88f';
    ctx.lineWidth = 2;
    ctx.strokeRect(mx, my, mw, mh);

    const items = ['アイテム', '特技', '装備', '勾玉', 'ステータス', 'コマンド', '設定', 'マップ', 'セーブ', 'じゅもん', 'タイトルへ', '閉じる'];
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = i === this.menuCursor ? '#ff0' : '#fff';
      const prefix = i === this.menuCursor ? '▶' : '  ';
      ctx.fillText(prefix + items[i], mx + 6, my + 18 + i * 18);
    }

    // Password display overlay
    if (this.passwordDisplay) {
      ctx.fillStyle = 'rgba(0,0,40,0.95)';
      ctx.fillRect(20, 20, 360, 280);
      ctx.strokeStyle = '#8af';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 360, 280);
      ctx.fillStyle = '#fd0';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ふっかつのじゅもん', 200, 45);
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      const lines = this.passwordDisplay.split('\n').filter(l => l.length > 0);
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 200, 70 + i * 30);
      }
      ctx.fillStyle = '#aaa';
      ctx.font = '10px sans-serif';
      ctx.fillText('ボタンを押して閉じる', 200, 280);
      ctx.textAlign = 'left';
      return;
    }

    // Item list sub-menu overlay
    if (this.itemMenu) {
      this.drawItemMenu(ctx);
      return;
    }

    // Skill menu overlay
    if (this.skillMenu) {
      this.drawSkillMenu(ctx);
      return;
    }

    // Command config overlay
    if (this.cmdConfig) {
      this.drawCmdConfig(ctx);
      return;
    }

    // Settings overlay
    if (this.settingsMenu) {
      this.drawSettings(ctx);
      return;
    }

    // Gem menu overlay
    if (this.gemMenu) {
      this.drawGemMenu(ctx);
      return;
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
    // Play time
    const hours = Math.floor(this.playTime / 3600);
    const mins = Math.floor((this.playTime % 3600) / 60);
    ctx.fillStyle = '#aaa';
    ctx.fillText(`プレイ時間: ${hours}:${String(mins).padStart(2, '0')}`, sx + 10, py + 20);
  }

  drawGemMenu(ctx) {
    const gm = this.gemMenu;
    const sx = 130, sy = 10, sw = 260, sh = 300;
    ctx.fillStyle = 'rgba(20,0,40,0.95)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#a6f';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';

    if (gm.phase === 'chr') {
      ctx.fillStyle = '#daf';
      ctx.fillText('勾玉を装備するキャラ:', sx + 10, sy + 20);
      for (let i = 0; i < this.playerParams.length; i++) {
        const p = this.playerParams[i];
        ctx.fillStyle = i === gm.chrIdx ? '#ff0' : '#fff';
        let gemInfo = '';
        if (p.gem >= 0) {
          const gemItem = this.paramAll.getItem(p.gem);
          const progress = this.getGemProgress(p, p.gem);
          gemInfo = ` [${gemItem ? gemItem.name.trim() : '?'} ${progress.learned}/${progress.total}]`;
        }
        ctx.fillText((i === gm.chrIdx ? '▶' : '  ') + p.name + gemInfo, sx + 10, sy + 42 + i * 24);
      }

      // Show equipped gem skill details for selected character
      const selP = this.playerParams[gm.chrIdx];
      if (selP.gem >= 0) {
        const gemItem = this.paramAll.getItem(selP.gem);
        const progress = this.getGemProgress(selP, selP.gem);
        ctx.fillStyle = '#a8f';
        ctx.font = '11px sans-serif';
        ctx.fillText(`── ${gemItem ? gemItem.name.trim() : '?'} (${progress.ap}/${progress.maxAP} AP) ──`, sx + 10, sy + 110);

        // Show skill list
        const GEM_DATA = this._getGemData();
        const gemId = selP.gem - 110;
        ctx.font = '10px monospace';
        for (let s = 0; s < 7; s++) {
          const threshold = GEM_DATA[gemId * 14 + s * 2];
          const skillId = GEM_DATA[gemId * 14 + s * 2 + 1];
          const learned = progress.ap >= threshold;
          const skillName = this._getGemSkillName(skillId);
          const skillDesc = this._getGemSkillDesc(skillId);

          ctx.fillStyle = learned ? '#8f8' : (progress.ap >= threshold * 0.7 ? '#cc8' : '#888');
          const mark = learned ? '✓' : '　';
          ctx.fillText(`${mark} ${threshold}AP: ${skillName}`, sx + 12, sy + 130 + s * 22);
          ctx.fillStyle = '#777';
          ctx.font = '9px sans-serif';
          ctx.fillText(`  ${skillDesc}`, sx + 14, sy + 142 + s * 22);
          ctx.font = '10px monospace';
        }
      }
    } else if (gm.phase === 'gem') {
      const p = this.playerParams[gm.chrIdx];
      ctx.fillStyle = '#daf';
      ctx.fillText(`${p.name} の勾玉:`, sx + 10, sy + 20);

      const gems = this.eventManager.inventory
        .map((idx, i) => ({ invIdx: i, item: this.paramAll.getItem(idx), idx }))
        .filter(e => e.item && e.idx >= 110 && e.idx <= 126);
      const available = gems.filter(g => this.getGemRestriction(g.idx, gm.chrIdx) !== 2);
      available.unshift({ invIdx: -1, item: { name: 'はずす' }, idx: -1 });

      for (let i = 0; i < Math.min(10, available.length); i++) {
        const g = available[i];
        ctx.fillStyle = i === gm.cursor ? '#ff0' : '#fff';
        let label = g.item.name ? g.item.name.trim() : 'はずす';
        if (g.idx >= 110) {
          const progress = this.getGemProgress(p, g.idx);
          label += ` (${progress.ap || 0}AP ${progress.learned}/${progress.total})`;
          if (this.getGemRestriction(g.idx, gm.chrIdx) === 1) label += ' ★';
        }
        ctx.fillText((i === gm.cursor ? '▶' : '  ') + label, sx + 10, sy + 42 + i * 22);
      }

      // Current gem info
      if (p.gem >= 0) {
        ctx.fillStyle = '#aaa';
        ctx.font = '10px sans-serif';
        const gemItem = this.paramAll.getItem(p.gem);
        ctx.fillText(`現在: ${gemItem ? gemItem.name.trim() : '?'}`, sx + 10, sy + sh - 15);
      }
    }
  }

  drawItemMenu(ctx) {
    const sx = 130, sy = 10, sw = 260, sh = 300;
    ctx.fillStyle = 'rgba(0,0,60,0.95)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#8a8';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    ctx.fillStyle = '#afc';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('アイテム (X:閉じる / A:使う)', sx + 10, sy + 18);

    // Build item list
    const inv = this.eventManager.inventory;
    const itemMap = {};
    for (const idx of inv) { itemMap[idx] = (itemMap[idx] || 0) + 1; }
    const itemList = Object.entries(itemMap).map(([idx, count]) => {
      const item = this.paramAll.getItem(Number(idx));
      return { idx: Number(idx), name: item ? item.name.trim() : '???', count, kind: item ? item.kind : -1 };
    });

    if (itemList.length === 0) {
      ctx.fillStyle = '#888';
      ctx.fillText('アイテムを持っていない', sx + 10, sy + 50);
      return;
    }

    const maxShow = 12;
    const startIdx = Math.max(0, (this.itemMenu.cursor || 0) - maxShow + 1);
    ctx.font = '11px sans-serif';
    for (let i = 0; i < maxShow && startIdx + i < itemList.length; i++) {
      const idx = startIdx + i;
      const it = itemList[idx];
      ctx.fillStyle = idx === this.itemMenu.cursor ? '#ff0' : '#fff';
      const prefix = idx === this.itemMenu.cursor ? '▶' : '  ';
      const kindLabel = it.kind === 0 ? '消' : it.kind === 1 ? '武' : it.kind === 2 ? '防' : it.kind === 3 ? '飾' : '？';
      ctx.textAlign = 'left';
      ctx.fillText(`${prefix}[${kindLabel}]${it.name}`, sx + 8, sy + 38 + i * 20);
      ctx.textAlign = 'right';
      ctx.fillText(`×${it.count}`, sx + sw - 10, sy + 38 + i * 20);
    }
    ctx.textAlign = 'left';

    // Help text for selected item
    const itemMap2 = {};
    for (const idx of this.eventManager.inventory) { itemMap2[idx] = (itemMap2[idx] || 0) + 1; }
    const itemList2 = Object.entries(itemMap2).map(([idx]) => Number(idx));
    if (itemList2.length > 0 && this.itemMenu.cursor < itemList2.length) {
      const selItem = this.paramAll.getItem(itemList2[this.itemMenu.cursor]);
      if (selItem && selItem.help < this.paramAll.helps.length) {
        const helpText = this.paramAll.helps[selItem.help];
        if (helpText && helpText.trim()) {
          ctx.fillStyle = 'rgba(0,0,40,0.9)';
          ctx.fillRect(sx, sy + sh - 30, sw, 25);
          ctx.fillStyle = '#ccc';
          ctx.font = '10px sans-serif';
          ctx.fillText(helpText.trim(), sx + 8, sy + sh - 13);
        }
      }
    }
  }

  drawSkillMenu(ctx) {
    const sm = this.skillMenu;
    const sx = 130, sy = 10, sw = 260, sh = 300;
    ctx.fillStyle = 'rgba(0,20,40,0.95)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#8af';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';

    if (sm.phase === 'chr') {
      ctx.fillStyle = '#adf';
      ctx.fillText('特技を使うキャラ:', sx + 10, sy + 20);
      for (let i = 0; i < this.playerParams.length; i++) {
        const p = this.playerParams[i];
        ctx.fillStyle = i === sm.chrIdx ? '#ff0' : '#fff';
        ctx.fillText((i === sm.chrIdx ? '▶' : '  ') + `${p.name}  MP:${p.mp}/${p.maxMP}`, sx + 10, sy + 42 + i * 22);
      }
    } else if (sm.phase === 'skill' || sm.phase === 'target') {
      const p = this.playerParams[sm.chrIdx];
      ctx.fillStyle = '#ff0';
      ctx.fillText(`${p.name} の特技 (MP:${p.mp}/${p.maxMP})`, sx + 10, sy + 20);

      // Build skill list
      const skills = [];
      for (let i = 0; i < Math.min(30, this.paramAll.skills.length); i++) {
        const s = this.paramAll.skills[i];
        if (s && s.name && s.name.trim() && s.mp > 0) {
          skills.push({ ...s, index: i });
        }
      }

      const maxShow = 10;
      for (let i = 0; i < Math.min(maxShow, skills.length); i++) {
        const s = skills[i];
        const canUse = s.kind === 1 && p.mp >= s.mp;
        ctx.fillStyle = i === sm.skillIdx ? '#ff0' : (canUse ? '#fff' : '#666');
        const prefix = i === sm.skillIdx ? '▶' : '  ';
        const kindLabel = s.kind === 0 ? '攻' : s.kind === 1 ? '回' : s.kind === 2 ? '強' : s.kind === 3 ? '弱' : '状';
        ctx.fillText(`${prefix}[${kindLabel}]${s.name.trim()} MP${s.mp}`, sx + 10, sy + 42 + i * 22);
      }

      // Hint
      // Help text for selected skill
      if (sm.skillIdx < skills.length) {
        const selSkill = skills[sm.skillIdx];
        if (selSkill.help < this.paramAll.helps.length) {
          const helpText = this.paramAll.helps[selSkill.help];
          if (helpText && helpText.trim()) {
            ctx.fillStyle = '#aaa';
            ctx.font = '10px sans-serif';
            ctx.fillText(helpText.trim(), sx + 10, sy + sh - 30);
          }
        }
      }
      ctx.fillStyle = '#666';
      ctx.font = '9px sans-serif';
      ctx.fillText('※フィールドでは回復魔法のみ使用可', sx + 10, sy + sh - 15);

      // Target selection overlay
      if (sm.phase === 'target') {
        ctx.fillStyle = 'rgba(0,0,60,0.9)';
        ctx.fillRect(sx + 140, sy + 30, 110, 80);
        ctx.strokeStyle = '#4f8';
        ctx.strokeRect(sx + 140, sy + 30, 110, 80);
        ctx.fillStyle = '#4f8';
        ctx.font = '11px sans-serif';
        ctx.fillText('回復対象:', sx + 148, sy + 48);
        for (let i = 0; i < this.playerParams.length; i++) {
          const t = this.playerParams[i];
          ctx.fillStyle = i === sm.targetIdx ? '#ff0' : '#fff';
          ctx.fillText((i === sm.targetIdx ? '▶' : '  ') + `${t.name} ${t.hp}/${t.maxHP}`, sx + 148, sy + 66 + i * 18);
        }
      }
    }
  }

  drawCmdConfig(ctx) {
    const cc = this.cmdConfig;
    const CMD_OPTIONS = ['こうげき', 'まほう', 'アイテム', 'ぼうぎょ', '盗む', 'ぶん取る', 'にげる'];
    const CMD_IDS = [1, 9, 10, 2, 3, 4, 5];
    const sx = 130, sy = 10, sw = 260, sh = 300;
    ctx.fillStyle = 'rgba(0,10,40,0.95)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#a8f';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';

    if (cc.phase === 'chr') {
      ctx.fillStyle = '#daf';
      ctx.fillText('戦闘コマンド設定:', sx + 10, sy + 20);
      for (let i = 0; i < this.playerParams.length; i++) {
        const p = this.playerParams[i];
        ctx.fillStyle = i === cc.chrIdx ? '#ff0' : '#fff';
        ctx.fillText((i === cc.chrIdx ? '▶' : '  ') + p.name, sx + 10, sy + 42 + i * 22);
      }
    } else if (cc.phase === 'slot') {
      const p = this.playerParams[cc.chrIdx];
      const slots = p.cmdSlots || [1, 9, 10, 2];
      ctx.fillStyle = '#ff0';
      ctx.fillText(`${p.name} のコマンド:`, sx + 10, sy + 20);
      for (let i = 0; i < 4; i++) {
        const cmdId = slots[i];
        const cmdIdx = CMD_IDS.indexOf(cmdId);
        const label = cmdIdx >= 0 ? CMD_OPTIONS[cmdIdx] : '---';
        ctx.fillStyle = i === cc.slot ? '#ff0' : '#fff';
        ctx.fillText((i === cc.slot ? '▶' : '  ') + `スロット${i + 1}: ${label}`, sx + 10, sy + 42 + i * 24);
      }
      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.fillText('A:変更 / B:戻る', sx + 10, sy + sh - 15);
    } else if (cc.phase === 'select') {
      ctx.fillStyle = '#daf';
      ctx.fillText(`スロット${cc.slot + 1}に設定:`, sx + 10, sy + 20);
      for (let i = 0; i < CMD_OPTIONS.length; i++) {
        ctx.fillStyle = i === cc.optCursor ? '#ff0' : '#fff';
        ctx.fillText((i === cc.optCursor ? '▶' : '  ') + CMD_OPTIONS[i], sx + 10, sy + 42 + i * 20);
      }
    }
  }

  drawSettings(ctx) {
    const sm = this.settingsMenu;
    const sx = 130, sy = 50, sw = 260, sh = 220;
    ctx.fillStyle = 'rgba(0,10,30,0.95)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#8af';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('設定', sx + 10, sy + 22);

    // SE Volume
    const vol = Math.round(this.audio.volume * 100);
    ctx.fillStyle = sm.cursor === 0 ? '#ff0' : '#ccc';
    ctx.fillText((sm.cursor === 0 ? '▶' : '  ') + `SE音量: ${vol}%`, sx + 10, sy + 55);
    ctx.fillStyle = '#333';
    ctx.fillRect(sx + 130, sy + 45, 100, 10);
    ctx.fillStyle = '#4af';
    ctx.fillRect(sx + 130, sy + 45, 100 * this.audio.volume, 10);

    // Battle speed
    const speedLabels = ['おそい', 'ふつう', 'はやい', '瞬間'];
    ctx.fillStyle = sm.cursor === 1 ? '#ff0' : '#ccc';
    ctx.fillText((sm.cursor === 1 ? '▶' : '  ') + `戦闘速度: ${speedLabels[this.battleSpeed]}`, sx + 10, sy + 90);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i <= this.battleSpeed ? '#fc8' : '#444';
      ctx.fillRect(sx + 150 + i * 22, sy + 82, 16, 8);
    }

    // Encounter rate
    const encLabels = ['なし', 'ひくい', 'ふつう', 'たかい'];
    ctx.fillStyle = sm.cursor === 2 ? '#ff0' : '#ccc';
    ctx.fillText((sm.cursor === 2 ? '▶' : '  ') + `エンカウント: ${encLabels[this.encounterRate]}`, sx + 10, sy + 125);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i <= this.encounterRate ? '#f84' : '#444';
      ctx.fillRect(sx + 170 + i * 22, sy + 117, 16, 8);
    }

    // Back
    ctx.fillStyle = sm.cursor === 3 ? '#ff0' : '#ccc';
    ctx.fillText((sm.cursor === 3 ? '▶' : '  ') + '戻る', sx + 10, sy + 165);

    // Hint
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.fillText('←→で値を変更', sx + 10, sy + sh - 12);
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
      const slotLabel2 = eq.chrIdx === 2 ? '手袋' : '盾　';
      const slots = ['武器', '防具', slotLabel2, '装飾', '装飾'];
      for (let i = 0; i < slots.length; i++) {
        ctx.fillStyle = i === eq.slot ? '#ff0' : '#fff';
        const equipped = (p.equip && p.equip[i] >= 0) ? this.paramAll.getItem(p.equip[i]) : null;
        const eqName = equipped ? equipped.name.trim() : 'なし';
        ctx.fillText((i === eq.slot ? '▶' : '  ') + `${slots[i]}: ${eqName}`, sx + 10, sy + 40 + i * 20);
      }
    } else if (eq.phase === 'item') {
      const p = this.playerParams[eq.chrIdx];
      const kindMap = [1, 2, 3, 4, 4];
      const slotKind = kindMap[eq.slot] || 1;
      const equippable = this.eventManager.inventory
        .map((idx, i) => ({ invIdx: i, item: this.paramAll.getItem(idx), idx }))
        .filter(e => e.item && e.item.kind === slotKind);
      equippable.unshift({ invIdx: -1, item: { name: 'はずす', str: 0, int_: 0, def: 0, agi: 0, dex: 0 }, idx: -1 });

      ctx.fillStyle = '#adf';
      ctx.fillText('装備するアイテム:', sx + 10, sy + 20);
      const maxShow = 7;
      const startIdx = Math.max(0, (eq.itemCursor || 0) - maxShow + 1);
      for (let i = 0; i < maxShow && startIdx + i < equippable.length; i++) {
        const idx = startIdx + i;
        const e = equippable[idx];
        ctx.fillStyle = idx === eq.itemCursor ? '#ff0' : '#fff';
        ctx.fillText((idx === eq.itemCursor ? '▶' : '  ') + (e.item.name || '').trim(), sx + 10, sy + 42 + i * 18);
      }

      // Stat comparison for selected item
      const selected = equippable[eq.itemCursor || 0];
      if (selected) {
        const currentEquipIdx = (p.equip && p.equip[eq.slot] >= 0) ? p.equip[eq.slot] : -1;
        const currentItem = currentEquipIdx >= 0 ? this.paramAll.getItem(currentEquipIdx) : null;
        const curStats = { str: currentItem ? currentItem.str : 0, def: currentItem ? currentItem.def : 0, agi: currentItem ? currentItem.agi : 0, dex: currentItem ? currentItem.dex : 0 };
        const newStats = { str: selected.item.str || 0, def: selected.item.def || 0, agi: selected.item.agi || 0, dex: selected.item.dex || 0 };

        const statY = sy + 180;
        ctx.fillStyle = '#aaa';
        ctx.font = '11px sans-serif';
        ctx.fillText('能力変化:', sx + 10, statY);

        const labels = [['攻撃', 'str'], ['防御', 'def'], ['素早', 'agi'], ['命中', 'dex']];
        for (let i = 0; i < labels.length; i++) {
          const [label, key] = labels[i];
          const diff = newStats[key] - curStats[key];
          ctx.fillStyle = '#ccc';
          ctx.fillText(`${label}:`, sx + 10, statY + 18 + i * 16);
          if (diff > 0) {
            ctx.fillStyle = '#4f4';
            ctx.fillText(`+${diff}`, sx + 60, statY + 18 + i * 16);
          } else if (diff < 0) {
            ctx.fillStyle = '#f44';
            ctx.fillText(`${diff}`, sx + 60, statY + 18 + i * 16);
          } else {
            ctx.fillStyle = '#888';
            ctx.fillText('--', sx + 60, statY + 18 + i * 16);
          }
        }
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
    // Fade to black
    const fadeIn = Math.min(1, this.gameOverTimer / 40);
    ctx.fillStyle = `rgba(0,0,0,${fadeIn})`;
    ctx.fillRect(0, 0, 400, 320);

    if (this.gameOverTimer < 10) return;

    const t = Math.min(1, (this.gameOverTimer - 10) / 30);

    // Animated red lines (blood-like)
    ctx.strokeStyle = `rgba(180,0,0,${t * 0.6})`;
    ctx.lineWidth = 1;
    const lineProgress = Math.min(1, (this.gameOverTimer - 10) / 40);
    ctx.beginPath();
    ctx.moveTo(50, 128);
    ctx.lineTo(50 + 300 * lineProgress, 128);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(350 - 300 * lineProgress, 176);
    ctx.lineTo(350, 176);
    ctx.stroke();

    // GAME OVER text with glow
    if (this.gameOverTimer > 20) {
      const textT = Math.min(1, (this.gameOverTimer - 20) / 20);
      // Glow
      ctx.fillStyle = `rgba(100,0,0,${textT * 0.3})`;
      ctx.font = 'bold 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ＧＡＭＥ　ＯＶＥＲ', 200, 160);
      // Main text
      ctx.fillStyle = `rgba(200,50,50,${textT})`;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('ＧＡＭＥ　ＯＶＥＲ', 200, 159);
    }

    if (this.gameOverTimer > 90) {
      const blinkAlpha = 0.4 + Math.sin(this.gameOverTimer * 0.1) * 0.3;
      ctx.fillStyle = `rgba(200,200,200,${blinkAlpha})`;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter でタイトルへ', 200, 250);
    }
  }

  // --- World Map ---
  updateWorldMap() {
    // Ship movement (when player has ship — flag 320 in original)
    if (this.eventManager.flags.has(320) && this.shipMode) {
      if (this.input.isUp()) this.shipZ = Math.max(0, (this.shipZ || 36) - 1);
      if (this.input.isDown()) this.shipZ = Math.min(60, (this.shipZ || 36) + 1);
      if (this.input.isLeft()) this.shipX = Math.max(0, (this.shipX || 17) - 1);
      if (this.input.isRight()) this.shipX = Math.min(60, (this.shipX || 17) + 1);
      if (this.input.isCancel()) { this.shipMode = false; }
      if (this.input.isOK()) {
        // Try to land at current ship position — check if any area matches
        const areas = this.stageManager ? this.stageManager.stages : [];
        for (let i = 0; i < areas.length; i++) {
          const a = areas[i];
          if (a.worldMapX === 65535) continue;
          if (Math.abs(a.worldMapX - this.shipX) <= 2 && Math.abs(a.worldMapZ - this.shipZ) <= 2) {
            // Land at this area
            this.currentArea = i;
            const area = this.stageManager.stages[i];
            this.field.setArea(area);
            this.field.playerPos.x = MapData.getXPos(16);
            this.field.playerPos.z = MapData.getZPos(16);
            this.shipMode = false;
            this.state = 'game';
            return;
          }
        }
      }
      return;
    }

    if (this.input.isOK()) {
      // If player has ship, pressing OK enters ship mode
      if (this.eventManager.flags.has(320)) {
        this.shipMode = true;
        if (!this.shipX) this.shipX = 17;
        if (!this.shipZ) this.shipZ = 36;
      } else {
        this.state = 'menu';
      }
    }
    if (this.input.isCancel()) {
      this.state = 'menu';
    }
  }

  drawWorldMap() {
    const ctx = this.ctx;

    // Draw world map image (image31 is the map in original)
    if (this.images && this.images[31]) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 400, 320);
      ctx.drawImage(this.images[31], 44, 14);
    } else {
      // Fallback: draw a stylized map representation
      // Ocean background
      const grad = ctx.createLinearGradient(0, 0, 0, 320);
      grad.addColorStop(0, '#0a1a3a');
      grad.addColorStop(1, '#0a2a4a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 320);

      // Draw visited areas as connected nodes
      const areas = this.stageManager ? this.stageManager.stages : [];
      const nodes = [];
      for (let i = 0; i < areas.length; i++) {
        const a = areas[i];
        if (a.worldMapX === 65535 || a.worldMapZ === 65535) continue;
        // Scale world map coords to screen
        const sx = 30 + (a.worldMapX - 2) * 5;
        const sz = 20 + (a.worldMapZ - 3) * 5;
        if (sx > 10 && sx < 390 && sz > 10 && sz < 310) {
          nodes.push({ x: sx, z: sz, idx: i, visited: this.eventManager.flags.has(300 + i) || i === this.currentArea });
        }
      }

      // Draw connections between adjacent nodes
      ctx.strokeStyle = 'rgba(100,150,100,0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dz = nodes[i].z - nodes[j].z;
          if (Math.abs(dx) < 30 && Math.abs(dz) < 30) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].z);
            ctx.lineTo(nodes[j].x, nodes[j].z);
            ctx.stroke();
          }
        }
      }

      // Draw area nodes
      for (const node of nodes) {
        const isCurrent = node.idx === this.currentArea;
        if (isCurrent) {
          ctx.fillStyle = '#4f4';
          ctx.beginPath();
          ctx.arc(node.x, node.z, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (node.visited) {
          ctx.fillStyle = '#486';
          ctx.beginPath();
          ctx.arc(node.x, node.z, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(node.x, node.z, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Player position (blinking)
      const area = this.field.area;
      if (area && area.worldMapX !== 65535 && area.worldMapZ !== 65535) {
        const px = 30 + (area.worldMapX - 2) * 5;
        const pz = 20 + (area.worldMapZ - 3) * 5;
        const blink = (this.frameCount & 8) ? 1 : 0;
        ctx.fillStyle = blink ? '#f44' : '#ff0';
        ctx.beginPath();
        ctx.arc(px, pz, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Title bar
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, 400, 18);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ワールドマップ', 200, 13);

    // Current area info
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 300, 400, 20);
    ctx.fillStyle = '#8f8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    const areaName = `エリア ${this.currentArea || 0}`;

    // Draw ship if player has it
    if (this.eventManager.flags.has(320)) {
      const sx = 30 + ((this.shipX || 17) - 2) * 5;
      const sz = 20 + ((this.shipZ || 36) - 3) * 5;
      // Ship icon (blinking triangle)
      ctx.fillStyle = (this.frameCount & 8) ? '#4af' : '#8cf';
      ctx.beginPath();
      ctx.moveTo(sx, sz - 4);
      ctx.lineTo(sx + 4, sz + 3);
      ctx.lineTo(sx - 4, sz + 3);
      ctx.closePath();
      ctx.fill();

      if (this.shipMode) {
        ctx.fillStyle = '#4af';
        ctx.fillText(`船移動中 (方向キーで移動 / A:着陸 / B:戻る)`, 200, 314);
      } else {
        ctx.fillStyle = '#8f8';
        ctx.fillText(`現在地: ${areaName}  (A:船に乗る / B:閉じる)`, 200, 314);
      }
    } else {
      ctx.fillStyle = '#8f8';
      ctx.fillText(`現在地: ${areaName}  (Enter/Xで閉じる)`, 200, 314);
    }
  }

  // --- Save / Load ---

  resetNewGame() {
    // Reset to initial game state (matching original CInitGame)
    this.playerParams = [];
    if (this.paramAll.chrParams.length >= 1) {
      const p0 = this.paramAll.chrParams[0].clone();
      p0.isPlayer = true;
      p0.equip = [-1, -1, -1, -1, -1];
      p0.abi1 = 1;   // Original: m_anCmdAb[0] = 1
      p0.abi2 = 10;  // Original: m_anCmdAb[1] = 10
      this.playerParams.push(p0);
    }
    // Prepare party members 1 (うな, chrParams[21]) and 2 (かるび, chrParams[28])
    // They join via E.PARTY events when flags 1/2 are set
    this.gold = 1000;
    this.eventManager.flags = new Set();
    this.eventManager.inventory = []; // No initial items (いちご obtained from NPC)
    this.eventManager.gold = 1000;
    this.field.eventFlags = this.eventManager.flags;
    this.playTime = 0;

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
    this.updateFieldPartyModels();
  }

  saveGame(silent = false) {
    const data = {
      playerParams: this.playerParams.map(p => ({
        index: p.index, name: p.name, lv: p.lv, hp: p.hp, maxHP: p.maxHP,
        mp: p.mp, maxMP: p.maxMP, str: p.str, int_: p.int_, def: p.def,
        agi: p.agi, dex: p.dex, exp: p.exp, pat: p.pat, algo: p.algo,
        add: p.add || 0, abi1: p.abi1, abi2: p.abi2,
        equip: p.equip || [-1,-1,-1,-1,-1],
        gem: p.gem !== undefined ? p.gem : -1,
        gemFlags: p.gemFlags || {}, gemAP: p.gemAP || {},
        cmdSlots: p.cmdSlots || null,
      })),
      gold: this.gold || 0,
      area: this.currentArea,
      px: this.field.playerPos.x,
      pz: this.field.playerPos.z,
      pvect: this.field.playerVect,
      flags: [...this.eventManager.flags],
      inventory: this.eventManager.inventory,
      playTime: Math.floor(this.playTime),
      stealthCounter: this.stealthCounter || 0,
    };
    localStorage.setItem('suika_save', JSON.stringify(data));
    if (!silent) {
      this.audio.play(10); // SE: save
      if (this.messageWindow) this.messageWindow.show('セーブしました');
    }
  }

  generatePassword() {
    // Build game state for password encoding
    const posX = MapData.getXBlock(this.field.playerPos.x);
    const posZ = MapData.getZBlock(this.field.playerPos.z);
    const vect = Math.round(this.field.playerVect / (Math.PI / 2)) & 3;

    const characters = this.playerParams.map(p => ({
      exp: p.exp || 0,
      ap: (p.gemAP && p.gem >= 0) ? (p.gemAP[p.gem] || 0) : 0,
      gem: p.gem !== undefined ? p.gem : -1,
      gemFlags: [0, 0, 0], // simplified
      equip: p.equip || [-1, -1, -1, -1, -1],
      abiM: new Array(19).fill(0),
      abiC: [0, 0],
      cmdAb: [p.abi1 || 0, p.abi2 || 0, 0, 0],
      hp: p.hp || 0,
      mp: p.mp || 0,
    }));

    // Build items array (150 slots, count per index)
    const items = new Array(150).fill(0);
    for (const idx of this.eventManager.inventory) {
      if (idx >= 0 && idx < 150) items[idx]++;
    }

    // Build flags array
    const flags = [...this.eventManager.flags];

    const gameState = {
      playerNameIdx: [117, 118, 119, 120], // 西瓜太郎 (default)
      areaNo: this.currentArea || 0,
      posX, posZ, vect,
      gold: this.gold || 0,
      characters, items, flags,
      shipX: 17, shipZ: 36, shipV: 1,
    };

    const pw = this.passwordSystem.generate(gameState);
    this.passwordDisplay = pw;
    this.audio.play(10);
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
      this.playTime = data.playTime || 0;

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
      this.updateFieldPartyModels();
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }
}

const game = new SuikaGame();
window._suikaGame = game; // Expose for navigation guard
game.init();

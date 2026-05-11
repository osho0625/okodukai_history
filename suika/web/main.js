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

class SuikaGame {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.renderer = new Renderer();
    this.input = new Input(this.canvas);
    this.loop = new GameLoop(90);
    this.loader = new AssetLoader(new URL('../', import.meta.url).href);

    this.images = [];
    this.models = [];
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
        // Track gold (simplified)
        this.gold = (this.gold || 0) + amount;
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
        this.drawTitle();
        if (this.input.isOK()) this.state = 'game';
        break;
      case 'game':
        this.updateGame();
        this.drawGame();
        break;
      case 'battle':
        this.updateBattle();
        this.drawBattle();
        break;
    }
  }

  drawTitle() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, 400, 320);
    if (this.images[31]) this.ctx.drawImage(this.images[31], 0, 0);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('すいかが食べたい', 200, 140);
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText('Press Enter to Start', 200, 200);
    this.ctx.fillText('HTML5 Port', 200, 280);
  }

  updateGame() {
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

    // Talk to NPC (Enter/Space)
    if (this.input.isKeyDown('enter') || this.input.isKeyDown(' ')) {
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

    // Camera rotation (A/S keys)
    if (this.input.isKeyDown('a')) this.field.rotateCameraLeft();
    if (this.input.isKeyDown('s')) this.field.rotateCameraRight();

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
      // Apply EXP (simplified: just add to first alive player)
      if (result === BATTLE_RESULT.WIN && exp > 0) {
        for (const p of this.playerParams) {
          if (p.hp > 0) {
            p.exp = (p.exp || 0) + exp;
            break;
          }
        }
        this.gold = (this.gold || 0) + gold;
      }
      // Return to field after a short delay
      setTimeout(() => {
        this.state = 'game';
        this.battleEngine = null;
        this.battleUI = null;
      }, 1500);
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

    // Message window (on top of everything)
    this.messageWindow.draw();
    this.choiceWindow.draw();

    // HUD overlay
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    const map = this.field.area ? this.field.area.map : null;
    const bx = map ? MapData.getXBlock(this.field.playerPos.x) : 0;
    const bz = map ? MapData.getZBlock(this.field.playerPos.z) : 0;
    const hit = map ? map.hit[map.getPtr(Math.max(0,Math.min(bx,map.xNum-1)), Math.max(0,Math.min(bz,map.zNum-1)))] : '?';
    this.ctx.fillText(`Area:${this.currentArea} Pos:${bx},${bz} Hit:${hit}`, 4, 12);
    if (!this.messageWindow.visible) {
      this.ctx.fillText('矢印:移動 A/S:カメラ Enter:話す B:戦闘テスト', 4, 310);
    }
  }
}

const game = new SuikaGame();
game.init();

// stage.js — Stage/Area data (ported from CStageManage, CAreaParam, CMapData)

import { Vec3, Color } from './math.js';

const MAP_CELL_SIZE = 200.0;
const MAP_CELL_HALF = 100.0;

export class MapData {
  constructor() {
    this.xNum = 0;
    this.zNum = 0;
    this.ground = null;   // Uint8Array — ground type per cell
    this.hit = null;      // Uint8Array — collision per cell
    this.mapModel = null; // Uint8Array — map object model index per cell
  }

  create(xNum, zNum) {
    this.xNum = xNum;
    this.zNum = zNum;
    const size = xNum * zNum;
    this.ground = new Uint8Array(size);
    this.hit = new Uint8Array(size);
    this.mapModel = new Uint8Array(size);
  }

  getPtr(x, z) { return x + z * this.xNum; }

  static getXPos(block) { return block * MAP_CELL_SIZE + MAP_CELL_HALF; }
  static getZPos(block) { return block * MAP_CELL_SIZE + MAP_CELL_HALF; }
  static getXBlock(pos) { return Math.floor(pos / MAP_CELL_SIZE); }
  static getZBlock(pos) { return Math.floor(pos / MAP_CELL_SIZE); }

  // Ground model index: groundType + 0 - 1 (models 0-19 are ground tiles)
  static getGroundModel(type) { return type - 1; }
  // Map object model index: mapValue + 20 - 1 (models 20+ are objects)
  static getMapModel(type) { return type + 19; }

  checkHit(pos, radius = 0) {
    if (radius === 0) {
      const bx = MapData.getXBlock(pos.x);
      const bz = MapData.getZBlock(pos.z);
      if (bx < 0 || bx >= this.xNum || bz < 0 || bz >= this.zNum) return 3;
      return this.hit[this.getPtr(bx, bz)];
    }
    // Check 8 directions
    const angles = [0, Math.PI/4, Math.PI/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*3/2, Math.PI*7/4];
    let maxHit = 0;
    for (const a of angles) {
      const testPos = new Vec3(pos.x + Math.sin(a) * radius, 0, pos.z + Math.cos(a) * radius);
      const h = this.checkHit(testPos);
      if (h > maxHit) maxHit = h;
    }
    return maxHit;
  }

  getGround(pos) {
    const bx = MapData.getXBlock(pos.x);
    const bz = MapData.getZBlock(pos.z);
    if (bx < 0 || bx >= this.xNum || bz < 0 || bz >= this.zNum) return 0;
    return this.ground[this.getPtr(bx, bz)];
  }
}

export class AreaParam {
  constructor() {
    this.backColor = new Color();
    this.ambient = new Color();
    this.fogColor = new Color();
    this.fogStart = 0;
    this.fogEnd = 0;
    this.lightMode = 0;
    this.lightRange = 0;
    this.lightPos = new Vec3();
    this.lightColor = new Color();
    this.map = new MapData();
    this.eventNo = 0;
    this.npcs = [];
    this.enemies = [];
    this.scopes = [];
    this.wallEvents = [];
    this.treasures = [];
    this.worldMapX = 0;
    this.worldMapZ = 0;
  }
}

export class StageManager {
  constructor() {
    this.stages = [];
  }

  load(reader) {
    const stageCount = reader.readInt();
    for (let i = 0; i < stageCount; i++) {
      this.stages.push(this.loadArea(reader));
    }
    return true;
  }

  getStage(index) { return this.stages[index]; }

  loadArea(reader) {
    const area = new AreaParam();

    // Colors
    area.backColor.r = reader.readInt();
    area.backColor.g = reader.readInt();
    area.backColor.b = reader.readInt();
    area.ambient.r = reader.readInt();
    area.ambient.g = reader.readInt();
    area.ambient.b = reader.readInt();
    area.fogColor.r = reader.readInt();
    area.fogColor.g = reader.readInt();
    area.fogColor.b = reader.readInt();

    // Fog
    area.fogStart = reader.readFloat();
    area.fogEnd = reader.readFloat();

    // Light
    area.lightMode = reader.readInt();
    area.lightRange = reader.readFloat();
    area.lightPos.x = reader.readFloat();
    area.lightPos.y = reader.readFloat();
    area.lightPos.z = reader.readFloat();
    area.lightColor.r = reader.readInt();
    area.lightColor.g = reader.readInt();
    area.lightColor.b = reader.readInt();

    // Map dimensions
    const mapZNum = reader.readShort() & 0xFFFF;
    const mapXNum = reader.readShort() & 0xFFFF;
    area.map.create(mapXNum, mapZNum);

    // Counts
    const scopeNum = reader.readShort() & 0xFFFF;
    const enemyNum = reader.readShort() & 0xFFFF;
    const wEventNum = reader.readShort() & 0xFFFF;
    const npcNum = reader.readShort() & 0xFFFF;
    area.eventNo = reader.readShort() & 0xFFFF;
    const treasureNum = reader.readShort() & 0xFFFF;
    area.worldMapZ = reader.readShort() & 0xFFFF;
    area.worldMapX = reader.readShort() & 0xFFFF;

    // Ground data: each byte encodes ground type (% 30) and hit (/ 30)
    const mapSize = mapXNum * mapZNum;
    for (let i = 0; i < mapSize; i++) {
      const b = reader.readByte() & 0xFF;
      area.map.ground[i] = b % 30;
      area.map.hit[i] = Math.floor(b / 30);
    }

    // Map model data
    for (let i = 0; i < mapSize; i++) {
      area.map.mapModel[i] = reader.readByte() & 0xFF;
    }

    // Enemies
    for (let i = 0; i < enemyNum; i++) {
      area.enemies.push({
        kind: reader.readShort() & 0xFFFF,
        ifFlag: reader.readShort() & 0xFFFF,
        xPos: reader.readByte() & 0xFF,
        zPos: reader.readByte() & 0xFF,
        xSize: reader.readByte() & 0xFF,
        zSize: reader.readByte() & 0xFF,
        rnd1: reader.readShort() & 0xFFFF,
        rnd2: reader.readShort() & 0xFFFF,
      });
    }

    // Scope events (area transitions, etc.)
    for (let i = 0; i < scopeNum; i++) {
      area.scopes.push({
        kind: reader.readShort() & 0xFFFF,
        ifFlag: reader.readShort() & 0xFFFF,
        xPos: reader.readShort() & 0xFFFF,
        zPos: reader.readShort() & 0xFFFF,
        xSize: reader.readShort() & 0xFFFF,
        zSize: reader.readShort() & 0xFFFF,
        targetArea: reader.readShort() & 0xFFFF,
        targetX: reader.readShort() & 0xFFFF,
        targetZ: reader.readShort() & 0xFFFF,
        targetRot: reader.readShort() & 0xFFFF,
      });
    }

    // NPCs
    for (let i = 0; i < npcNum; i++) {
      area.npcs.push({
        kind: reader.readByte() & 0xFF,
        xPos: reader.readByte() & 0xFF,
        zPos: reader.readByte() & 0xFF,
        vect: reader.readByte() & 0xFF,
        ifFlag: reader.readShort() & 0xFFFF,
        event: reader.readShort() & 0xFFFF,
        mode: reader.readByte() & 0xFF,
        _pad1: reader.readByte(),
        _pad2: reader.readByte(),
        _pad3: reader.readByte(),
      });
    }

    // Wall events
    for (let i = 0; i < wEventNum; i++) {
      area.wallEvents.push({
        xPos: reader.readByte() & 0xFF,
        zPos: reader.readByte() & 0xFF,
        vect: reader.readByte() & 0xFF,
        _pad: reader.readByte(),
        ifFlag: reader.readShort() & 0xFFFF,
        event: reader.readShort() & 0xFFFF,
      });
    }

    // Treasures
    for (let i = 0; i < treasureNum; i++) {
      area.treasures.push({
        xPos: reader.readByte() & 0xFF,
        zPos: reader.readByte() & 0xFF,
        vect: reader.readByte() & 0xFF,
        _pad: reader.readByte(),
        item: reader.readShort() & 0xFFFF,
        flag: reader.readShort() & 0xFFFF,
      });
    }

    return area;
  }
}

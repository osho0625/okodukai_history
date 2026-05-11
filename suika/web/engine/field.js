// field.js — Field rendering and player movement (ported from CDrawMap, CGameMain)

import { Vec3, Color, Mat4 } from './math.js';
import { MapData } from './stage.js';

export class Field {
  constructor(renderer, models) {
    this.renderer = renderer;
    this.models = models;
    this.area = null;
    this.playerPos = new Vec3(100, 0, 100);
    this.playerVect = 0;
    this.cameraVect = Math.PI;
    this.moveSpeed = 40;
    this.playerHitSize = 30;
    this.onAreaChange = null; // callback(areaIdx, x, z, rot)
    this.onTalkNpc = null;   // callback(npc) — when player talks to NPC
    this.onWallEvent = null; // callback(eventNo) — when player bumps into wall event
  }

  setArea(area) {
    this.area = area;
    // Apply area render states
    this.renderer.setRenderState(9, area.backColor.clone());
    this.renderer.setRenderState(10, area.lightColor.clone());
    this.renderer.setRenderState(8, area.ambient.clone());
    this.renderer.ambPowR = area.ambient.r / 255;
    this.renderer.ambPowG = area.ambient.g / 255;
    this.renderer.ambPowB = area.ambient.b / 255;

    if (area.fogStart > 0 || area.fogEnd > 0) {
      this.renderer.setRenderState(4, 1);
      this.renderer.setRenderState(5, area.fogStart);
      this.renderer.setRenderState(6, area.fogEnd);
      this.renderer.setRenderState(7, area.fogColor.clone());
    } else {
      this.renderer.setRenderState(4, 0);
    }

    this.renderer.light = {
      direction: new Vec3(area.lightPos.x, area.lightPos.y, area.lightPos.z).normalize(),
      diffuse: area.lightColor.clone(),
      range: area.lightRange,
    };
  }

  setCamera() {
    const camDist = -2000;
    const camHeight = 1800;

    const eye = new Vec3(
      this.playerPos.x + Math.sin(this.cameraVect) * camDist,
      this.playerPos.y + camHeight,
      this.playerPos.z + Math.cos(this.cameraVect) * camDist
    );
    const at = new Vec3(
      this.playerPos.x,
      this.playerPos.y + 50,
      this.playerPos.z
    );
    this.renderer.viewTransform(eye, at);
    this.renderer.projTransform(10, 5000);
  }

  movePlayer(direction, dt) {
    if (direction < 0) return false;

    const angle = this.cameraVect - direction * (Math.PI / 4);
    this.playerVect = angle;

    const dx = Math.sin(angle) * this.moveSpeed;
    const dz = Math.cos(angle) * this.moveSpeed;

    const newPos = new Vec3(
      this.playerPos.x + dx,
      this.playerPos.y,
      this.playerPos.z + dz
    );

    // Collision check — only block on hit value >= 3 (wall)
    if (this.area) {
      const hit = this.area.map.checkHit(newPos, 0);
      if (hit >= 3) {
        // Hit a wall — check for wall events
        this._checkWallEventOnMove(newPos);
        return false;
      }
    }

    this.playerPos.set(newPos);

    // Check wall events on the cell we moved into
    this._checkWallEventOnMove(newPos);

    // Check scope events (area transitions)
    this._checkScopes();

    return true;
  }

  // Called when player bumps into a wall
  _checkWallEventOnMove(blockedPos) {
    const bx = MapData.getXBlock(blockedPos.x);
    const bz = MapData.getZBlock(blockedPos.z);

    // Determine facing direction as bit flag (1=north, 2=east, 4=south, 8=west)
    // Normalize angle to 0-2PI
    let a = this.playerVect % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;

    // Map angle to direction bit
    // 0 (north/+Z) → bit 0 (1)
    // PI/2 (east/+X) → bit 1 (2)  
    // PI (south/-Z) → bit 2 (4)
    // 3PI/2 (west/-X) → bit 3 (8)
    const sector = Math.round(a / (Math.PI / 2)) % 4;
    const dirBit = 1 << sector;

    if (this.area && this.area.wallEvents) {
      for (const we of this.area.wallEvents) {
        if (we.xPos === bx && we.zPos === bz) {
          // Check ifFlag condition (Java: CheckIf)
          // 0xFFFF (-1 in signed short) = always active
          // < 10000 = active if flag is set
          // >= 10000 = active if flag (n-10000) is NOT set
          if (!this._checkIf(we.ifFlag)) continue;
          // vect is a bitmask: 15 = all directions, or specific bits
          if ((we.vect & dirBit) !== 0 || we.vect === 15) {
            if (this.onWallEvent) this.onWallEvent(we.event);
            return;
          }
        }
      }
    }
  }

  _checkScopes() {
    if (!this.area) return;
    const bx = MapData.getXBlock(this.playerPos.x);
    const bz = MapData.getZBlock(this.playerPos.z);

    for (const scope of this.area.scopes) {
      if (scope.kind !== 1) continue; // only area transitions
      // Check ifFlag condition
      if (!this._checkIf(scope.ifFlag)) continue;
      if (bx >= scope.xPos && bx < scope.xPos + scope.xSize &&
          bz >= scope.zPos && bz < scope.zPos + scope.zSize) {
        // Trigger area change
        if (this.onAreaChange) {
          this.onAreaChange(scope.targetArea, scope.targetX, scope.targetZ, scope.targetRot);
        }
        return;
      }
    }
  }

  changeArea(area, x, z, rot) {
    this.setArea(area);
    this.playerPos.x = MapData.getXPos(x);
    this.playerPos.z = MapData.getZPos(z);
    this.playerVect = rot * (Math.PI / 2);
  }

  // Java CAreaParam.CheckIf logic
  _checkIf(flag) {
    if (flag === 0xFFFF || flag === 65535) return true; // -1 in signed short = always
    if (!this.eventFlags) return true; // No flag system = allow all
    if (flag < 10000) {
      return this.eventFlags.has(flag);
    }
    return !this.eventFlags.has(flag - 10000);
  }

  // Check if player is near an NPC and trigger talk
  tryTalk() {
    if (!this.area) return null;

    // Find closest NPC within range that is roughly in front of player
    let bestNpc = null;
    let bestDist = Infinity;

    for (const npc of this.area.npcs) {
      if (npc.event === 0 || npc.event === 0xFFFF) continue;
      // Check ifFlag condition
      if (!this._checkIf(npc.ifFlag)) continue;

      const nx = MapData.getXPos(npc.xPos);
      const nz = MapData.getZPos(npc.zPos);
      const dx = nx - this.playerPos.x;
      const dz = nz - this.playerPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 400) continue;

      const angleToNpc = Math.atan2(dx, dz);
      let angleDiff = angleToNpc - this.playerVect;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (Math.abs(angleDiff) < Math.PI * 0.6) {
        if (dist < bestDist) {
          bestDist = dist;
          bestNpc = npc;
        }
      }
    }

    if (bestNpc) {
      if (this.onTalkNpc) this.onTalkNpc(bestNpc);
      return bestNpc;
    }
    return null;
  }

  rotateCameraLeft() {
    this.cameraVect -= Math.PI / 4;
  }

  rotateCameraRight() {
    this.cameraVect += Math.PI / 4;
  }

  drawGround() {
    if (!this.area) return;
    const map = this.area.map;
    const rot = new Vec3(0, 0, 0);
    const scl = new Vec3(1, 1, 1);
    const pos = new Vec3();

    for (let z = 0; z < map.zNum; z++) {
      for (let x = 0; x < map.xNum; x++) {
        const idx = map.getPtr(x, z);
        const groundType = map.ground[idx];
        if (groundType === 0) continue;

        const modelIdx = MapData.getGroundModel(groundType);
        if (modelIdx < 0 || modelIdx >= this.models.length) continue;
        const model = this.models[modelIdx];
        if (!model || model.vertices.length === 0) continue;

        pos.x = MapData.getXPos(x);
        pos.y = 0;
        pos.z = MapData.getZPos(z);

        // Frustum culling: skip tiles too far from player
        const dx = pos.x - this.playerPos.x;
        const dz = pos.z - this.playerPos.z;
        if (dx * dx + dz * dz > 4000 * 4000) continue;

        const wvp = this.renderer.calcModel(model, pos, rot, scl);
        this.renderer.drawModel(model, wvp, this.renderer.getTransform(3), 0, 0);
      }
    }
  }

  drawMapObjects() {
    if (!this.area) return;
    const map = this.area.map;
    const scl = new Vec3(1, 1, 1);
    const pos = new Vec3();
    const rot = new Vec3();

    for (let z = 0; z < map.zNum; z++) {
      for (let x = 0; x < map.xNum; x++) {
        const idx = map.getPtr(x, z);
        const mapVal = map.mapModel[idx];
        if (mapVal === 0) continue;

        const modelType = mapVal >> 2;
        const rotation = (mapVal & 3) * (Math.PI / 2);

        const modelIdx = MapData.getMapModel(modelType);
        if (modelIdx < 0 || modelIdx >= this.models.length) continue;
        const model = this.models[modelIdx];
        if (!model || model.vertices.length === 0) continue;

        pos.x = MapData.getXPos(x);
        pos.y = 0;
        pos.z = MapData.getZPos(z);

        // Frustum culling
        const dx = pos.x - this.playerPos.x;
        const dz = pos.z - this.playerPos.z;
        if (dx * dx + dz * dz > 3000 * 3000) continue;

        rot.x = 0; rot.y = rotation; rot.z = 0;
        const wvp = this.renderer.calcModel(model, pos, rot, scl);
        this.renderer.drawModel(model, wvp, this.renderer.getTransform(3), 0, 0);
      }
    }
  }

  drawPlayer() {
    // Draw NPCs first
    this._drawNpcs();

    // GetModel() = m_nChrH + m_nChrL + 55
    // Player (CChrPrm[0]): m_nChrH=0, m_nChrL=0 → model 55
    const playerModelIdx = 55;
    if (playerModelIdx >= this.models.length) return;
    const model = this.models[playerModelIdx];
    if (!model || model.vertices.length === 0) return;

    const rot = new Vec3(0, this.playerVect, 0);
    const scl = new Vec3(1, 1, 1);
    const wvp = this.renderer.calcModel(model, this.playerPos, rot, scl);
    this.renderer.drawModel(model, wvp, this.renderer.getTransform(3), 0, 0);
  }

  _drawNpcs() {
    if (!this.area || !this.area.npcs) return;

    // CChrPrm table: index → [m_nChrH, m_nChrL, anim, scale%, colorCode, hitSize, flags]
    // Model = m_nChrH + m_nChrL + 55
    const CChrPrm = [
      [0,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[10,0],[11,0],
      [13,0],[15,0],[17,0],[19,0],[20,0],[2,0],[7,0],[35,0],[37,0],[39,0],
      [41,0],[42,0],[46,0],[47,0],[48,0],[49,0],[50,0],[47,0],[51,0],[53,0],
      [54,0],[8,0],[55,0],[3,0],[5,0],[54,0],[41,0],[42,0],[42,0],[42,0],
      [42,0],[56,0],[39,0],[57,0]
    ];

    for (const npc of this.area.npcs) {
      const kind = npc.kind;
      if (kind >= CChrPrm.length) continue;

      const modelIdx = CChrPrm[kind][0] + CChrPrm[kind][1] + 55;
      if (modelIdx < 0 || modelIdx >= this.models.length) continue;
      const model = this.models[modelIdx];
      if (!model || model.vertices.length === 0) continue;

      const pos = new Vec3(
        MapData.getXPos(npc.xPos),
        0,
        MapData.getZPos(npc.zPos)
      );

      // Frustum culling
      const dx = pos.x - this.playerPos.x;
      const dz = pos.z - this.playerPos.z;
      if (dx * dx + dz * dz > 3000 * 3000) continue;

      const rot = new Vec3(0, npc.vect * (Math.PI / 2), 0);
      const scl = new Vec3(1, 1, 1);
      const wvp = this.renderer.calcModel(model, pos, rot, scl);
      this.renderer.drawModel(model, wvp, this.renderer.getTransform(3), 0, 0);
    }
  }

  draw() {
    this.setCamera();
    this.renderer.clear();
    this.drawGround();
    this.drawMapObjects();
    this.drawPlayer();
  }
}

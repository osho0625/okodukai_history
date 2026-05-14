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
    this.onAreaChange = null;
    this.onTalkNpc = null;
    this.onWallEvent = null;
    this.frameCount = 0;
    // NPC animation state
    this.npcAnimOffsets = {}; // npc index → { bobY, bobPhase }
    // NPC movement animations
    this.npcMoveAnims = []; // { npcIdx, startX, startZ, endX, endZ, t, duration }
    // Party following trail
    this.partyTrail = []; // array of {x, z, vect} positions
    this.partyModels = []; // model indices for party members (set externally)
  }

  setArea(area) {
    this.area = area;
    // Clear NPC movement animations from previous area
    this.npcMoveAnims = [];
    this.npcAnimOffsets = {};

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
    if (direction < 0) {
      this._isWalking = false;
      return false;
    }

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
    if (this.area && this.area.map) {
      const hit = this.area.map.checkHit(newPos, 0);
      if (hit >= 3) {
        // Hit a wall — check for wall events on BOTH the wall cell AND player's current cell
        this._checkWallEventOnMove(newPos);  // wall cell
        this._checkWallEventOnMove(this.playerPos); // player's cell (facing wall)
        this._isWalking = false;
        return false;
      }
    }

    this.playerPos.set(newPos);
    this._isWalking = true;

    // Check scope events (area transitions)
    this._checkScopes();

    return true;
  }

  // Called when player bumps into a wall or moves into a cell
  _checkWallEventOnMove(checkPos) {
    if (!this.area || !this.area.wallEvents) return;

    const playerBx = MapData.getXBlock(this.playerPos.x);
    const playerBz = MapData.getZBlock(this.playerPos.z);
    const wallBx = MapData.getXBlock(checkPos.x);
    const wallBz = MapData.getZBlock(checkPos.z);

    // Determine player's facing direction bit
    let a = this.playerVect % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    let dirBit;
    if (a >= Math.PI * 7/4 || a < Math.PI * 1/4) dirBit = 1;      // north (+Z)
    else if (a >= Math.PI * 1/4 && a < Math.PI * 3/4) dirBit = 2;  // east (+X)
    else if (a >= Math.PI * 3/4 && a < Math.PI * 5/4) dirBit = 4;  // south (-Z)
    else dirBit = 8;                                                  // west (-X)

    for (const we of this.area.wallEvents) {
      if (!this._checkIf(we.ifFlag)) continue;

      // Original CheckWallVect logic:
      // 1. If vect==15 and event is on same row or column as player → trigger
      if (we.vect === 15) {
        if ((we.xPos === playerBx || we.zPos === playerBz) &&
            we.xPos === wallBx && we.zPos === wallBz) {
          if (this.onWallEvent) this.onWallEvent(we.event);
          return;
        }
      }

      // 2. Check direction bit matches
      if ((dirBit & we.vect) === 0) continue;

      // 3. Verify wall event is in the correct adjacent cell
      let match = false;
      if ((we.vect & 1) !== 0 && we.xPos === playerBx && we.zPos === playerBz + 1) match = true;
      if ((we.vect & 2) !== 0 && we.xPos === playerBx + 1 && we.zPos === playerBz) match = true;
      if ((we.vect & 4) !== 0 && we.xPos === playerBx && we.zPos === playerBz - 1) match = true;
      if ((we.vect & 8) !== 0 && we.xPos === playerBx - 1 && we.zPos === playerBz) match = true;

      if (match) {
        if (this.onWallEvent) this.onWallEvent(we.event);
        return;
      }
    }
  }

  _checkScopes() {
    if (!this.area) return;
    const bx = MapData.getXBlock(this.playerPos.x);
    const bz = MapData.getZBlock(this.playerPos.z);

    for (const scope of this.area.scopes) {
      // Check ifFlag condition
      if (!this._checkIf(scope.ifFlag)) continue;
      if (bx >= scope.xPos && bx < scope.xPos + scope.xSize &&
          bz >= scope.zPos && bz < scope.zPos + scope.zSize) {

        if (scope.kind === 1) {
          // Area transition
          if (this.onAreaChange) {
            this.onAreaChange(scope.targetArea, scope.targetX, scope.targetZ, scope.targetRot);
          }
          return;
        } else if (scope.kind === 2) {
          // Event trigger (targetArea = event number)
          // Only trigger once per position (prevent re-trigger while standing in scope)
          const scopeKey = `${scope.xPos}_${scope.zPos}_${scope.targetArea}`;
          if (this._lastScopeKey === scopeKey) continue;
          this._lastScopeKey = scopeKey;
          if (this.onWallEvent) this.onWallEvent(scope.targetArea);
          return;
        }
      }
    }
    // Clear scope key when player leaves all scopes
    this._lastScopeKey = null;
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

      // Allow talking up to 2 cells away
      if (dist > 400) continue;

      const angleToNpc = Math.atan2(dx, dz);
      let angleDiff = angleToNpc - this.playerVect;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Wide angle check (90 degrees each side)
      if (Math.abs(angleDiff) < Math.PI * 0.55) {
        // Wall check: verify no wall between player and NPC
        if (this._hasWallBetween(this.playerPos.x, this.playerPos.z, nx, nz)) continue;

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

  // Check if there's a wall between two positions (simple line check)
  _hasWallBetween(x1, z1, x2, z2) {
    if (!this.area || !this.area.map) return false;
    const map = this.area.map;
    // Check cells along the line between the two points
    const steps = Math.max(2, Math.ceil(Math.sqrt((x2-x1)**2 + (z2-z1)**2) / 100));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const mx = x1 + (x2 - x1) * t;
      const mz = z1 + (z2 - z1) * t;
      const bx = MapData.getXBlock(mx);
      const bz = MapData.getZBlock(mz);
      if (bx < 0 || bx >= map.xNum || bz < 0 || bz >= map.zNum) continue;
      const hit = map.hit[map.getPtr(bx, bz)];
      if (hit >= 3) return true; // Wall found
    }
    return false;
  }

  rotateCameraLeft() {
    this.cameraVect -= Math.PI / 4;
  }

  rotateCameraRight() {
    this.cameraVect += Math.PI / 4;
  }

  // Start NPC movement animation
  startNpcMove(npcIdx, targetX, targetZ, speed) {
    if (!this.area || npcIdx >= this.area.npcs.length) return;
    const npc = this.area.npcs[npcIdx];
    const startX = MapData.getXPos(npc.xPos);
    const startZ = MapData.getZPos(npc.zPos);
    const endX = MapData.getXPos(targetX);
    const endZ = MapData.getZPos(targetZ);
    const dist = Math.sqrt((endX - startX) ** 2 + (endZ - startZ) ** 2);
    const duration = Math.max(5, Math.floor(dist / (speed * 10 + 20)));
    this.npcMoveAnims.push({ npcIdx, startX, startZ, endX, endZ, t: 0, duration });
  }

  // Update NPC movement animations
  updateNpcMoves() {
    for (let i = this.npcMoveAnims.length - 1; i >= 0; i--) {
      const anim = this.npcMoveAnims[i];
      anim.t++;
      const progress = Math.min(1, anim.t / anim.duration);
      // Update NPC position
      if (this.area && anim.npcIdx < this.area.npcs.length) {
        const npc = this.area.npcs[anim.npcIdx];
        const curX = anim.startX + (anim.endX - anim.startX) * progress;
        const curZ = anim.startZ + (anim.endZ - anim.startZ) * progress;
        npc.xPos = MapData.getXBlock(curX);
        npc.zPos = MapData.getZBlock(curZ);
        // Store sub-cell position for smooth rendering
        npc._renderX = curX;
        npc._renderZ = curZ;
        // Face movement direction
        if (progress < 1) {
          npc._moving = true;
        }
      }
      if (progress >= 1) {
        if (this.area && anim.npcIdx < this.area.npcs.length) {
          this.area.npcs[anim.npcIdx]._moving = false;
          this.area.npcs[anim.npcIdx]._renderX = undefined;
          this.area.npcs[anim.npcIdx]._renderZ = undefined;
        }
        this.npcMoveAnims.splice(i, 1);
      }
    }
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

    // Collect visible objects with distance for sorting
    const drawList = [];
    const camX = this.playerPos.x + Math.sin(this.cameraVect) * -2000;
    const camZ = this.playerPos.z + Math.cos(this.cameraVect) * -2000;

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

        const px = MapData.getXPos(x);
        const pz = MapData.getZPos(z);

        // Frustum culling
        const dx = px - this.playerPos.x;
        const dz = pz - this.playerPos.z;
        if (dx * dx + dz * dz > 3000 * 3000) continue;

        // Distance from camera for sorting (farther = draw first)
        const camDx = px - camX;
        const camDz = pz - camZ;
        const dist = camDx * camDx + camDz * camDz;

        drawList.push({ px, pz, rotation, model, dist });
      }
    }

    // Sort back-to-front (farther from camera drawn first)
    drawList.sort((a, b) => b.dist - a.dist);

    for (const item of drawList) {
      pos.x = item.px; pos.y = 0; pos.z = item.pz;
      rot.x = 0; rot.y = item.rotation; rot.z = 0;
      const wvp = this.renderer.calcModel(item.model, pos, rot, scl);
      this.renderer.drawModel(item.model, wvp, this.renderer.getTransform(3), 0, 0);
    }
  }

  drawPlayer() {
    // Draw NPCs first
    this._drawNpcs();

    // Update party trail (store player positions for followers)
    if (this.partyTrail.length === 0 || 
        Math.abs(this.partyTrail[0].x - this.playerPos.x) > 20 ||
        Math.abs(this.partyTrail[0].z - this.playerPos.z) > 20) {
      this.partyTrail.unshift({ x: this.playerPos.x, z: this.playerPos.z, vect: this.playerVect });
      if (this.partyTrail.length > 20) this.partyTrail.pop();
    }

    // Draw party members (following behind player)
    if (this.partyModels.length > 0) {
      for (let pi = 0; pi < this.partyModels.length; pi++) {
        const trailIdx = Math.min((pi + 1) * 4, this.partyTrail.length - 1);
        if (trailIdx < 0) continue;
        const trail = this.partyTrail[trailIdx];
        const modelIdx = this.partyModels[pi];
        if (modelIdx < 0 || modelIdx >= this.models.length) continue;
        const model = this.models[modelIdx];
        if (!model || model.vertices.length === 0) continue;

        const pos = new Vec3(trail.x, 0, trail.z);
        const rot = new Vec3(0, trail.vect, 0);
        const scl = new Vec3(1, 1, 1);
        const wvp = this.renderer.calcModel(model, pos, rot, scl);
        this.renderer.drawModel(model, wvp, this.renderer.getTransform(3), 0, 0);
        // Shadow
        this.renderer.drawShadow(pos, 35, this.cameraVect);
      }
    }

    // Draw main player
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

    const CChrPrm = [
      [0,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[10,0],[11,0],
      [13,0],[15,0],[17,0],[19,0],[20,0],[2,0],[7,0],[35,0],[37,0],[39,0],
      [41,0],[42,0],[46,0],[47,0],[48,0],[49,0],[50,0],[47,0],[51,0],[53,0],
      [54,0],[8,0],[55,0],[3,0],[5,0],[54,0],[41,0],[42,0],[42,0],[42,0],
      [42,0],[56,0],[39,0],[57,0]
    ];

    for (let ni = 0; ni < this.area.npcs.length; ni++) {
      const npc = this.area.npcs[ni];
      const kind = npc.kind;
      if (kind >= CChrPrm.length) continue;

      const modelIdx = CChrPrm[kind][0] + CChrPrm[kind][1] + 55;
      if (modelIdx < 0 || modelIdx >= this.models.length) continue;
      const model = this.models[modelIdx];
      if (!model || model.vertices.length === 0) continue;

      const pos = new Vec3(
        npc._renderX !== undefined ? npc._renderX : MapData.getXPos(npc.xPos),
        0,
        npc._renderZ !== undefined ? npc._renderZ : MapData.getZPos(npc.zPos)
      );

      // Frustum culling
      const dx = pos.x - this.playerPos.x;
      const dz = pos.z - this.playerPos.z;
      if (dx * dx + dz * dz > 3000 * 3000) continue;

      // Idle bob animation
      const bobPhase = (this.frameCount * 0.08 + ni * 1.7) % (Math.PI * 2);
      pos.y = Math.sin(bobPhase) * 3;

      const rot = new Vec3(0, npc.vect * (Math.PI / 2), 0);
      const scl = new Vec3(1, 1, 1);
      const wvp = this.renderer.calcModel(model, pos, rot, scl);
      this.renderer.drawModel(model, wvp, this.renderer.getTransform(3), 0, 0);

      // Talk indicator "!" above NPC if they have an event
      if (npc.event > 0 && npc.event < 0xFFFF) {
        const headPos = this.renderer.get3DPos(wvp, new Vec3(0, model.topY + 30, 0));
        if (headPos.x > 0 && headPos.x < 400 && headPos.y > 0 && headPos.y < 320) {
          const pulse = Math.sin(this.frameCount * 0.15 + ni) * 0.3 + 0.7;
          this.renderer.ctx.fillStyle = `rgba(255,255,0,${pulse})`;
          this.renderer.ctx.font = 'bold 12px sans-serif';
          this.renderer.ctx.textAlign = 'center';
          this.renderer.ctx.fillText('!', headPos.x, headPos.y - 5);
        }
      }
    }
  }

  draw() {
    this.setCamera();

    // Cat's eye effect: temporarily increase light range
    if (this.catsEyeCounter && this.catsEyeCounter > 0) {
      if (this.renderer.light) {
        this.renderer.light.range = (this.renderer.light.range || 500) + this.catsEyeCounter;
      }
    }

    this.renderer.clear();

    // Cosmic background (drawn when event flag 330 is set — space areas)
    if (this.eventFlags && this.eventFlags.has(330)) {
      this.drawCosmo();
    }

    this.drawGround();

    // Draw all objects (map objects + characters) sorted by camera distance
    this._drawAllSorted();
  }

  // Call from game update loop (not draw)
  updateField() {
    this.frameCount++;
    this.updateNpcMoves();
    if (this.catsEyeCounter && this.catsEyeCounter > 0) {
      this.catsEyeCounter--;
    }
  }

  // Draw all map objects + characters sorted by camera distance (painter's algorithm)
  _drawAllSorted() {
    const camX = this.playerPos.x + Math.sin(this.cameraVect) * -2000;
    const camZ = this.playerPos.z + Math.cos(this.cameraVect) * -2000;
    const scl = new Vec3(1, 1, 1);
    const drawList = []; // { px, pz, py, rotation, model, dist, flags, shadow }

    // 1. Collect map objects
    if (this.area) {
      const map = this.area.map;
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
          const px = MapData.getXPos(x);
          const pz = MapData.getZPos(z);
          const dx = px - this.playerPos.x;
          const dz = pz - this.playerPos.z;
          if (dx * dx + dz * dz > 3000 * 3000) continue;
          const camDx = px - camX;
          const camDz = pz - camZ;
          drawList.push({ px, pz, py: 0, rotation, model, dist: camDx * camDx + camDz * camDz, flags: 0, shadow: 0 });
        }
      }
    }

    // 2. Collect NPCs
    if (this.area && this.area.npcs) {
      const CChrPrm = [
        [0,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[10,0],[11,0],
        [13,0],[15,0],[17,0],[19,0],[20,0],[2,0],[7,0],[35,0],[37,0],[39,0],
        [41,0],[42,0],[46,0],[47,0],[48,0],[49,0],[50,0],[47,0],[51,0],[53,0],
        [54,0],[8,0],[55,0],[3,0],[5,0],[54,0],[41,0],[42,0],[42,0],[42,0],
        [42,0],[56,0],[39,0],[57,0]
      ];
      for (let ni = 0; ni < this.area.npcs.length; ni++) {
        const npc = this.area.npcs[ni];
        const kind = npc.kind;
        if (kind >= CChrPrm.length) continue;
        const modelIdx = CChrPrm[kind][0] + CChrPrm[kind][1] + 55;
        if (modelIdx < 0 || modelIdx >= this.models.length) continue;
        const model = this.models[modelIdx];
        if (!model || model.vertices.length === 0) continue;
        const px = npc._renderX !== undefined ? npc._renderX : MapData.getXPos(npc.xPos);
        const pz = npc._renderZ !== undefined ? npc._renderZ : MapData.getZPos(npc.zPos);
        const dx = px - this.playerPos.x;
        const dz = pz - this.playerPos.z;
        if (dx * dx + dz * dz > 3000 * 3000) continue;
        const bobPhase = (this.frameCount * 0.08 + ni * 1.7) % (Math.PI * 2);
        const py = Math.sin(bobPhase) * 3;
        const camDx = px - camX;
        const camDz = pz - camZ;
        drawList.push({ px, pz, py, rotation: npc.vect * (Math.PI / 2), model, dist: camDx * camDx + camDz * camDz, flags: 0, shadow: 35, npcIdx: ni });
      }
    }

    // 3. Collect party members
    // Update party trail
    if (this.partyTrail.length === 0 ||
        Math.abs(this.partyTrail[0].x - this.playerPos.x) > 20 ||
        Math.abs(this.partyTrail[0].z - this.playerPos.z) > 20) {
      this.partyTrail.unshift({ x: this.playerPos.x, z: this.playerPos.z, vect: this.playerVect });
      if (this.partyTrail.length > 20) this.partyTrail.pop();
    }
    if (this.partyModels.length > 0) {
      for (let pi = 0; pi < this.partyModels.length; pi++) {
        const trailIdx = Math.min((pi + 1) * 4, this.partyTrail.length - 1);
        if (trailIdx < 0) continue;
        const trail = this.partyTrail[trailIdx];
        const modelIdx = this.partyModels[pi];
        if (modelIdx < 0 || modelIdx >= this.models.length) continue;
        const model = this.models[modelIdx];
        if (!model || model.vertices.length === 0) continue;
        const camDx = trail.x - camX;
        const camDz = trail.z - camZ;
        // Party members bob when player is walking
        let partyY = 0;
        let partyWalkPhase = -1;
        if (this._isWalking) {
          partyWalkPhase = this.frameCount * 0.5 + (pi + 1) * 1.2;
          partyY = Math.abs(Math.sin(partyWalkPhase)) * 5;
        }
        drawList.push({ px: trail.x, pz: trail.z, py: partyY, rotation: trail.vect, model, dist: camDx * camDx + camDz * camDz, flags: 0, shadow: 35, walkPhase: partyWalkPhase });
      }
    }

    // 4. Collect main player
    const playerModelIdx = 55;
    if (playerModelIdx < this.models.length) {
      const pModel = this.models[playerModelIdx];
      if (pModel && pModel.vertices.length > 0) {
        const camDx = this.playerPos.x - camX;
        const camDz = this.playerPos.z - camZ;
        // Walk animation: bob up/down when moving
        let playerY = 0;
        let walkPhase = -1;
        if (this._isWalking) {
          walkPhase = this.frameCount * 0.5;
          playerY = Math.abs(Math.sin(walkPhase)) * 5; // slight bounce
        }
        drawList.push({ px: this.playerPos.x, pz: this.playerPos.z, py: playerY, rotation: this.playerVect, model: pModel, dist: camDx * camDx + camDz * camDz, flags: 0, shadow: 40, walkPhase });
      }
    }

    // Sort back-to-front (farther from camera drawn first)
    drawList.sort((a, b) => b.dist - a.dist);

    // Draw all
    const pos = new Vec3();
    const rot = new Vec3();
    for (const item of drawList) {
      pos.x = item.px; pos.y = item.py; pos.z = item.pz;
      rot.x = 0; rot.y = item.rotation; rot.z = 0;
      // Shadow first (under the model)
      if (item.shadow > 0) {
        this.renderer.drawShadow(pos, item.shadow, this.cameraVect);
      }
      const wvp = this.renderer.calcModel(item.model, pos, rot, scl);
      this.renderer.drawModel(item.model, wvp, this.renderer.getTransform(3), item.flags, 0, item.walkPhase !== undefined ? item.walkPhase : -1);
      // NPC talk indicator
      if (item.npcIdx !== undefined) {
        const npc = this.area.npcs[item.npcIdx];
        if (npc.event > 0 && npc.event < 0xFFFF) {
          const headPos = this.renderer.get3DPos(wvp, new Vec3(0, item.model.topY + 30, 0));
          if (headPos.x > 0 && headPos.x < 400 && headPos.y > 0 && headPos.y < 320) {
            const pulse = Math.sin(this.frameCount * 0.15 + item.npcIdx) * 0.3 + 0.7;
            this.renderer.ctx.fillStyle = `rgba(255,255,0,${pulse})`;
            this.renderer.ctx.font = 'bold 12px sans-serif';
            this.renderer.ctx.textAlign = 'center';
            this.renderer.ctx.fillText('!', headPos.x, headPos.y - 5);
          }
        }
      }
    }
  }

  // Cosmic starfield background (ported from CCosmo)
  drawCosmo() {
    if (!this._cosmoStars) {
      // Initialize 128 stars
      this._cosmoStars = [];
      for (let i = 0; i < 128; i++) {
        this._cosmoStars.push({
          x: Math.random() * 1400 - 700,
          z: Math.random() * 1400 - 700 - 150,
          speed: Math.random() * 25,
        });
      }
    }
    const ctx = this.renderer.ctx;
    const cx = 200, cy = 160; // screen center
    for (let i = 0; i < 128; i++) {
      const star = this._cosmoStars[i];
      // Move stars
      star.x -= star.speed * 0.08;
      star.z += star.speed * 0.06;
      if (star.x < -700) star.x += 1400;
      if (star.z > 700) star.z -= 1550;

      // Project to screen (simple perspective)
      const depth = 500;
      const sx = cx + (star.x - this.playerPos.x * 0.01) * depth / (depth + 200);
      const sy = cy + (star.z - this.playerPos.z * 0.01) * depth / (depth + 200) * 0.5;
      if (sx < 0 || sx > 400 || sy < 0 || sy > 320) continue;

      // Color based on index (matching original)
      if (i < 56) ctx.fillStyle = '#fff';
      else if (i < 80) ctx.fillStyle = '#8888ff';
      else if (i < 104) ctx.fillStyle = '#8080ff';
      else ctx.fillStyle = '#ffffaa';

      ctx.fillRect(sx, sy, 1, 1);
    }
  }
}

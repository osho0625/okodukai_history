// renderer.js — Software 3D renderer (ported from CRender3D / CDrawMap)

import { Vec3, Color, Mat4 } from './math.js';

const MAX_CALC_BUFFER = 2048;
const MAX_SURFACES = 1024;

// Transform slots
const TS_VIEW = 0;
const TS_VIEW_N = 1;
const TS_PROJ = 2;
const TS_WORLD = 3;
const TS_WORLD_N = 4;

// Render state keys
const RS_LIGHT_ENABLED = 3;
const RS_FOG_ENABLED = 4;
const RS_FOG_START = 5;
const RS_FOG_END = 6;
const RS_FOG_COLOR = 7;
const RS_AMBIENT = 8;
const RS_BACK_COLOR = 9;
const RS_LIGHT_COLOR = 10;

export class Renderer {
  constructor() {
    this.width = 400;
    this.height = 320;
    this.centerX = 200;
    this.centerY = 160;
    this.adjustY = 0;
    this.multX = this.width * 1e-6;
    this.multY = this.height * 1e-6;

    this.transforms = Array.from({ length: 5 }, () => new Mat4());
    this.wvp = new Mat4();
    this.wvpNormal = new Mat4();
    this.worldBase = new Mat4();

    this.calcBuffer = Array.from({ length: MAX_CALC_BUFFER }, () => new Vec3());

    this.renderStates = {};
    this.renderStatesC = {};
    this.eyeVector = new Vec3();
    this.eyeAt = new Vec3();

    this.light = null;
    this.bright = 1.0;
    this.white = 0.0;
    this.ambPowR = 0;
    this.ambPowG = 0;
    this.ambPowB = 0;

    /** @type {CanvasRenderingContext2D} */
    this.ctx = null;
  }

  create(canvas) {
    // Use offscreen canvas for double-buffering (prevents flickering)
    this._visibleCanvas = canvas;
    this._visibleCtx = canvas.getContext('2d');
    this._offscreen = document.createElement('canvas');
    this._offscreen.width = canvas.width;
    this._offscreen.height = canvas.height;
    this.ctx = this._offscreen.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.multX = this.width * 1e-6;
    this.multY = this.height * 1e-6;
  }

  // Copy offscreen buffer to visible canvas (call once per frame after all drawing)
  present() {
    this._visibleCtx.drawImage(this._offscreen, 0, 0);
  }

  setRenderState(key, value) {
    if (value instanceof Color) {
      this.renderStatesC[key] = value;
    } else {
      this.renderStates[key] = value;
    }
  }

  getRenderStateN(key) { return this.renderStates[key] || 0; }
  getRenderStateC(key) { return this.renderStatesC[key] || new Color(); }

  setLight(light) {
    this.light = light;
    const col = this.getRenderStateC(RS_LIGHT_COLOR);
    if (light) {
      this.setRenderState(RS_LIGHT_COLOR, light.diffuse.clone());
    }
  }

  setAdjustY(y) { this.adjustY = y; }
  setBright(b) { this.bright = b; }
  setWhite(w) { this.white = w; }

  setAmbient(color) {
    this.setRenderState(RS_AMBIENT, color);
    // Ensure minimum ambient brightness (original game is brighter)
    this.ambPowR = Math.max(0.35, color.r / 255);
    this.ambPowG = Math.max(0.35, color.g / 255);
    this.ambPowB = Math.max(0.35, color.b / 255);
  }

  setTransform(slot, mat) {
    this.transforms[slot].set(mat);
    if (slot === TS_VIEW || slot === TS_PROJ) {
      this.worldBase.identity();
      this.worldBase.mult(this.transforms[TS_VIEW]);
      this.worldBase.mult(this.transforms[TS_PROJ]);
    }
  }

  getTransform(slot) { return this.transforms[slot]; }
  getWVPMatrix() { return this.wvp; }

  // View transform
  viewTransform(eye, at) {
    this.eyeAt.set(at);
    const up = new Vec3(0, 1, 0);
    const viewMat = new Mat4().view(eye, at, up);
    this.setTransform(TS_VIEW, viewMat);

    const viewInv = new Mat4().view(at, eye, up);
    this.setTransform(TS_VIEW_N, viewInv);

    this.eyeVector = new Vec3(at.x - eye.x, at.y - eye.y, at.z - eye.z).normalize();
  }

  // Projection transform
  projTransform(near, far) {
    const proj = new Mat4().projection(near, far, 0.5235988, this.height / this.width);
    this.setTransform(TS_PROJ, proj);
  }

  // Make WVP matrix: World * View * Projection
  makeWVPMatrix() {
    this.wvp.identity();
    this.wvp.mult(this.transforms[TS_WORLD]);
    this.wvp.mult(this.transforms[TS_VIEW]);
    this.wvp.mult(this.transforms[TS_PROJ]);
    return this.wvp;
  }

  makeNormalWVP() {
    this.wvpNormal.identity();
    this.wvpNormal.mult3(this.transforms[TS_VIEW]);
    return this.wvpNormal;
  }

  // Project 3D point to screen
  get3DPos(mat, v) {
    const t = mat.transform(v);
    t.x = -t.x;
    let w = t.z * 1e-6;
    if (w >= 0) { if (w < 1e-6) w = 1e-6; }
    else { if (w > -1e-6) w = -1e-6; }
    t.x = (t.x / w) * this.multX + this.centerX;
    t.y = (-t.y / w) * this.multY + this.centerY + this.adjustY;
    return t;
  }

  get3DPosBW(v) {
    return this.get3DPos(this.worldBase, v);
  }

  // Clear screen with background color
  clear() {
    const bg = this.getRenderStateC(RS_BACK_COLOR);
    this.setColorBright(bg);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Set color with brightness/white adjustment
  setColorBright(color) {
    const w = this.white;
    let r, g, b;
    if (Math.abs(w) < 1e-6) {
      const br = this.bright;
      r = (color.r * br) | 0;
      g = (color.g * br) | 0;
      b = (color.b * br) | 0;
    } else {
      r = color.r + ((255 - color.r) * w) | 0;
      g = color.g + ((255 - color.g) * w) | 0;
      b = color.b + ((255 - color.b) * w) | 0;
    }
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    this.ctx.fillStyle = `rgb(${r},${g},${b})`;
  }

  // Calculate model transforms and bounding box
  calcModel(model, pos, rot, scl) {
    const mScale = new Mat4().scale(scl.x, scl.y, scl.z);
    const mRotX = new Mat4();
    const mRotY = new Mat4().rotateY(rot.y);
    const mRotZ = new Mat4();
    const mTrans = new Mat4().translate(pos.x, pos.y, pos.z);

    if (Math.abs(rot.x) > 1e-6) mRotX.rotateX(rot.x);
    if (Math.abs(rot.z) > 1e-6) mRotZ.rotateZ(rot.z);

    const world = mScale;
    if (Math.abs(rot.x) > 1e-6) world.mult(mRotX);
    if (Math.abs(rot.z) > 1e-6) world.mult(mRotZ);
    world.mult(mRotY);
    world.mult(mTrans);

    this.setTransform(TS_WORLD, world);
    this.makeWVPMatrix();
    this.makeNormalWVP();

    return this.wvp;
  }

  // Calculate normal from 3 screen-space vertices
  calcNormal(v0, v1, v2) {
    const a = new Vec3(v0.x - v1.x, v0.y - v1.y, v0.z - v1.z);
    const b = new Vec3(v0.x - v2.x, v0.y - v2.y, v0.z - v2.z);
    return new Vec3().cross(a, b).normalize();
  }

  // Calculate lighting ratio
  calcLightRatio(worldPos, normal, flags) {
    if (!this.light) return 0.5;
    const lightDir = this.light.direction.clone().normalize();
    let ratio = -normal.dot(lightDir);
    if (ratio < 0) ratio = 0;
    // Boost minimum light to prevent overly dark polygons (matching original's brighter look)
    return ratio * 0.7 + 0.3;
  }

  // Calculate fog ratio
  calcFogRatio(screenPos) {
    const fogStart = this.renderStates[RS_FOG_START] || 0;
    const fogEnd = this.renderStates[RS_FOG_END] || 1000;
    const dist = screenPos.z;
    if (dist <= fogStart) return 0;
    if (dist >= fogEnd) return 1;
    return (dist - fogStart) / (fogEnd - fogStart);
  }

  // Calculate polygon color with lighting + fog
  polygonColor(material, worldCenter, screenCenter, normal, flags) {
    const lightCol = this.getRenderStateC(RS_LIGHT_COLOR);
    const ratio = this.calcLightRatio(worldCenter, normal, flags);

    const lr = lightCol.r / 255;
    const lg = lightCol.g / 255;
    const lb = lightCol.b / 255;

    const pr = ratio * lr + this.ambPowR;
    const pg = ratio * lg + this.ambPowG;
    const pb = ratio * lb + this.ambPowB;

    const col = new Color(
      (material.color.r * pr) | 0,
      (material.color.g * pg) | 0,
      (material.color.b * pb) | 0
    );

    // Specular (simplified)
    if (material.specular > 0.001) {
      const spc = (material.specular * ratio * 256) | 0;
      col.r += spc; col.g += spc; col.b += spc;
    }

    // Fog
    if (this.getRenderStateN(RS_FOG_ENABLED)) {
      const fogCol = this.getRenderStateC(RS_FOG_COLOR);
      const fogRatio = this.calcFogRatio(screenCenter);
      const inv = 1 - fogRatio;
      col.r = (col.r * inv + fogCol.r * fogRatio) | 0;
      col.g = (col.g * inv + fogCol.g * fogRatio) | 0;
      col.b = (col.b * inv + fogCol.b * fogRatio) | 0;
    }

    col.limits();
    return col;
  }

  // Draw a filled polygon (3 or 4 vertices)
  drawPolygon(xArr, yArr, color) {
    this.setColorBright(color);
    this.ctx.beginPath();
    this.ctx.moveTo(xArr[0], yArr[0]);
    for (let i = 1; i < xArr.length; i++) {
      this.ctx.lineTo(xArr[i], yArr[i]);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  // Draw a 3D model with painter's algorithm sorting
  drawModel(model, wvpMat, worldMat, flags = 0, colorCode = 0, walkPhase = -1) {
    const verts = model.vertices;
    const numVerts = verts.length;

    // Determine leg threshold (lower 40% of model height = legs)
    const legThreshold = walkPhase >= 0 ? (model.topY || 50) * 0.4 : -1;

    // Transform all vertices to screen space
    for (let i = 0; i < numVerts; i++) {
      let v = new Vec3(verts[i].x, verts[i].y, verts[i].z);
      if (flags & 1) v.x = -v.x; // mirror

      // Walk animation: rotate leg vertices around Y axis
      if (walkPhase >= 0 && v.y < legThreshold) {
        // Alternate legs: front/back based on X sign
        const legSide = v.x > 0 ? 1 : -1;
        const swing = Math.sin(walkPhase + legSide * 1.5) * 0.3;
        const cosS = Math.cos(swing);
        const sinS = Math.sin(swing);
        const origZ = v.z;
        const origY = v.y;
        v.z = origZ * cosS - origY * sinS;
        v.y = origZ * sinS + origY * cosS;
      }

      this.calcBuffer[i].set(this.get3DPos(wvpMat, v));
    }

    // Build surface draw list with Z-sort
    const drawList = [];
    const worldMat3 = worldMat.clone();

    for (let si = 0; si < model.surfaces.length; si++) {
      const surf = model.surfaces[si];
      const matIdx = surf.materialIndex;
      if (matIdx === -1) continue;

      const material = model.materials[matIdx];
      if (!material) continue;

      // Back-face culling
      const v0 = this.calcBuffer[surf.vertIndices[0]];
      const v1 = this.calcBuffer[surf.vertIndices[1]];
      const v2 = this.calcBuffer[surf.vertIndices[2]];
      const normal = this.calcNormal(v0, v1, v2);

      if (flags & 1) { normal.x = -normal.x; normal.y = -normal.y; normal.z = -normal.z; }
      if (normal.z < -0.1) {
        if (!(material.flags & 0x10)) continue; // double-sided
        normal.x = -normal.x; normal.y = -normal.y; normal.z = -normal.z;
      }

      // Calculate center Z for sorting
      let centerZ = 0;
      const xArr = [];
      const yArr = [];
      for (let vi = 0; vi < surf.vertCount; vi++) {
        const sv = this.calcBuffer[surf.vertIndices[vi]];
        xArr.push(sv.x | 0);
        yArr.push(sv.y | 0);
        centerZ += sv.z;
      }
      centerZ /= surf.vertCount;

      // Material sort priority flags
      if (material.flags & 1) centerZ -= 100;
      if (material.flags & 2) centerZ -= 1000;
      if (material.flags & 4) centerZ += 100;
      if (material.flags & 8) centerZ += 1000;

      // Calculate color
      const screenCenter = new Vec3(
        xArr.reduce((a, b) => a + b, 0) / surf.vertCount,
        yArr.reduce((a, b) => a + b, 0) / surf.vertCount,
        centerZ
      );

      let color;
      if (flags & 2) {
        color = material.color.clone();
      } else {
        // Simplified world center (use screen center Z for fog)
        const worldCenter = new Vec3(0, 0, 0); // approximate
        color = this.polygonColor(material, worldCenter, screenCenter, normal, flags);
      }

      drawList.push({ z: centerZ, xArr, yArr, color });
    }

    // Sort back-to-front (larger Z = farther)
    drawList.sort((a, b) => b.z - a.z);

    // Draw
    for (const item of drawList) {
      this.drawPolygon(item.xArr, item.yArr, item.color);
    }
  }

  // Draw shadow ellipse
  drawShadow(pos, size, cameraVect) {
    const basePos = new Vec3(pos.x, 0, pos.z);
    this.setColorBright(new Color(32, 32, 32));

    const p1 = this.get3DPosBW(new Vec3(
      basePos.x + Math.sin(cameraVect + Math.PI / 2) * size, 0,
      basePos.z + Math.cos(cameraVect + Math.PI / 2) * size
    ));
    const p2 = this.get3DPosBW(new Vec3(
      basePos.x + Math.sin(cameraVect + Math.PI * 1.5) * size, 0,
      basePos.z + Math.cos(cameraVect + Math.PI * 1.5) * size
    ));
    const p3 = this.get3DPosBW(new Vec3(
      basePos.x + Math.sin(cameraVect) * size, 0,
      basePos.z + Math.cos(cameraVect) * size
    ));
    const p4 = this.get3DPosBW(new Vec3(
      basePos.x + Math.sin(cameraVect + Math.PI) * size, 0,
      basePos.z + Math.cos(cameraVect + Math.PI) * size
    ));

    const w = p2.x - p1.x;
    const h = p4.y - p3.y;
    this.ctx.beginPath();
    this.ctx.ellipse(p1.x + w / 2, p3.y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // Draw 2D image
  drawImage(img, x, y) {
    if (img) this.ctx.drawImage(img, x, y);
  }
}

// loader.js — Asset loader (ported from CFile, CModel.Load, etc.)
// Handles Big Endian binary data reading via fetch + DataView

import { Vec3, Color } from './math.js';

export class BinaryReader {
  constructor(buffer) {
    this.view = new DataView(buffer);
    this.offset = 0;
  }

  readByte() { const v = this.view.getInt8(this.offset); this.offset += 1; return v; }
  readUByte() { const v = this.view.getUint8(this.offset); this.offset += 1; return v; }
  readShort() { const v = this.view.getInt16(this.offset, false); this.offset += 2; return v; }
  readUShort() { const v = this.view.getUint16(this.offset, false); this.offset += 2; return v; }
  readInt() { const v = this.view.getInt32(this.offset, false); this.offset += 4; return v; }
  readFloat() { const v = this.view.getFloat32(this.offset, false); this.offset += 4; return v; }
  readChar() { const v = this.view.getUint16(this.offset, false); this.offset += 2; return String.fromCharCode(v); }

  readString(byteLen) {
    const charCount = byteLen / 2;
    let str = '';
    for (let i = 0; i < charCount; i++) {
      const ch = this.view.getUint16(this.offset, false);
      this.offset += 2;
      if (ch !== 0) str += String.fromCharCode(ch);
    }
    return str;
  }

  readBytes(len) {
    const arr = new Uint8Array(this.view.buffer, this.offset, len);
    this.offset += len;
    return arr;
  }

  get remaining() { return this.view.byteLength - this.offset; }
}

// 3D Model data structure
export class Model {
  constructor() {
    this.vertices = [];   // Vec3[]
    this.surfaces = [];   // Surface[]
    this.materials = [];  // Material[]
    this.topY = 0;
  }

  getTopY() { return this.topY; }
}

export class Surface {
  constructor() {
    this.vertCount = 0;
    this.vertIndices = [0, 0, 0, 0];
    this.materialIndex = 0;
    this.normal = new Vec3();
  }
}

export class Material {
  constructor() {
    this.color = new Color(128, 128, 128);
    this.diffuse = 1.0;
    this.specular = 0;
    this.flags = 0;
  }
}

// RLE decompression (CFileJip format)
// File layout: [int: compressedSize+9] [int: unpackedSize] [byte: marker] [data...]
export function decompressJip(buffer) {
  const view = new DataView(buffer);
  const compressedPlusNine = view.getInt32(0, false); // Big Endian
  const unpackedSize = view.getInt32(4, false);
  const marker = view.getUint8(8);
  const compressedSize = compressedPlusNine - 9;

  const src = new Uint8Array(buffer, 9, compressedSize);
  const dst = new Uint8Array(unpackedSize);

  let si = 0, di = 0;
  while (si < compressedSize && di < unpackedSize) {
    const b = src[si++];
    if (b !== marker) {
      dst[di++] = b;
    } else {
      const val = src[si++];
      const count = src[si++];
      for (let i = 0; i < count && di < unpackedSize; i++) {
        dst[di++] = val;
      }
    }
  }
  return dst.buffer;
}

// Asset loader
export class AssetLoader {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async fetchBinary(path) {
    const res = await fetch(this.baseUrl + path);
    if (!res.ok) throw new Error(`Failed to load: ${path} (${res.status})`);
    return res.arrayBuffer();
  }

  async loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = this.baseUrl + path;
    });
  }

  async loadModel(path) {
    const compressed = await this.fetchBinary(path);
    const decompressed = decompressJip(compressed);
    const reader = new BinaryReader(decompressed);
    return this.parseModel(reader);
  }

  // Parse model matching CModel.Load() exactly
  parseModel(reader) {
    const model = new Model();

    // Header
    const vertCount = reader.readInt();
    if (vertCount === 0) return model;

    const surfCount = reader.readShort() & 0xFFFF;
    if (surfCount === 0) return model;

    const matCount = reader.readShort() & 0xFFFF;
    if (matCount === 0) return model;

    // Bounding box (8 vertices × 3 floats)
    model.boundingBox = [];
    for (let i = 0; i < 8; i++) {
      model.boundingBox.push(new Vec3(
        reader.readFloat(), reader.readFloat(), reader.readFloat()
      ));
    }

    // Height (topY)
    model.topY = reader.readFloat();

    // Vertices
    for (let i = 0; i < vertCount; i++) {
      model.vertices.push(new Vec3(
        reader.readFloat(), reader.readFloat(), reader.readFloat()
      ));
    }

    // Materials
    for (let i = 0; i < matCount; i++) {
      const mat = new Material();
      mat.color.r = reader.readInt();
      mat.color.g = reader.readInt();
      mat.color.b = reader.readInt();
      mat.diffuse = reader.readFloat();
      mat.specular = reader.readFloat();
      mat.flags = reader.readInt();
      model.materials.push(mat);
    }

    // Surfaces
    for (let i = 0; i < surfCount; i++) {
      const surf = new Surface();
      surf.materialIndex = reader.readShort() & 0xFFFF;
      surf.vertCount = reader.readShort() & 0xFFFF;
      // Note: vertex indices are read in order [1,0,3,2] per Java source
      surf.vertIndices[1] = reader.readShort() & 0xFFFF;
      surf.vertIndices[0] = reader.readShort() & 0xFFFF;
      surf.vertIndices[3] = reader.readShort() & 0xFFFF;
      surf.vertIndices[2] = reader.readShort() & 0xFFFF;
      surf.normal.x = reader.readFloat();
      surf.normal.y = reader.readFloat();
      surf.normal.z = reader.readFloat();
      model.surfaces.push(surf);
    }

    return model;
  }

  async loadAllImages(count) {
    const images = [];
    for (let i = 0; i < count; i++) {
      const num = i.toString().padStart(2, '0');
      try {
        images.push(await this.loadImage(`image${num}.gif`));
      } catch (e) {
        console.warn(e.message);
        images.push(null);
      }
    }
    return images;
  }

  async loadAllModels(count, onProgress) {
    const models = [];
    for (let i = 0; i < count; i++) {
      const num = i.toString().padStart(3, '0');
      try {
        models.push(await this.loadModel(`data/mdl${num}._k3`));
      } catch (e) {
        console.warn(`Model ${num}: ${e.message}`);
        models.push(new Model());
      }
      if (onProgress) onProgress(i + 1, count);
    }
    return models;
  }
}

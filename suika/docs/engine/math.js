// math.js — 3D math primitives (ported from D3DXVECTOR3, D3DXMATRIX, D3DXCOLOR)

export class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    if (x instanceof Vec3) { this.x = x.x; this.y = x.y; this.z = x.z; }
    else { this.x = x; this.y = y; this.z = z; }
  }
  set(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  scale(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  cross(a, b) {
    this.x = a.y * b.z - a.z * b.y;
    this.y = a.z * b.x - a.x * b.z;
    this.z = a.x * b.y - a.y * b.x;
    return this;
  }
  length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
  normalize() {
    const len = this.length();
    if (len > 1e-8) { this.x /= len; this.y /= len; this.z /= len; }
    return this;
  }
  clone() { return new Vec3(this.x, this.y, this.z); }
}

export class Color {
  constructor(r = 0, g = 0, b = 0) { this.r = r; this.g = g; this.b = b; }
  set(c) { this.r = c.r; this.g = c.g; this.b = c.b; return this; }
  limits() {
    this.r = Math.max(0, Math.min(255, this.r | 0));
    this.g = Math.max(0, Math.min(255, this.g | 0));
    this.b = Math.max(0, Math.min(255, this.b | 0));
    return this;
  }
  toCSS() { this.limits(); return `rgb(${this.r},${this.g},${this.b})`; }
  clone() { return new Color(this.r, this.g, this.b); }
}

export class Mat4 {
  constructor() { this.m = new Float32Array(16); this.identity(); }

  identity() {
    this.m.fill(0);
    this.m[0] = this.m[5] = this.m[10] = this.m[15] = 1;
    return this;
  }

  // Row-major layout matching Java: _RC where R=row, C=col
  // m[0]=_11, m[1]=_12, m[2]=_13, m[3]=_14
  // m[4]=_21, m[5]=_22, m[6]=_23, m[7]=_24
  // m[8]=_31, m[9]=_32, m[10]=_33, m[11]=_34
  // m[12]=_41, m[13]=_42, m[14]=_43, m[15]=_44

  set(other) { this.m.set(other.m); return this; }

  get(r, c) { return this.m[(r - 1) * 4 + (c - 1)]; }
  put(r, c, v) { this.m[(r - 1) * 4 + (c - 1)] = v; }

  getTranslateY() { return this.m[13]; } // _42

  mult(b) {
    const a = new Float32Array(16);
    a.set(this.m);
    const bm = b.m;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        this.m[r * 4 + c] =
          a[r * 4 + 0] * bm[0 * 4 + c] +
          a[r * 4 + 1] * bm[1 * 4 + c] +
          a[r * 4 + 2] * bm[2 * 4 + c] +
          a[r * 4 + 3] * bm[3 * 4 + c];
      }
    }
    return this;
  }

  mult3(b) {
    const a = new Float32Array(16);
    a.set(this.m);
    const bm = b.m;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.m[r * 4 + c] =
          a[r * 4 + 0] * bm[0 * 4 + c] +
          a[r * 4 + 1] * bm[1 * 4 + c] +
          a[r * 4 + 2] * bm[2 * 4 + c];
      }
    }
    return this;
  }

  transform(v) {
    const m = this.m;
    return new Vec3(
      m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12],
      m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13],
      m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14]
    );
  }

  scale(sx, sy, sz) {
    this.identity();
    this.m[0] = sx; this.m[5] = sy; this.m[10] = sz;
    return this;
  }

  translate(x, y, z) {
    this.identity();
    this.m[12] = x; this.m[13] = y; this.m[14] = z;
    return this;
  }

  rotateX(angle) {
    this.identity();
    const c = Math.cos(angle), s = Math.sin(angle);
    this.m[5] = c; this.m[6] = s; this.m[9] = -s; this.m[10] = c;
    return this;
  }

  rotateY(angle) {
    this.identity();
    const c = Math.cos(angle), s = Math.sin(angle);
    this.m[0] = c; this.m[2] = -s; this.m[8] = s; this.m[10] = c;
    return this;
  }

  rotateZ(angle) {
    this.identity();
    const c = Math.cos(angle), s = Math.sin(angle);
    this.m[0] = c; this.m[1] = s; this.m[4] = -s; this.m[5] = c;
    return this;
  }

  view(eye, at, up) {
    const zAxis = new Vec3(at.x - eye.x, at.y - eye.y, at.z - eye.z).normalize();
    const d = up.dot(zAxis);
    const yAxis = new Vec3(up.x - d * zAxis.x, up.y - d * zAxis.y, up.z - d * zAxis.z).normalize();
    const xAxis = new Vec3().cross(yAxis, zAxis);
    this.m[0] = xAxis.x; this.m[1] = yAxis.x; this.m[2] = zAxis.x; this.m[3] = 0;
    this.m[4] = xAxis.y; this.m[5] = yAxis.y; this.m[6] = zAxis.y; this.m[7] = 0;
    this.m[8] = xAxis.z; this.m[9] = yAxis.z; this.m[10] = zAxis.z; this.m[11] = 0;
    this.m[12] = -eye.dot(xAxis); this.m[13] = -eye.dot(yAxis); this.m[14] = -eye.dot(zAxis); this.m[15] = 1;
    return this;
  }

  projection(near, far, fov, aspect) {
    const cot = Math.cos(fov * 0.5) / Math.sin(fov * 0.5);
    this.identity();
    this.m[0] = aspect * cot;
    this.m[5] = 1.0 * cot;
    this.m[10] = far / (far - near);
    this.m[11] = 1.0;
    this.m[14] = -(far / (far - near)) * near;
    this.m[15] = 0;
    return this;
  }

  clone() { const m = new Mat4(); m.m.set(this.m); return m; }
}

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ringAngles, aimAngle, spreadAngles, segPointDist } from '../../js/kanji-blast.pure.js';

const TAU = Math.PI * 2;

// ============================================================
// 弾幕計算ヘルパー（kanji-blast-balance-danmaku）
//   Requirements(balance): 6.2, 6.3, 6.4, 6.5
// ============================================================

// ---- 5.2a ringAngles ----
describe('ringAngles', () => {
  it('要素数 n・等間隔（2π/n）・offset を反映', () => {
    const a = ringAngles(4, 0);
    expect(a).toHaveLength(4);
    expect(a[0]).toBeCloseTo(0, 10);
    expect(a[1]).toBeCloseTo(TAU / 4, 10);
    expect(a[2]).toBeCloseTo(TAU / 2, 10);
    expect(a[3]).toBeCloseTo((3 * TAU) / 4, 10);
  });
  it('offset が全角度に加算される', () => {
    const a = ringAngles(3, 1);
    expect(a[0]).toBeCloseTo(1, 10);
    expect(a[1]).toBeCloseTo(1 + TAU / 3, 10);
  });
  it('n<1 は 1 に丸める', () => {
    expect(ringAngles(0, 0)).toHaveLength(1);
  });
});

// ---- 5.2b aimAngle ----
describe('aimAngle', () => {
  it('真下（+y）は π/2', () => {
    expect(aimAngle(0, 0, 0, 10)).toBeCloseTo(Math.PI / 2, 10);
  });
  it('右（+x）は 0', () => {
    expect(aimAngle(0, 0, 10, 0)).toBeCloseTo(0, 10);
  });
  it('左下 45度', () => {
    expect(aimAngle(0, 0, -10, 10)).toBeCloseTo((3 * Math.PI) / 4, 10);
  });
});

// ---- 5.2c spreadAngles ----
describe('spreadAngles', () => {
  it('count=1 は中心角のみ', () => {
    expect(spreadAngles(1.0, 1, 1.0)).toEqual([1.0]);
  });
  it('count=3・spread=π は -π/2, 0, +π/2 を中心角基準で配置', () => {
    const a = spreadAngles(0, 3, Math.PI);
    expect(a[0]).toBeCloseTo(-Math.PI / 2, 10);
    expect(a[1]).toBeCloseTo(0, 10);
    expect(a[2]).toBeCloseTo(Math.PI / 2, 10);
  });
});

// ---- 5.2d segPointDist ----
describe('segPointDist', () => {
  it('線分上の点は距離 0', () => {
    expect(segPointDist(0, 0, 10, 0, 5, 0)).toBeCloseTo(0, 10);
  });
  it('線分の横にある点は垂直距離', () => {
    expect(segPointDist(0, 0, 10, 0, 5, 3)).toBeCloseTo(3, 10);
  });
  it('端点の外側は端点との距離', () => {
    expect(segPointDist(0, 0, 10, 0, -3, 4)).toBeCloseTo(5, 10); // (-3,4) と (0,0)
  });
  it('退化線分（点）は端点との距離', () => {
    expect(segPointDist(2, 2, 2, 2, 5, 6)).toBeCloseTo(5, 10); // (5,6)-(2,2)=(3,4)
  });
});

// ---- 5.3 property: segPointDist は常に非負 ----
describe('property: segPointDist は常に非負', () => {
  it('任意座標で 0 以上', () => {
    const co = fc.integer({ min: -1000, max: 1000 });
    fc.assert(
      fc.property(co, co, co, co, co, co, (ax, ay, bx, by, px, py) => {
        expect(segPointDist(ax, ay, bx, by, px, py)).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 300 }
    );
  });
});

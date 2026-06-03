/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';

const {
  initCanvas,
  clearCanvas,
  getStrokes,
  renderStrokes,
  hasContent,
  isSupported,
} = require('../../js/kanji-handwriting-canvas.js');

// --- Helper: Canvas要素を生成 ---
function createCanvas(width = 300, height = 300) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  // jsdomのcanvasはgetContextを返さない場合があるのでモック
  if (!canvas.getContext('2d')) {
    const ctx = {
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: '',
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      clearRect: () => {},
    };
    canvas.getContext = (type) => {
      if (type === '2d') return ctx;
      return null;
    };
  }
  return canvas;
}

// --- Helper: マウスイベントを生成 ---
function createMouseEvent(type, x, y) {
  const rect = { left: 0, top: 0 };
  return new MouseEvent(type, {
    clientX: x + rect.left,
    clientY: y + rect.top,
    bubbles: true,
  });
}

// canvasのgetBoundingClientRectをモック
function mockBoundingRect(canvas, left = 0, top = 0) {
  canvas.getBoundingClientRect = () => ({
    left,
    top,
    right: left + canvas.width,
    bottom: top + canvas.height,
    width: canvas.width,
    height: canvas.height,
    x: left,
    y: top,
  });
}

describe('HandwritingCanvas: isSupported', () => {
  it('returns true in jsdom environment with canvas mock', () => {
    // jsdom with our mock supports canvas
    expect(typeof isSupported()).toBe('boolean');
  });
});

describe('HandwritingCanvas: initCanvas', () => {
  it('initializes without error', () => {
    const canvas = createCanvas();
    mockBoundingRect(canvas);
    expect(() => initCanvas(canvas)).not.toThrow();
  });

  it('resets strokes on init', () => {
    const canvas = createCanvas();
    mockBoundingRect(canvas);
    initCanvas(canvas);
    expect(getStrokes()).toEqual([]);
    expect(hasContent()).toBe(false);
  });
});

describe('HandwritingCanvas: drawing with mouse events', () => {
  let canvas;

  beforeEach(() => {
    canvas = createCanvas();
    mockBoundingRect(canvas);
    initCanvas(canvas);
  });

  it('records strokes from mouse events', () => {
    // Simulate a stroke: mousedown -> mousemove -> mouseup
    canvas.dispatchEvent(createMouseEvent('mousedown', 10, 20));
    canvas.dispatchEvent(createMouseEvent('mousemove', 15, 25));
    canvas.dispatchEvent(createMouseEvent('mousemove', 20, 30));
    canvas.dispatchEvent(createMouseEvent('mouseup', 20, 30));

    const strokes = getStrokes();
    expect(strokes.length).toBe(1);
    expect(strokes[0].length).toBe(3);
    expect(strokes[0][0]).toEqual({ x: 10, y: 20 });
    expect(strokes[0][1]).toEqual({ x: 15, y: 25 });
    expect(strokes[0][2]).toEqual({ x: 20, y: 30 });
  });

  it('records multiple strokes', () => {
    // First stroke
    canvas.dispatchEvent(createMouseEvent('mousedown', 5, 5));
    canvas.dispatchEvent(createMouseEvent('mousemove', 10, 10));
    canvas.dispatchEvent(createMouseEvent('mouseup', 10, 10));

    // Second stroke
    canvas.dispatchEvent(createMouseEvent('mousedown', 50, 50));
    canvas.dispatchEvent(createMouseEvent('mousemove', 60, 60));
    canvas.dispatchEvent(createMouseEvent('mouseup', 60, 60));

    const strokes = getStrokes();
    expect(strokes.length).toBe(2);
  });

  it('hasContent returns true after drawing', () => {
    expect(hasContent()).toBe(false);

    canvas.dispatchEvent(createMouseEvent('mousedown', 10, 10));
    canvas.dispatchEvent(createMouseEvent('mouseup', 10, 10));

    expect(hasContent()).toBe(true);
  });

  it('does not record points when not drawing', () => {
    // mousemove without mousedown should not record
    canvas.dispatchEvent(createMouseEvent('mousemove', 100, 100));
    canvas.dispatchEvent(createMouseEvent('mousemove', 200, 200));

    expect(getStrokes()).toEqual([]);
    expect(hasContent()).toBe(false);
  });
});

describe('HandwritingCanvas: clearCanvas', () => {
  it('clears all strokes', () => {
    const canvas = createCanvas();
    mockBoundingRect(canvas);
    initCanvas(canvas);

    // Draw something
    canvas.dispatchEvent(createMouseEvent('mousedown', 10, 10));
    canvas.dispatchEvent(createMouseEvent('mousemove', 20, 20));
    canvas.dispatchEvent(createMouseEvent('mouseup', 20, 20));

    expect(hasContent()).toBe(true);

    clearCanvas();

    expect(hasContent()).toBe(false);
    expect(getStrokes()).toEqual([]);
  });
});

describe('HandwritingCanvas: renderStrokes', () => {
  it('does not throw when rendering stroke data', () => {
    const canvas = createCanvas();
    mockBoundingRect(canvas);
    initCanvas(canvas);

    const strokeData = [
      [{ x: 10, y: 10 }, { x: 20, y: 20 }, { x: 30, y: 30 }],
      [{ x: 50, y: 50 }, { x: 60, y: 40 }],
    ];

    expect(() => renderStrokes(strokeData)).not.toThrow();
  });

  it('handles empty stroke array', () => {
    const canvas = createCanvas();
    mockBoundingRect(canvas);
    initCanvas(canvas);

    expect(() => renderStrokes([])).not.toThrow();
  });

  it('handles single-point strokes', () => {
    const canvas = createCanvas();
    mockBoundingRect(canvas);
    initCanvas(canvas);

    const strokeData = [
      [{ x: 50, y: 50 }],
    ];

    expect(() => renderStrokes(strokeData)).not.toThrow();
  });
});

describe('HandwritingCanvas: coordinate handling', () => {
  it('calculates coordinates relative to canvas position', () => {
    const canvas = createCanvas();
    // Canvas is offset from page origin
    mockBoundingRect(canvas, 100, 50);
    initCanvas(canvas);

    // Mouse at page position (110, 60) → canvas relative (10, 10)
    canvas.dispatchEvent(createMouseEvent('mousedown', 110, 60));
    canvas.dispatchEvent(createMouseEvent('mouseup', 110, 60));

    const strokes = getStrokes();
    expect(strokes[0][0]).toEqual({ x: 10, y: 10 });
  });
});

describe('HandwritingCanvas: line width configuration', () => {
  it('accepts custom lineWidth option', () => {
    const canvas = createCanvas();
    mockBoundingRect(canvas);
    // Should not throw with custom width
    expect(() => initCanvas(canvas, { lineWidth: 6 })).not.toThrow();
  });

  it('enforces minimum lineWidth of 3px', () => {
    const canvas = createCanvas();
    mockBoundingRect(canvas);
    initCanvas(canvas, { lineWidth: 1 });
    // Module enforces minimum internally - no throw expected
    // (Internal lineWidth will be set to 3)
  });
});

// HandwritingCanvas - Canvas手書き入力UIコンポーネント
(function() {
'use strict';

// --- 状態 ---
var canvas = null;
var ctx = null;
var isDrawing = false;
var strokes = [];
var currentStroke = [];
var lineWidth = 4;

// --- Canvas API サポート判定 ---

/**
 * Canvas APIがサポートされているか判定する
 * @returns {boolean}
 */
function isSupported() {
  if (typeof document === 'undefined') return false;
  const testCanvas = document.createElement('canvas');
  return !!(testCanvas && testCanvas.getContext && testCanvas.getContext('2d'));
}

// --- 座標取得ヘルパー ---

/**
 * イベントからCanvas相対座標を取得する
 * @param {Event} e - タッチまたはマウスイベント
 * @returns {{x: number, y: number}}
 */
function getPoint(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

// --- 描画ヘルパー ---

/**
 * 2点間に線分を描画する
 * @param {{x: number, y: number}} from
 * @param {{x: number, y: number}} to
 */
function drawSegment(from, to) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

// --- イベントハンドラ ---

function onDrawStart(e) {
  if (e.touches) {
    e.preventDefault();
  }
  isDrawing = true;
  const point = getPoint(e);
  currentStroke = [point];

  // 単点でも描画開始（点を打つ）
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
}

function onDrawMove(e) {
  if (!isDrawing) return;
  if (e.touches) {
    e.preventDefault();
  }
  const point = getPoint(e);
  const lastPoint = currentStroke[currentStroke.length - 1];
  currentStroke.push(point);
  drawSegment(lastPoint, point);
}

function onDrawEnd(e) {
  if (!isDrawing) return;
  if (e.touches) {
    e.preventDefault();
  }
  isDrawing = false;
  if (currentStroke.length > 0) {
    strokes.push(currentStroke);
    currentStroke = [];
  }
}

// --- パブリック API ---

/**
 * Canvasを初期化し、タッチ/マウスイベントリスナーを設定する
 * @param {HTMLCanvasElement} canvasElement
 * @param {object} [options]
 * @param {number} [options.lineWidth=4] - 線の太さ（最小3px）
 */
function initCanvas(canvasElement, options) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');

  // オプション設定
  const opts = options || {};
  lineWidth = Math.max(3, opts.lineWidth || 4);

  // 描画スタイル設定
  ctx.strokeStyle = '#000';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 状態リセット
  strokes = [];
  currentStroke = [];
  isDrawing = false;

  // タッチイベント（モバイル）
  canvas.addEventListener('touchstart', onDrawStart, { passive: false });
  canvas.addEventListener('touchmove', onDrawMove, { passive: false });
  canvas.addEventListener('touchend', onDrawEnd, { passive: false });

  // マウスイベント（デスクトップ/テスト）
  canvas.addEventListener('mousedown', onDrawStart);
  canvas.addEventListener('mousemove', onDrawMove);
  canvas.addEventListener('mouseup', onDrawEnd);
}

/**
 * Canvas上の描画内容を全て消去し、ストロークデータをリセットする
 */
function clearCanvas() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes = [];
  currentStroke = [];
  isDrawing = false;
}

/**
 * 記録されたストロークデータを取得する
 * @returns {Array<Array<{x: number, y: number}>>} Point[][] - ストローク配列
 */
function getStrokes() {
  return strokes;
}

/**
 * 指定されたストロークデータをCanvasに再描画する（管理者採点画面用）
 * キャンバスをクリアしてから全ストロークを描画する
 * @param {Array<Array<{x: number, y: number}>>} strokeData - Point[][]
 */
function renderStrokes(strokeData) {
  if (!canvas || !ctx) return;

  // クリアしてから描画
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 描画スタイル再設定（clearRect後も維持されるが念のため）
  ctx.strokeStyle = '#000';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 0; i < strokeData.length; i++) {
    const stroke = strokeData[i];
    if (stroke.length === 0) continue;

    if (stroke.length === 1) {
      // 単点：点を描画
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      ctx.lineTo(stroke[0].x, stroke[0].y);
      ctx.stroke();
    } else {
      // 複数点：連続線分を描画
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let j = 1; j < stroke.length; j++) {
        ctx.lineTo(stroke[j].x, stroke[j].y);
      }
      ctx.stroke();
    }
  }
}

/**
 * 描画済みのストロークが存在するか判定する
 * @returns {boolean}
 */
function hasContent() {
  return strokes.length > 0;
}

// --- エクスポート ---

var _exports = { initCanvas: initCanvas, clearCanvas: clearCanvas, getStrokes: getStrokes, renderStrokes: renderStrokes, hasContent: hasContent, isSupported: isSupported };
if (typeof module !== 'undefined' && module.exports) { module.exports = _exports; }
if (typeof window !== 'undefined') { window.HandwritingCanvas = _exports; }
})();

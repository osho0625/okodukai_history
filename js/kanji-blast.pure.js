// ============================================================
// 漢字合体 -カンジニオン- 純粋関数モジュール（唯一の実体）
// ------------------------------------------------------------
//  このファイルが対象純粋関数の「唯一の実装実体」です。
//  - ブラウザ: classic script として読み込まれ、window に公開されます
//    （kanji-blast.js より前に読み込むこと）。
//  - テスト: vitest から import して同一実体を検証します。
//  テスト用にロジックを写経した「ミラー実装」は作りません。
//
//  設計方針:
//  - 外部状態（MASTER / dex / player / RECIPE_BY_RESULT）に依存する関数は、
//    状態を引数で受け取る「純粋コア（*Pure）」として定義します。
//  - 本番 kanji-blast.js 側は、グローバル状態を渡すだけの薄いラッパーで
//    従来の関数名・シグネチャを維持します（計算ロジックは不変）。
// ============================================================

(function (root, factory) {
  const api = factory();
  // CommonJS / ESM interop（vitest 用）
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  // ブラウザ用: グローバルへ個別公開（従来のグローバル関数名を維持）
  if (root) {
    for (const k in api) {
      if (Object.prototype.hasOwnProperty.call(api, k)) root[k] = api[k];
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ---- 定数 ----
  const KENTEI_FACTOR = {
    '10': 1.0, '9': 1.2, '8': 1.4, '7': 1.6, '6': 1.8, '5': 2.0,
    '4': 2.4, '3': 2.8, '準2': 3.2, '2': 3.6, '準1': 4.2, '1': 5.0
  };

  // ============================================================
  // 読み仮名の判定（状態非依存）
  // ============================================================
  function toHira(s) {
    return s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  }
  function toKata(s) {
    return s.replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
  }
  function normInput(s) {
    return (s || '').trim().replace(/\s/g, '').replace(/[・･]/g, '');
  }

  // 送り仮名の活用ゆらぎ判定用に、語幹（"."より前）と送りを分ける
  function readingParts(kana) {
    const idx = kana.indexOf('.');
    if (idx < 0) return { stem: kana, okuri: '' };
    return { stem: kana.slice(0, idx), okuri: kana.slice(idx + 1) };
  }

  // 入力 input が reading(kana) にマッチするか判定する。
  // 戻り値: マッチスコア（大きいほど良い一致、不一致は -1）。
  function matchScore(input, kana, char) {
    const inHira = toHira(input);
    const { stem, okuri } = readingParts(kana);
    const stemHira = toHira(stem);

    // 音読み等（送り仮名なし）: 完全一致のみ（ひら/カナ両対応）
    if (!okuri) {
      const kHira = toHira(kana);
      if (inHira === kHira) return kHira.length + 100; // 完全一致は高スコア
      return -1;
    }

    // 訓読み（送り仮名あり）
    const fullHira = toHira(stem + okuri); // うまれる
    // 表記入力（生まれる）→ 漢字を送り仮名に置換したものと比較
    const inKanaFromWriting = toHira(input.replace(char, stem)); // 「生まれる」→「うまれる」

    // 完全一致（かな or 表記）
    if (inHira === fullHira || inKanaFromWriting === fullHira) return fullHira.length + 100;

    // 活用ゆらぎ: 語幹 + 送り(1文字以上)。うまれた/うむ 等。
    const candidates = [inHira, inKanaFromWriting];
    for (const cand of candidates) {
      if (cand.startsWith(stemHira) && cand.length > stemHira.length) {
        return stemHira.length; // 語幹が長いほど優先される
      }
    }
    return -1;
  }

  // 入力に一致する readings を探して正規形 display を返す純粋コア。
  // master: char -> {readings:[{kana,display}]} を持つオブジェクト（本番の MASTER）
  function resolveReadingPure(master, char, input) {
    const m = master[char];
    if (!m || !Array.isArray(m.readings)) return null;
    const norm = normInput(input);
    if (!norm) return null;
    let best = null, bestScore = -1;
    for (const r of m.readings) {
      const sc = matchScore(norm, r.kana, char);
      if (sc > bestScore) { bestScore = sc; best = r.display; }
    }
    return bestScore >= 0 ? best : null;
  }

  // ============================================================
  // レシピ索引（recipeParts/partKey は状態非依存）
  // ============================================================
  function recipeParts(rc) {
    return [rc.part_a, rc.part_b, rc.part_c].filter(Boolean);
  }
  function partKey(parts) { return parts.slice().sort().join('|'); }

  // パーツ配列に含まれる最大画数（分解の優先度に使用）純粋コア。
  function partsMaxStrokePure(master, parts) {
    return parts.reduce((m, c) => Math.max(m, (master[c] && master[c].strokes) || 0), 0);
  }

  // result_char の分解先レシピを1つ選ぶ純粋コア。
  // recipeByResult: result_char -> [ [parts...], ... ]
  function chooseSplitRecipePure(master, recipeByResult, char) {
    const list = recipeByResult[char];
    if (!list || list.length === 0) return null;
    return list.slice().sort((a, b) => partsMaxStrokePure(master, b) - partsMaxStrokePure(master, a))[0];
  }

  // ============================================================
  // Plus_Value（+値）
  // ============================================================
  // 合成後の+値 = 素材の+合計 + 1、plus_cap で上限クリップ（純粋コア）
  function mergedPlusPure(items, plusCap) {
    const sum = items.reduce((s, it) => s + (it.plus || 0), 0) + 1;
    const cap = plusCap || 3;
    return Math.min(sum, cap);
  }

  // 分解時の各素材の+ = floor((結果の+ - 1) / 素材数)（端数切り捨て、0未満は0）
  function splitPlus(resultPlus, partCount) {
    return Math.max(0, Math.floor(((resultPlus || 0) - 1) / partCount));
  }

  // ============================================================
  // 強さ計算
  // ============================================================
  function kenteiFactor(level) { return KENTEI_FACTOR[level] || 1.0; }

  // 図鑑に登録済みの、その漢字の読み数（純粋コア）
  function unlockedReadingCountPure(dex, char) {
    return dex.filter(d => d.char === char).length;
  }
  // 図鑑に1つでも読みが登録された漢字の種類数（純粋コア）
  function dexCharCountPure(dex) {
    return new Set(dex.map(d => d.char)).size;
  }
  function overallBonusPure(dex) {
    return 1 + dexCharCountPure(dex) * 0.02;
  }

  // 漢字パワー（純粋コア）
  function kanjiPowerPure(master, dex, char, plus) {
    const m = master[char];
    if (!m) return 0;
    const p = plus || 0;
    const base = m.strokes * kenteiFactor(m.kentei_level) * (1 + unlockedReadingCountPure(dex, char) * 0.1);
    return Math.round(base * overallBonusPure(dex) * (1 + p * 0.05));
  }

  return {
    KENTEI_FACTOR,
    toHira, toKata, normInput, readingParts, matchScore, resolveReadingPure,
    recipeParts, partKey, partsMaxStrokePure, chooseSplitRecipePure,
    mergedPlusPure, splitPlus,
    kenteiFactor, unlockedReadingCountPure, dexCharCountPure, overallBonusPure,
    kanjiPowerPure
  };
});

// Alexa Lambda ハンドラー（alexa/lambda/index.js）のリグレッションテスト
// fix-design.md「リグレッションテスト設計 — 追加テストケース（テスト1〜7）」準拠
//
// 前提:
// - CommonJS（require）形式。vitest.config.js は globals:false のため vitest API を明示 import する
// - index.js の内部シンボルは _test 経由で参照する（NODE_ENV='test' ガード付き公開）
// - 外部通信の https のみ spyOn でモックし、内部ロジックはモックしない（vi.mock は CommonJS require に効かないため不使用）

import { describe, it, expect, afterEach, vi } from 'vitest';
const https = require('https');
const EventEmitter = require('events');

// index.js を require する前に NODE_ENV を 'test' に設定し、_test エクスポートを有効化する
process.env.NODE_ENV = 'test';

// index.js のパス（tests/alexa/ から見て ../../alexa/lambda/index.js）
const indexModule = require('../../alexa/lambda/index.js');
const _test = indexModule._test;

// 対話モデル（CHORE_NAME スロット整合検証用）
const interactionModel = require('../../alexa/interactionModels/ja-JP.json');

describe('alexa/lambda/index.js リグレッションテスト', () => {
  afterEach(() => {
    // テスト7 の https.request spy を含む全モックを復元し、他テストへの影響を防ぐ
    vi.restoreAllMocks();
  });

  // テスト1: SUPABASE_URL が "undefined" 文字列でなく "https://" で始まる有効URLであること
  it('テスト1: SUPABASE_URL が "undefined" でなく https:// で始まる有効URLであること', () => {
    expect(_test.SUPABASE_URL).not.toBe('undefined');
    expect(typeof _test.SUPABASE_URL).toBe('string');
    expect(_test.SUPABASE_URL.startsWith('https://')).toBe(true);
  });

  // テスト2: SUPABASE_KEY が truthy で "undefined"/空文字/null でない文字列であること
  it('テスト2: SUPABASE_KEY が truthy で "undefined"/空文字/null でない文字列であること', () => {
    expect(_test.SUPABASE_KEY).toBeTruthy();
    expect(typeof _test.SUPABASE_KEY).toBe('string');
    expect(_test.SUPABASE_KEY).not.toBe('undefined');
    expect(_test.SUPABASE_KEY).not.toBe('');
    expect(_test.SUPABASE_KEY).not.toBeNull();
  });

  // テスト3: httpRequest に不正URLを渡すと TypeError: Invalid URL が throw（reject）されること
  it('テスト3: httpRequest("undefined/rest/v1/children", {}) が Invalid URL を reject すること', async () => {
    // httpRequest は Promise を返すため rejects.toThrow で検証する
    await expect(_test.httpRequest('undefined/rest/v1/children', {})).rejects.toThrow(/Invalid URL/);
  });

  // テスト4: ja-JP.json の CHORE_NAME スロット値がすべて DEFAULT_POINTS に登録されていること
  it('テスト4: CHORE_NAME スロット値のうち DEFAULT_POINTS 未登録の家事名が 0 件であること', () => {
    // ja-JP.json の構造: interactionModel.languageModel.types[] から name === 'CHORE_NAME' を探す
    const types = interactionModel.interactionModel.languageModel.types;
    const choreType = types.find((t) => t.name === 'CHORE_NAME');
    expect(choreType).toBeTruthy();

    // CHORE_NAME スロット値一覧（values[].name.value）
    const choreNames = choreType.values.map((v) => v.name.value);
    expect(choreNames.length).toBeGreaterThan(0);

    // DEFAULT_POINTS に未登録の家事名を抽出
    // 'その他' はフォールバック許容名のため除外する
    const missing = choreNames.filter(
      (name) => name !== 'その他' && _test.DEFAULT_POINTS[name] === undefined
    );

    expect(missing).toEqual([]);
  });

  // テスト5: normalizeChildName の音声誤認識補正確認
  it('テスト5: normalizeChildName がエイリアス・正規名・null を正しく扱うこと', () => {
    expect(_test.normalizeChildName('しゅんちか')).toBe('はるちか');
    expect(_test.normalizeChildName('はるちか')).toBe('はるちか');
    expect(_test.normalizeChildName(null)).toBe(null);
  });

  // テスト6: DEFAULT_POINTS['タオル畳み'] が 5 であること
  it('テスト6: DEFAULT_POINTS["タオル畳み"] が 5 であること', () => {
    expect(_test.DEFAULT_POINTS['タオル畳み']).toBe(5);
  });

  // テスト7: sendDiscord がネットワークエラー時に reject しない（resolve する）こと
  it('テスト7: sendDiscord が通信エラー時に reject せず resolve すること', async () => {
    // https.request をネットワークエラーを即時 emit する実装に差し替える。
    // index.js 内の require('https') はプロセス共有インスタンスのため spyOn が反映される。
    vi.spyOn(https, 'request').mockImplementation(() => {
      const req = new EventEmitter();
      req.write = () => {};
      req.end = () => {};
      // 次tickでネットワークエラーを発火（httpRequest 内の req.on('error', reject) に伝播）
      setImmediate(() => {
        req.emit('error', new Error('network error'));
      });
      return req;
    });

    // sendDiscord は内部で httpRequest を try/catch し握りつぶす設計のため resolve するはず
    await expect(_test.sendDiscord('test message')).resolves.toBeUndefined();
  });
});

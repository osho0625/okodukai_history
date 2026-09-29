# 実装計画: 漢字合体 -カンジニオン- 強さ再設計＆弾幕強化（kanji-blast-balance-danmaku）

## 概要

本計画は、既存ゲーム kanji-blast に対する3つの機能変更（手持ち画面3分割・強さ計算再設計・ボス弾幕強化）を、検証可能な単位で段階的に実装します。既存の「純粋関数は `js/kanji-blast.pure.js` を唯一の実体とし、本番とテストが同一実体を参照する（ミラー実装禁止）」方針を厳守します。

対応ドキュメント:
- 要件: `.kiro/specs/kanji-blast-balance-danmaku/requirements.md`
- 設計: `.kiro/specs/kanji-blast-balance-danmaku/design.md`

### 前提・ツール

- テスト基盤: リポジトリルート `package.json` の vitest + fast-check。テストは `npm test`（= `vitest --run`）で単発実行。watch モードは使わない。kanji 系だけなら `npm test -- tests/kanji-blast`。
- 変更対象: `js/kanji-blast.pure.js`（純粋コア）/ `js/kanji-blast.js`（STG・ラッパー）/ `pages/kanji-blast.html`（画面・描画）。
- 既存のセーブデータ・データモデルは変更しない（Requirement 8）。

### 大原則

- **純粋関数は pure.js が唯一の実体。** 強さ計算・弾幕計算の純粋部分は pure.js に置き、本番とテストが同一実体を import する。ミラー実装は作らない。
- **既存挙動の非破壊。** 合体/分解の+値・読み判定・レシピ・図鑑・ドロップ・スコア・残機・必殺の挙動は変えない。変えるのは Final_Power の算出方法・画面構成・ボス弾幕のみ。
- **バランス値は設定化。** ボスHP係数・弾種パラメータ（`BULLET_DEFS`）・弾数上限（`MAX_ACTIVE_BULLETS`）・スペルしきい値は定数として1か所に置き、プレイテストで調整可能にする。
- 各タスクは検証対象の Requirement 番号を明記する。

### タスクの読み方

- `*` 付きサブタスク = 任意（スキップ可）。コーディングエージェントは実装しない。
- 「【ユーザー実行】」= ブラウザ手動確認や push を伴い、エージェント単独では完結しない手順。

---

## タスク

- [ ] 1. 強さ計算の再設計（純粋コア）
  - [x] 1.1 `kenteiBoost(level)` を pure.js に追加
    - `KENTEI_FACTOR` の最小値 Fmin・最大値 Fmax を表から算出し、`1 + 0.5 × (KENTEI_FACTOR(level) - Fmin) / (Fmax - Fmin)` を返す
    - Fmax = Fmin のときは 1.0 を返す（0除算回避）
    - 未定義級は `kenteiFactor` フォールバック 1.0 に基づき 1.0
    - _Requirements: 2.2, 2.2a, 2.3, 2.4_
  - [x] 1.2 `plusBoost(plus, plusCap)` を pure.js に追加
    - `1 + 0.5 × clamp(plus, 0, plusCap) / max(plusCap, 1)`。clamp で負数→0・cap超過→cap
    - plusCap が 0/未取得（falsy）でも分母は `max(plusCap,1)=1` で 0除算しない
    - _Requirements: 2.5, 2.6, 2.6a_
  - [x] 1.3 `kanjiPowerPure` を新式に変更（引数に plusCap 追加）
    - `round( strokes × kenteiBoost × plusBoost(plus, plusCap) × (1 + 読み数×0.1) × (1 + 図鑑種類数×0.02) )`
    - master に char が無ければ 0、plus 省略時は 0 扱い（plusBoost=1.0）
    - _Requirements: 2.1, 2.7, 2.8, 2.10_
  - [x] 1.4 本番ラッパー `kanjiPower(char, plus)` を更新（kanji-blast.js）
    - `player.plus_cap`（未取得フォールバック 3）を `kanjiPowerPure` に渡す
    - `stgConfig()` のショット/必殺威力は係数据え置き（Final_Power / ×6 / 未装備5・30）
    - _Requirements: 2.10, 2.11, 2.13_

- [ ] 2. 強さ計算のテスト
  - [x] 2.1 `kenteiBoost` のユニットテスト
    - 10級=1.00 / 5級=1.125 / 2級=1.325 / 1級=1.50（境界と代表値）、未定義級=1.00
    - _Requirements: 2.2, 2.3, 2.4_
  - [x] 2.2 `plusBoost` のユニットテスト
    - plus=0→1.0、plus=cap→1.5、plus>cap→1.5、**負数→1.0**、cap=0/未取得→1.0（0除算なし）
    - _Requirements: 2.5, 2.6, 2.6a_
  - [x] 2.3 `kanjiPowerPure` のユニットテスト
    - 新式の境界値（比較例表: 10級/1級 × +0/+cap）を固定。char 無し→0
    - _Requirements: 2.1, 2.8_
  - [x]* 2.4 `kenteiBoost` / `plusBoost` の範囲プロパティテスト
    - **Property**: 任意入力（負数・巨大値・0/未取得 cap 含む）で戻り値が [1.0, 1.5] に収まる
    - **Validates: Requirements 2.3, 2.6**
  - [x]* 2.5 `kanjiPowerPure` の単調性プロパティテスト
    - **Property**: 他項固定で `plus1 ≤ plus2 → kanjiPowerPure(...,plus1) ≤ kanjiPowerPure(...,plus2)`
    - **Validates: Requirements 2.9**

- [x] 3. チェックポイント — 強さ計算テストが緑
  - `npm test -- tests/kanji-blast` で強さ計算の新テストが全て通ることを確認。図鑑・装備の Power 表示が新値になることを後続のブラウザ確認（タスク10）で見る前提。問題があればユーザーに相談。

- [ ] 4. 手持ち系画面の3分割（合体 / 分解 / 装備・手持ち）
  - [x] 4.1 HTML の画面・グリッド・メニュー再編（pages/kanji-blast.html）
    - `invScreen` を `mergeScreen`（🔧 合体）と `splitScreen`（✂ 分解）に分割、グリッドを `mergeGrid` / `splitGrid` に。`equipScreen` は現行維持
    - メニューのボタンを「🔧 合体」「✂ 分解」「⚔ 装備・手持ち」「📖 図鑑」に再編
    - 各画面に相互遷移ボタンと「← メニュー」を配置
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 4.2 画面遷移関数と描画先の切替（kanji-blast.js）
    - `openMerge()` / `openSplit()` / `openEquip()` を追加（各 `selected = []` → `showScreen` → `renderInventory`）
    - `activeInvGrid()` を3画面対応（`mergeGrid` / `splitGrid` / `equipGrid`）に拡張
    - `renderInventory` はアクティブグリッドに描画、`updateRecipePreview` / `updateInvButtons` は null 安全
    - 合体は2〜3選択で活性、分解は1選択かつ分解可能で活性
    - 相互遷移でも遷移先で `selected = []`（引き継がない）
    - _Requirements: 1.3, 1.4, 1.5, 1.5a, 1.6, 1.7, 1.8, 1.9, 1.10_

- [ ] 5. 弾幕計算の純粋関数化
  - [x] 5.1 弾幕ヘルパーを pure.js に追加
    - `ringAngles(n, offset)`: 等間隔（2π/n）角度配列＋offset
    - `aimAngle(fromX, fromY, toX, toY)`: 発射元→自機の角度
    - `spreadAngles(centerAngle, count, spread)`: 扇状角度配列（自機外し等に流用）
    - `segPointDist(ax, ay, bx, by, px, py)`: 線分と点の最短距離（oval カプセル・laser 判定に共用）
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 5.2 弾幕ヘルパーのテスト
    - `ringAngles`: 要素数 n・等間隔・offset 反映
    - `aimAngle`: 既知座標で期待角度
    - `segPointDist`: 端点/線分内/線分外の代表ケース、線分上の点で 0
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - [x]* 5.3 `segPointDist` の非負プロパティテスト
    - **Property**: 任意座標で戻り値は常に 0 以上
    - **Validates: Requirements 6.4**

- [ ] 6. 敵弾の弾種システム（kanji-blast.js / html 描画）
  - [x] 6.1 弾データモデルと `BULLET_DEFS` 定義
    - 敵弾に `type / r / color / angle / telegraph / length / life` を持たせる
    - `BULLET_DEFS`（small/big/slow/oval/laser のデフォルト当たり半径・速度倍率・oval幅長・laser telegraph/持続）を1か所に定義（調整可能）
    - `MAX_ACTIVE_BULLETS` 定数を定義
    - _Requirements: 3.1, 3.1a, 7.1_
  - [x] 6.2 弾の更新処理を弾種別に拡張（updateEntities）
    - type 未指定は `small` 互換。big/slow は速度・半径、oval は angle 維持
    - laser: telegraph 減算→0で本体化（life 設定）、life 減算で消滅。telegraph 開始時に angle 確定・追尾しない
    - 画面外・寿命切れの弾を破棄。新規発射は `MAX_ACTIVE_BULLETS` 到達時に抑制（既存弾は破棄しない）
    - _Requirements: 3.2, 3.3, 3.4, 3.6, 3.6a, 3.8, 7.2, 7.3_
  - [x] 6.3 弾種別の当たり判定（updateEntities）
    - 円（small/big/slow）は距離判定、oval は `segPointDist` によるカプセル判定
    - laser 本体は線分と自機の距離判定（telegraph 中は無害）
    - _Requirements: 3.5, 3.7_
  - [x] 6.4 弾種別の描画（draw / html）
    - small/big/slow の円、oval の楕円（angle 方向）、laser の予告線（細・半透明）→本体（太）
    - telegraph 中と本体を視覚的に区別
    - 必殺で全敵弾（予告線・レーザー含む）消去は現行の `enemyBullets=[]` を維持
    - _Requirements: 3.9, 8.5_

- [ ] 7. ボスの通常弾幕パターンと動き（kanji-blast.js）
  - [x] 7.1 パターン駆動のボス構造に置き換え
    - `boss.pattern` / `boss.patternT` を導入。時間切れで「直前と異なる」パターンをランダム選択
    - パターン関数: `aimed`（自機狙い）/ `spread`（自機外し）/ `fixed`（固定弾）/ `ring`（全方位）/ `bigLob`（大玉散布）。弾種を組み合わせて発射
    - 通常ボスは2〜3種、Floor_Boss は種類増 or 発射頻度・同時弾数増（密度）
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x] 7.2 ボスの動きを特徴的に
    - サイン揺動・8の字（リサージュ）・瞬間移動から選択、パターン切替時に動きも切替可能
    - ワープ時は自機から一定距離離す（重なり被弾を防ぐ安全条件）
    - _Requirements: 4.8, 4.9_

- [ ] 8. 特殊弾幕（スペルカード）状態機械（kanji-blast.js）
  - [x] 8.1 スペル状態管理を実装
    - `boss.spellThresholds`（例 [0.6, 0.3]）と `spellState`（inactive/active/completed）、`boss.mode`、`boss.spellT`
    - 未 completed のしきい値を初めて下回ったとき active 化して spell へ移行。展開時間終了で completed 化し normal へ復帰
    - active 中に下位しきい値を下回っても重ねない（現 spell 終了後に発動）
    - HP0 は弾幕状態に関わらず撃破処理（既存フロー維持）
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.10_
  - [x] 8.2 スペル弾幕と演出
    - 高密度・複雑な弾幕を一定時間展開。名称表示や画面効果の演出。予告演出を伴い即死弾を出さない
    - Floor_Boss はしきい値追加や同時弾数増で激しく。spell 中はボス移動を変更（中央停止等）
    - _Requirements: 5.4, 5.8, 5.9, 8.5_

- [x] 9. チェックポイント — 純粋関数テスト完了確認
  - `npm test -- tests/kanji-blast` で強さ計算＋弾幕ヘルパーのテストが全て緑。純粋関数（kenteiBoost/plusBoost/kanjiPowerPure/ringAngles/aimAngle/spreadAngles/segPointDist）に抜けがないか点検。問題があればユーザーに相談

- [x] 10. ブラウザ回帰＋新機能スモーク【ユーザー実行（手動）】
  - コンソールエラーなし・SW 更新
  - 画面: メニューから「合体」「分解」「装備・手持ち」を開け、相互遷移で選択が引き継がれない、hand は共有
  - 強さ: 図鑑・装備の Power が新式（画数主軸・級/＋は穏やか）で妥当。既存セーブがそのまま開ける
  - 弾幕: ボスが複数パターンを切り替える（連続同一なし）、大玉/小玉/遅い/細長い/予告線→レーザーが表示・被弾する、telegraph と本体が区別できる
  - スペル: HP しきい値で1回ずつ特殊弾幕に移行し、終了後に通常へ戻る（再発動しない）、予告あり
  - 必殺で全敵弾（レーザー含む）が消える。弾が増えても極端に重くない
  - 既存機能（ドロップ取得→ステージ進行、スコア、残機、合体/分解の+値、読み登録）が壊れていない
  - _Requirements: 1, 2, 3, 4, 5, 7, 8_

- [ ] 11. 既存スペックの追従更新とドキュメント整合
  - [x] 11.1 既存スペック `.kiro/specs/kanji-blast/` の追従更新
    - Requirement 9（強さ計算）を新式に更新、または本スペックへの相互参照を明記
    - Requirement 5（画面）を3分割（合体/分解/装備・手持ち）に更新
    - STG（Requirement 3/4）のボス弾幕記述を本スペックへ相互参照
    - 矛盾を残さない（本スペックが変更後仕様として優先）
    - _Requirements: 8.3, 8.4_
  - [x] 11.2 リリース整合
    - `sw.js` の `CACHE_NAME` を現行値 +1 に bump（`js/kanji-blast.pure.js` は既に ASSETS 済みか確認）
    - `index.html` のバージョン表示・`pages/release-notes.html` に本変更のエントリを追加
    - _Requirements: 8.6_
  - [ ] 11.3 変更の確認とコミット候補提示（エージェント）→ 反映【ユーザー実行】
    - エージェント: 変更作成 → `npm test`（緑確認）→ `git diff` で kanji-blast 関連のみが対象か確認 → ステージ候補一覧とコミットメッセージ案を提示
    - 【ユーザー実行】: kanji-blast 関連ファイルのみ選択的に `git add`（`git add .` は使わない）→ commit → main へマージ → push（PAT はお手元）
    - _Requirements: 8.6_

- [x] 12. チェックポイント — 最終確認
  - 純粋関数テスト緑（タスク9）、ブラウザスモークOK（タスク10）、既存スペック追従・リリース整合（タスク11）が済んでいることを確認。問題があればユーザーに相談

## 注記

- `*` 付きサブタスクは任意（プロパティテスト）。
- バランス値（ボスHP係数・`BULLET_DEFS`・`MAX_ACTIVE_BULLETS`・スペルしきい値）はプレイテストで調整する設定値。式の形は本計画で確定し、数値は調整対象。
- タスク1〜9の検証系は pure.js を唯一の実体として本番と同一実体をテストする（ミラー実装禁止）。
- ボス弾幕（タスク6〜8）は Canvas/DOM 依存のため主に `js/kanji-blast.js` に実装し、計算可能部分のみ pure.js へ切り出す。

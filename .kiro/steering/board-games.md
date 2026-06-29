---
inclusion: fileMatch
fileMatchPattern: "*cockroach*,*quarto*,*quoridor*,*memory-game*,*blokus*"
---

# ボードゲーム・カードゲーム（ごきぶりポーカー・クアルト・コリドール・神経衰弱・ブロックス）

## ファイル構成

- `pages/cockroach-poker.html` — ごきぶりポーカー（ブラフカードゲーム）
- `js/cockroach-poker.js` — ごきぶりポーカー ゲームロジック
- `pages/quarto.html` — クアルト（2人用ボードゲーム）
- `pages/quoridor.html` — コリドール（2人用壁配置ゲーム）
- `pages/memory-game.html` — 神経衰弱（記憶力カードゲーム）
- `pages/blokus.html` — ブロックス（陣取りボードゲーム）

## ごきぶりポーカー（cockroach-poker.html + js/cockroach-poker.js）

- CPU対戦ブラフカードゲーム
- 8種類の虫カード（🪳🦇🐛🦂🪰🕷️🐸🐀）× 各8枚 = 64枚
- ルール: カードを相手に渡し「これは○○です」と宣言 → 受け取り手が「本当」「嘘」を判定
  - 正解 → 出した側が引き取り（場に公開）
  - 不正解 → 受け取った側が引き取り
- 同じ種類を4枚引き取ったら負け
- CPUの思考: ブラフ頻度ランダム、判定もランダム（やや知性あり）
- JSは即時関数(IIFE)で隔離
- `pendingTimers` 配列でsetTimeout管理（画面遷移時にクリア）
- 戦績をlocalStorageに保存
- 夜間制限対応

### localStorage キー

| キー | 用途 |
|------|------|
| cockroach_poker_stats | 戦績（{wins, losses}） |

## クアルト（quarto.html）

- 2人用ボードゲーム（同一端末パス＆プレイ）
- 16ピース: 4属性（大/小、明/暗、丸/四角、穴あり/穴なし）で全て異なる
- ルール:
  - 相手が選んだピースを自分が置く
  - 行/列/対角線で4つの共通属性が揃ったら「クアルト！」で勝利
  - 全ピース配置で揃いなければ引き分け
- ターン: 「ピースを選ぶ」→ 相手に渡す → 相手が「ピースを置く」→ 次のピースを選ぶ
- 単一HTMLファイルで完結
- DB不使用
- 夜間制限対応

## コリドール（quoridor.html）

- 2人用壁配置戦略ゲーム（同一端末パス＆プレイ）
- 9×9ボード
- 各プレイヤーは10枚の壁を所持
- ルール:
  - ターンで「駒を1マス移動（上下左右）」か「壁を1枚配置（2マス分）」
  - 壁は相手の到達路を完全に塞いではならない（BFS経路保証チェック）
  - 自分の駒が相手側の端に到達したら勝利
  - 駒が隣接時はジャンプ可能
- 壁配置: タップで方向選択（横/縦）、プレビュー表示
- 単一HTMLファイルで完結
- DB不使用
- 夜間制限対応

## 神経衰弱（memory-game.html）

- 記憶力カードゲーム（1人プレイ）
- 3難易度: かんたん（6ペア/4×3）、ふつう（8ペア/4×4）、むずい（12ペア/6×4）
- 絵柄: 動物絵文字12種（🐶🐱🐼🦊🐸🐵🦁🐮🐷🐔🐙🦋）
- ゲームフロー:
  1. 難易度選択
  2. 全カード一瞬表示（記憶タイム: かんたん2秒/ふつう1.5秒/むずい1.2秒）
  3. タイマー開始、2枚めくってペア判定
  4. 全ペア成立でクリア → スコア評価
- 操作:
  - 不一致カード表示中にタップで早送り可能
  - ペア判定中は入力ロック（locked = true）
  - 「タイトルに戻る」ボタン（確認ダイアログ付き）
  - ←/🏠にconfirmLeaveGame適用
- スコア評価（手数/ペア数の比率）:
  - ≤1.2: 👑 神！完璧！
  - ≤1.5: ⭐ すごい！
  - ≤2.0: 😊 いい感じ！
  - ≤3.0: 🙂 まあまあ！
  - >3.0: 💪 がんばろう！
- 3Dフリップアニメーション（CSS perspective + rotateY）
- ペア成立時 matchPop アニメーション
- ランキング: memory_rankingsテーブル（name, score=手数, difficulty別TOP10）
- 夜間制限対応
- ねこ汚染スクリプト非適用

### 変数スコープ構造

```
<script> トップレベル:
  let isPlaying (グローバル状態)
  let timerInterval (グローバル)
  cleanup() (グローバル)
  
  initGame() 内:
    ゲームロジック全体
    window.startGame / window.flipCard / window.replay 等をwindowに公開
```

## ブロックス（blokus.html）

- 2〜4人ローカル対戦陣取りボードゲーム（同一端末パス＆プレイ）
- 20×20ボード、全21種ポリオミノ（1〜5マス）× 4色

### ゲームモード
- 4人モード: 各プレイヤーに1色（青・赤・緑・黄）
- 3人モード: 青・赤・緑のみ使用、黄の開始角(19,19)は非アクティブ
- 2人モード: Team A（青+赤）、Team B（緑+黄）。ターンは青→赤→緑→黄順で各色独立ピースセット

### ルール
- 最初のピース: ピースのいずれか1マスが自分の開始角セルを覆う必要あり
- 2手目以降（Corner_Rule）:
  - 自分の既配置ピースと少なくとも1つの角で接触（対角隣接）
  - 自分の既配置ピースと辺で接触（上下左右隣接）してはならない
  - 他プレイヤーのピースとの辺接触は許可
- パス: 確認ダイアログ「本当にパスする？」後に永久パス（以降自動スキップ）
- ゲーム終了: 全色がパス状態になったら終了
- スコア: `0 - 残りマス数 + ボーナス`（全配置+15、最後が1マスなら追加+5）
- 勝者: 最高スコア（同点は引き分け）。2人モードはチームスコア合計で比較

### 開始角（Starting Corners）
- blue: (0,0), red: (0,19), green: (19,0), yellow: (19,19)

### UI構成
- 画面遷移: タイトル → セットアップ（人数+名前入力）→ ゲーム → 結果
- ボード: CSS Grid 20×20、水平スクロールなし、最小14px/セル
- ピースセレクター: ボード下部、5マス→4→3→2→1のグループ表示、flex-wrap
- 操作バー: 回転(↻)、反転(↔)、確定(✓)、パスボタン
- 合法配置ハイライト: 選択ピースの合法配置基準セルに薄い緑ドット(4px)表示
- プレビュー: ボードタップで半透明表示、確定ボタンで配置実行
- 不正配置: 赤フラッシュアニメーション
- 名前入力: ゲーム開始時に入力、localStorage候補サジェスト

### ランキング
- テーブル: `blokus_rankings` (name TEXT UNIQUE, wins INT)
- 方式: upsert（勝利ごとにwins+1、引き分け時は保存しない）
- 表示: タイトル画面からTOP10（wins降順）

### ピース定義（全21種、座標配列）

| サイズ | 種類数 | IDs |
|--------|--------|-----|
| 1マス | 1 | I1 |
| 2マス | 1 | I2 |
| 3マス | 2 | I3, L3 |
| 4マス | 5 | I4, L4, T4, S4, O4 |
| 5マス | 12 | F5, I5, L5, N5, P5, T5, U5, V5, W5, X5, Y5, Z5 |

### ゲームロジック（純粋関数）
- `normalizeCells(cells)` — 座標正規化
- `rotatePiece(cells, times)` — 時計回り90°×N回
- `flipPiece(cells)` — 左右反転
- `transformPiece(cells, rotation, flipped)` — flip先→rotate
- `canPlace(board, cells, x, y, playerColor, isFirstPiece)` — 全ルール検証
- `placePiece(board, cells, x, y, playerColor)` — 配置実行（新ボード返却）
- `calculateScore(player)` / `calculateTeamScore(p1, p2)` — スコア計算
- `isGameOver(gameState)` — 全員パス判定
- `advanceTurn(gameState)` — ターン進行（呼び出し前にisGameOverチェック必須）
- `determineWinner(gameState)` → `{ isDraw, winnerIndices }`
- `getLegalPositions(board, pieceIdx, rotation, flipped, playerColor)` — 合法位置計算（キャッシュ付き）

### localStorage キー

| キー | 用途 |
|------|------|
| blokus_player_names | 過去に使用した名前リスト（JSON配列） |

### DBテーブル

#### blokus_rankings
- id: UUID (PK), name: TEXT UNIQUE NOT NULL, wins: INT NOT NULL DEFAULT 1, created_at: TIMESTAMPTZ

#### memory_rankings
- id: UUID (PK), name: TEXT NOT NULL, score: INT NOT NULL (手数), difficulty: TEXT NOT NULL ('easy'|'normal'|'hard'), created_at: TIMESTAMPTZ
- INDEX: idx_memory_rankings_score (difficulty, score ASC)

## 共通仕様

- 全ゲームで夜間制限対応（`isNightTime()`チェック）
- `common.js` + Supabase CDN読み込み
- ゲームセンター（arcade.html）のカード表示で `data-game` 属性による公開/非公開制御
- ねこ汚染スクリプト（neko-infection.js）は非適用
- 単一HTMLファイルで完結（外部JSはごきぶりポーカーのみ分離）

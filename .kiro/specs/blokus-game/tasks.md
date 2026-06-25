# Implementation Plan: Blokus Game

## Overview

ブロックス風ボードゲームを `pages/blokus.html` として実装する。ゲームロジック（純粋関数）→HTML構造→描画→UI→操作→配置→ハイライト→ターン管理→結果→ランキング→arcade連携→バージョン更新の順で段階的に構築する。

## Tasks

- [ ] 1. ピース定義データ＋ゲームロジック（純粋関数）
  - [x] 1.1 ピース定義データと変換関数を実装する
    - `pages/blokus.html` ファイルを作成し、PIECES配列（全21種の座標定義）を記述する
    - PLAYER_COLORS定義、Starting Corner割り当てを記述する
    - `rotatePiece(cells, times)` — 時計回り90°回転をtimes回適用
    - `flipPiece(cells)` — 左右反転
    - `transformPiece(cells, rotation, flipped)` — 回転+反転の合成変換
    - 座標正規化関数 `normalizeCells(cells)` — 原点(0,0)基準に正規化
    - _Requirements: Req 12 AC1, Req 12 AC2, Req 5 AC3, Req 5 AC4_

  - [ ]* 1.2 Property test: 回転とフリップの恒等性
    - **Property 3: Rotation identity** — 4回回転で元に戻る
    - **Property 4: Flip involution** — 2回フリップで元に戻る
    - **Validates: Req 5 AC3, Req 5 AC4**

  - [x] 1.3 配置検証ロジックを実装する
    - `canPlace(board, cells, x, y, playerColor, isFirstPiece)` — 全ルール検証
    - `checkCornerRule(board, cells, x, y, playerColor)` — 対角隣接チェック
    - `checkNoEdgeTouch(board, cells, x, y, playerColor)` — 辺接触禁止チェック
    - `checkStartingCorner(cells, x, y, playerColor)` — 開始角カバーチェック
    - `placePiece(board, cells, x, y, playerColor)` — 配置実行（新ボード返却）
    - _Requirements: 6 AC2, 6 AC3, 6 AC4, 6 AC5, 6 AC6_

  - [ ]* 1.4 Property test: 配置検証の正確性
    - **Property 5: Placement validation correctness**
    - **Property 10: First piece validity**
    - **Property 11: Piece conservation**
    - **Validates: Req 6 AC3, 6 AC4, 6 AC5, 6 AC6, 6 AC2**

  - [x] 1.5 スコア計算とターン管理ロジックを実装する
    - `calculateScore(player)` — 0 - 残りマス数 + ボーナス
    - `calculateTeamScore(player1, player2)` — チームスコア合計
    - `advanceTurn(gameState)` — 次のアクティブプレイヤーへ（呼び出し前に必ずisGameOver()チェック）
    - `isGameOver(gameState)` — 全員パス判定
    - `determineWinner(gameState)` — 戻り値: `{ isDraw: boolean, winnerIndices: number[] }`（winnerIndicesは勝者の色インデックス配列。2人モードではチームインデックス[0]or[1]）
    - _Requirements: 8 AC2, 8 AC3, 8 AC4, 8 AC6, 7 AC1, 7 AC5, 7 AC6_

  - [ ]* 1.6 Property test: スコアとターン管理
    - **Property 1: Turn progression skips passed and inactive players**
    - **Property 2: Team score equals sum of individual scores**
    - **Property 7: All-passed implies game over**
    - **Property 8: Score formula correctness**
    - **Property 9: Winner determination**
    - **Validates: Req 2 AC5, 2 AC6, 2 AC7, 7 AC1, 7 AC5, 7 AC6, 8 AC2, 8 AC3, 8 AC4, 8 AC6**

- [ ] 2. Checkpoint - ゲームロジックの確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. HTMLページの基本構造（画面遷移）
  - [x] 3.1 blokus.html の基本HTML構造を構築する
    - ヘッダー（←ボタン history.back()、🏠ボタン ../index.html）
    - タイトル画面: ゲームタイトル + 開始ボタン + ランキングボタン
    - セットアップ画面: 人数選択（2/3/4人）+ 名前入力欄 + 開始ボタン
    - ゲーム画面: ターン表示 + ボード領域 + 操作バー + ピースセレクター領域
    - 結果画面: スコア一覧 + 勝者表示 + もう一回/戻るボタン
    - ランキングモーダル: TOP10表示
    - 画面切替は display:none/block で制御（phase変数に連動）
    - _Requirements: 1 AC3, 2 AC1, 2 AC9, 8 AC5_

  - [x] 3.2 夜間制限とSupabase初期化を実装する
    - common.js の `isNightTime()` で夜間制限チェック
    - Supabase CDN読み込み + `sbClient` 初期化
    - 夜間時は全画面を夜間メッセージで覆う
    - _Requirements: 9 AC1, 9 AC2_

  - [x] 3.3 セットアップ画面のロジックを実装する
    - 人数選択（2/3/4人）のボタンUI
    - 名前入力欄（4人モード: 4欄、3人モード: 3欄、2人モード: Team A/Team B の2欄）
    - localStorage `blokus_player_names` から過去の名前候補を表示
    - 入力された名前をlocalStorageに保存
    - gameState初期化（mode, players配列セットアップ）
    - _Requirements: 2 AC1, 2 AC2, 2 AC3, 2 AC4, 2 AC9, 2 AC10, 2 AC11_

- [ ] 4. ボード描画（CSS Grid）
  - [x] 4.1 20×20グリッドのCSS Grid描画を実装する
    - CSS Grid: `grid-template-columns: repeat(20, 1fr)` で画面幅内に全体表示
    - 各セルは最小14px×14px、画面幅に応じてflex拡大
    - 空セルは暗色背景、配置済みセルはプレイヤー色で描画
    - Starting Cornerの4マスを視覚的に区別（薄い色付きマーカー）
    - ターン表示（現在プレイヤーの色+名前をヘッダーに表示）
    - _Requirements: 3 AC1, 3 AC2, 3 AC3, 3 AC4, 10 AC1, 10 AC2, 10 AC3_

- [ ] 5. ピースセレクターUI
  - [x] 5.1 ピース一覧表示を実装する
    - 現在のプレイヤーの未使用ピース一覧を表示（5マス→4マス→3マス→2マス→1マスの順）
    - 各ピースをミニグリッドで形状描画
    - タップで選択（ハイライト状態）
    - 使用済みピースは半透明+選択不可
    - 折り返しレイアウト（flex-wrap）でスクロール可能
    - _Requirements: 4 AC1, 4 AC2, 4 AC3, 4 AC4, 10 AC4_

- [ ] 6. ピース操作（回転・反転）UI
  - [x] 6.1 回転・反転ボタンUIを実装する
    - 操作バーに回転ボタン（↻）と反転ボタン（↔）を配置
    - ピース選択中のみ操作可能
    - タップで gameState.rotation / gameState.flipped を更新
    - ピースセレクター内の選択中ピースの表示も変換後の形状に更新
    - _Requirements: 5 AC1, 5 AC2, 5 AC3, 5 AC4_

- [ ] 7. ピース配置（プレビュー + 確定）
  - [x] 7.1 ボードタップでプレビュー表示＋確定操作を実装する
    - ピース選択中にボードセルをタップ → `gameState.selectedPosition = {x, y}` に保存
    - タップ位置（基準セル）にピースのプレビュー（半透明）を描画
    - 操作バーに「確定」ボタンを表示（プレビュー表示中のみアクティブ）
    - 確定タップ → `canPlace()` で検証 → 合法なら緑プレビュー後に `placePiece()` 実行
    - 不正配置時はプレビューを赤くフラッシュして配置拒否
    - 配置確定後: selectedPosition=null、使用済みフラグ更新、ボード再描画、ターン進行
    - _Requirements: 6 AC1, 6 AC2, 6 AC3, 6 AC4, 6 AC5, 6 AC6, 7 AC1_

- [ ] 8. 合法配置ハイライト
  - [x] 8.1 合法配置位置のハイライト表示を実装する
    - `getLegalPositions(board, piece, playerColor, isFirstPiece)` を実装
    - 戻り値 `[{x, y}]` はピースの基準セル位置を示す（「ここを基準に置ける」の意味）
    - ピース選択/回転/反転時に再計算
    - 合法位置の基準セルに薄い緑のドット（4px）を描画
    - requestAnimationFrameでDOM更新をバッチ化
    - キャッシュ: 同一piece+rotation+flipで結果を保持
    - _Requirements: 6.5 AC1, 6.5 AC2, 6.5 AC3_

  - [ ]* 8.2 Property test: 合法ハイライトの一致性
    - **Property 6: Legal highlight positions match canPlace**
    - **Validates: Req 6.5 AC1, 6.5 AC3**

- [ ] 9. Checkpoint - UI動作確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. ターン管理 + パス機能
  - [x] 10.1 ターン管理UIとパス機能を実装する
    - 配置確定後に `isGameOver()` チェック → ゲーム終了 or `advanceTurn()`
    - パスボタン: 確認ダイアログ「本当にパスする？（この色はもう置けなくなるよ）」
    - OK → passed=true、ターンスキップ
    - キャンセル → パス取り消し
    - パス済みプレイヤーのターン自動スキップ
    - 全員パスでゲーム終了遷移
    - _Requirements: 7 AC1, 7 AC2, 7 AC3, 7 AC4, 7 AC5, 7 AC6_

- [ ] 11. ゲーム終了 + スコア表示
  - [x] 11.1 ゲーム終了画面を実装する
    - 結果オーバーレイに各プレイヤー（2人モードではチーム）のスコアを名前付きで表示
    - `calculateScore()` / `calculateTeamScore()` でスコア算出
    - `determineWinner()` で勝者判定（同点は引き分け表示）
    - 「○○ 勝利！」/ 「引き分け！」表示
    - 「もう一回」ボタン（セットアップへ）、「ゲームセンターに戻る」ボタン（arcade.html）
    - _Requirements: 8 AC1, 8 AC2, 8 AC3, 8 AC4, 8 AC5, 8 AC6_

- [ ] 12. ランキング（Supabase連携）
  - [x] 12.1 ランキング保存と表示を実装する
    - ゲーム終了時に勝者名で `blokus_rankings` テーブルにupsert（引き分け時は保存しない）
    - 2人モードではチーム名（Team A/B入力時の名前）を使用する
    - タイトル画面のランキングボタンでモーダル表示
    - TOP10の勝利回数ランキングを降順で表示
    - _Requirements: Req 11 AC1, Req 11 AC2, Req 11 AC3_

- [ ] 13. arcade.html へのカード追加 + game_publish対応
  - [x] 13.1 ゲームセンターにブロックスカードを追加する
    - `pages/arcade.html` にブロックスのgame-cardを追加（data-game="game_blokus"）
    - アイコン: 🟦、タイトル: ブロックス、説明: 陣取りボードゲーム
    - game_settings.game_publish の game_blokus フラグで公開制御対応
    - _Requirements: 1 AC1, 1 AC2, 1 AC4_

- [ ] 14. Final checkpoint - 全体動作確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. バージョン更新 + リリースノート + git push
  - [-] 15.1 リリース関連ファイルを更新する
    - `pages/release-notes.html` — リリースノート先頭に追記（feat: ブロックス追加）
    - `sw.js` — CACHE_NAME のバージョン番号を +1
    - `index.html` — 末尾のバージョン表示テキストを新バージョンに更新
    - git commit & push to working branch

## Notes

- Tasks marked with `*` are property tests — may be skipped for rapid prototyping, but recommended for correctness assurance
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- ゲームロジックは純粋関数として実装し、テスト容易性を確保する
- 実装言語: JavaScript（単一HTML内のinline script）
- gameState には `selectedPosition: null | {x, y}` を含める（プレビュー配置位置の管理用）

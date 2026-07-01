# Requirements Document

## Introduction

ゲームセンター（pages/arcade.html）にブロックス風ボードゲームを追加する。2〜4人がローカルで交代しながら20×20ボードにポリオミノピースを配置し、スコアの高さを競う。小学生が直感的に遊べるタッチ操作対応UIを実装する。

## Glossary

- **Board**: 20×20マスのゲーム盤。各セルは空・プレイヤー色のいずれか
- **Piece**: 1〜5マスのポリオミノ（全21種×4色）。基準セル(0,0)からの相対座標で定義される形状
- **Player**: ゲームに参加する2〜4人のプレイヤー。それぞれ固有の色（またはチーム）を持つ
- **Team**: 2人モードにおけるプレイヤー単位。Team A（青+赤）、Team B（緑+黄）で構成される
- **Corner_Rule**: 自分の既配置ピースと少なくとも1つの角で接触（対角隣接）すること。かつ、自分の既配置ピースと辺で接触（上下左右隣接）してはならない。他プレイヤーのピースとの辺接触は許可される
- **Starting_Corner**: ボードの四隅（(0,0), (0,19), (19,0), (19,19)）。各色が最初のピースを配置する起点
- **Pass**: プレイヤーがパスボタンを押し、確認ダイアログで承認してターンをスキップすること。一度パスしたプレイヤーは以降自動スキップされる
- **Score**: 0 - 残りマス数 + ボーナス で計算される値。全ピース配置で+15点、最後のピースが1マスならさらに+5点
- **Game_Engine**: ピース配置の検証、ターン管理、スコア計算を行うゲームロジック
- **Piece_Selector**: プレイヤーが手持ちピースを選択するUI領域
- **Blokus_Page**: pages/blokus.html — ブロックスゲームのページ
- **Arcade_Page**: pages/arcade.html — ゲームセンター一覧ページ
- **Legal_Highlight**: ピース選択時にボード上の合法配置位置をハイライト表示する機能
- **Player_Name**: ゲーム開始時に各プレイヤー（またはチーム）が入力する表示名。localStorageに保存され次回以降の候補として表示される

## Requirements

### Requirement 1: ゲームページの基本構成

**User Story:** As a プレイヤー, I want ゲームセンターからブロックスを起動できる, so that 他のゲームと同じ導線でアクセスできる

#### Acceptance Criteria

1. THE Arcade_Page SHALL ブロックスのゲームカードを表示する（data-game="game_blokus"属性付き）
2. WHEN ブロックスカードがタップされた時, THE Arcade_Page SHALL pages/blokus.html に遷移する
3. THE Blokus_Page SHALL ヘッダーに←ボタン（history.back()）と🏠ボタン（../index.html）を表示する
4. THE Blokus_Page SHALL game_settings.game_publish の game_blokus フラグで公開/非公開を制御される

### Requirement 2: ゲーム初期設定

**User Story:** As a プレイヤー, I want プレイヤー人数を選んで名前を入力してゲームを開始したい, so that 2〜4人で誰が何色か明確にして遊べる

#### Acceptance Criteria

1. THE Blokus_Page SHALL ゲーム開始前にプレイヤー人数選択画面（2人/3人/4人）を表示する
2. WHEN 4人モードが選択された時, THE Game_Engine SHALL 各プレイヤーに1色ずつ（青・赤・緑・黄）を割り当てる
3. WHEN 3人モードが選択された時, THE Game_Engine SHALL 3人のプレイヤーに青・赤・緑を割り当て、黄は使用しない
4. WHEN 2人モードが選択された時, THE Game_Engine SHALL Team A（青+赤）とTeam B（緑+黄）を構成し、各チームに2色を割り当てる
5. WHILE 2人モードの時, THE Game_Engine SHALL ターン順を青→赤→緑→黄の固定順で進行する（各色のピースセットは独立、共有しない）
6. WHILE 2人モードの時, THE Game_Engine SHALL スコアをチーム単位（チーム内2色の残りマス合計からボーナスを加算）で計算する
7. THE Game_Engine SHALL 全モードにおいてターン順を青→赤→緑→黄の順で進行する
8. WHILE 3人モードの時, THE Game_Engine SHALL 未使用の開始角（黄色の(19,19)）を非アクティブとして扱い配置対象外とする
9. WHEN ゲームが開始される時, THE Blokus_Page SHALL 各プレイヤー（2人モードではチーム）に名前入力ダイアログを表示する
10. THE Blokus_Page SHALL 名前入力ダイアログにlocalStorageから取得した過去の使用名を選択候補として表示する
11. WHEN プレイヤー名が入力された時, THE Blokus_Page SHALL 入力された名前をlocalStorageに保存する
12. WHILE ゲーム進行中, THE Blokus_Page SHALL ターン表示にプレイヤー名を表示する

### Requirement 3: ボード表示

**User Story:** As a プレイヤー, I want 20×20のボードを見やすく表示したい, so that ピース配置を計画できる

#### Acceptance Criteria

1. THE Blokus_Page SHALL 20×20マスのグリッドを画面幅に合わせて水平スクロールなしで全体表示する
2. THE Board SHALL 各セルをプレイヤーの色（青・赤・緑・黄）または空（暗色）で描画する
3. THE Board SHALL Starting_Corner の4マスを初期状態で視覚的に区別する
4. THE Board SHALL 現在のプレイヤーのターンを色またはラベルで明示する

### Requirement 4: ピース選択

**User Story:** As a プレイヤー, I want 手持ちピースから配置するピースを選びたい, so that 戦略的にピースを使える

#### Acceptance Criteria

1. THE Piece_Selector SHALL 現在のプレイヤーの未使用ピース一覧をボード下部にスクロール可能な折り返しレイアウトで表示する
2. WHEN ピースがタップされた時, THE Piece_Selector SHALL 選択中のピースをハイライト表示する
3. THE Piece_Selector SHALL 使用済みピースを半透明で表示し選択不可とする
4. THE Piece_Selector SHALL 全21種のポリオミノ（1マス×1、2マス×1、3マス×2、4マス×5、5マス×12）をAppendix Aの座標定義に基づいて表示する

### Requirement 5: ピース操作（回転・反転）

**User Story:** As a プレイヤー, I want ピースを回転・反転させたい, so that 好きな向きで配置できる

#### Acceptance Criteria

1. WHEN ピースが選択されている時, THE Blokus_Page SHALL 回転ボタン（時計回り90°）を表示する
2. WHEN ピースが選択されている時, THE Blokus_Page SHALL 反転ボタン（左右反転）を表示する
3. WHEN 回転ボタンがタップされた時, THE Game_Engine SHALL 選択ピースを時計回りに90°回転する
4. WHEN 反転ボタンがタップされた時, THE Game_Engine SHALL 選択ピースを左右反転する

### Requirement 6: ピース配置

**User Story:** As a プレイヤー, I want ボード上にピースを配置したい, so that ゲームを進行できる

#### Acceptance Criteria

1. WHEN ピースが選択されボード上のセルがタップされた時, THE Blokus_Page SHALL タップ位置にピースのプレビュー（半透明）を表示する
2. WHEN プレビューが表示されている時に確定ボタンがタップされた時, THE Game_Engine SHALL 配置ルールを検証し合法なら配置を確定する
3. IF 配置がCorner_Ruleに違反する場合, THEN THE Game_Engine SHALL 配置を拒否しエラーを視覚的に表示する
4. IF 配置がボード外にはみ出す場合, THEN THE Game_Engine SHALL 配置を拒否する
5. IF 配置位置に既存ピースが存在する場合, THEN THE Game_Engine SHALL 配置を拒否する
6. WHEN 最初のピースを配置する時, THE Game_Engine SHALL そのピースのいずれか1マスがそのプレイヤーのStarting_Cornerセルを覆う位置のみ許可する

### Requirement 6.5: 合法配置ハイライト

**User Story:** As a プレイヤー, I want 置ける場所が光ってほしい, so that 初心者でも迷わず配置できる

#### Acceptance Criteria

1. WHEN ピースが選択されている時, THE Board SHALL そのピースを合法的に配置可能な位置をハイライト表示する
2. WHEN 選択中のピースが回転または反転された時, THE Board SHALL ハイライト表示を更新する
3. THE Legal_Highlight SHALL Corner_Ruleを満たす角接触位置を示す

### Requirement 7: ターン管理

**User Story:** As a プレイヤー, I want ターンが自動で次のプレイヤーに移ってほしい, so that スムーズにゲームが進行する

#### Acceptance Criteria

1. WHEN ピース配置が確定された時, THE Game_Engine SHALL 次のプレイヤーにターンを移す
2. WHEN パスボタンがタップされた時, THE Blokus_Page SHALL 「本当にパスする？（この色はもう置けなくなるよ）」確認ダイアログを表示する
3. WHEN 確認ダイアログでキャンセルが選択された時, THE Game_Engine SHALL パスを取り消しターンを継続する
4. WHEN 確認ダイアログでOKが選択された時, THE Game_Engine SHALL 現在のプレイヤーをパス状態にしターンをスキップする
5. WHILE プレイヤーがパス状態の時, THE Game_Engine SHALL そのプレイヤーのターンを自動的にスキップする
6. IF 全プレイヤー（全色）がパス状態になった場合, THEN THE Game_Engine SHALL ゲームを終了する

### Requirement 8: ゲーム終了とスコア表示

**User Story:** As a プレイヤー, I want ゲーム終了時に結果を確認したい, so that 勝敗がわかる

#### Acceptance Criteria

1. WHEN ゲームが終了した時, THE Blokus_Page SHALL 各プレイヤー（2人モードではチーム）のスコアをプレイヤー名付きで表示する
2. THE Game_Engine SHALL スコアを「0 - 残りマス数 + ボーナス」で計算する（全ピース配置で+15点、最後のピースが1マスならさらに+5点）
3. WHEN ゲームが終了した時, THE Blokus_Page SHALL 最高スコアのプレイヤー（2人モードではチーム）を「○○ 勝利！」とプレイヤー名付きで勝者として表示する
4. IF 複数のプレイヤー（またはチーム）が同点で最高スコアの場合, THEN THE Blokus_Page SHALL 引き分け（タイ）として表示する
5. WHEN ゲームが終了した時, THE Blokus_Page SHALL 「もう一回」ボタンと「ゲームセンターに戻る」ボタンを表示する
6. WHILE 2人モードの時, THE Game_Engine SHALL チーム内2色のスコア合計でチームスコアを算出する

### Requirement 9: 夜間制限対応

**User Story:** As a 保護者, I want ブロックスも夜間制限の対象にしたい, so that 子供の生活リズムを守れる

#### Acceptance Criteria

1. WHILE 夜間制限時間帯の時, THE Blokus_Page SHALL ゲーム画面を表示せず夜間メッセージを表示する
2. THE Blokus_Page SHALL isNightTime() 関数で夜間判定を行う

### Requirement 10: レスポンシブUI

**User Story:** As a プレイヤー, I want スマートフォンでも快適に操作したい, so that どの端末でも遊べる

#### Acceptance Criteria

1. THE Blokus_Page SHALL 画面幅360px以上のデバイスで操作可能なレイアウトを提供する
2. THE Board SHALL タッチ操作でセル選択が可能なサイズ（最小14px×14px）で描画する
3. THE Board SHALL 水平スクロールなしで画面幅内に全体表示する
4. THE Piece_Selector SHALL ボード下部に配置し、スクロールで到達可能な折り返しレイアウトで表示する

### Requirement 11: ランキング記録

**User Story:** As a プレイヤー, I want 勝利数をランキングに記録したい, so that 家族で競い合える

#### Acceptance Criteria

1. WHEN ゲームが終了した時, THE Blokus_Page SHALL 勝者のプレイヤー名でblokus_rankingsテーブルに勝利記録を保存する
2. THE Blokus_Page SHALL タイトル画面にランキングボタンを表示する
3. WHEN ランキングボタンがタップされた時, THE Blokus_Page SHALL TOP10の勝利回数ランキングを表示する
4. THE Blokus_Page SHALL 名前入力ダイアログにlocalStorageから取得した過去の使用名を選択候補として表示する

### Requirement 12: ピース定義のデータ形式

**User Story:** As a 開発者, I want ピース定義が明確なデータ形式で管理されている, so that 実装時にDOMから形状を推測する必要がない

#### Acceptance Criteria

1. THE Game_Engine SHALL ピース定義をJavaScriptソースコード内の座標配列として保持する（Appendix A参照）
2. THE Game_Engine SHALL ピース形状をDOM要素から動的に生成してはならず、ソースコード内の座標定義を唯一の真実とする

---

## Appendix A: ピース座標定義

全21種のポリオミノを基準セル(0,0)からの相対座標で定義する。

### 1マス (Monomino)

| ID | 名前 | 座標 |
|----|------|------|
| I1 | Monomino | (0,0) |

### 2マス (Domino)

| ID | 名前 | 座標 |
|----|------|------|
| I2 | Domino | (0,0), (1,0) |

### 3マス (Trominoes)

| ID | 名前 | 座標 |
|----|------|------|
| I3 | I-Tromino | (0,0), (1,0), (2,0) |
| L3 | L-Tromino | (0,0), (1,0), (1,1) |

### 4マス (Tetrominoes)

| ID | 名前 | 座標 |
|----|------|------|
| I4 | I-Tetromino | (0,0), (1,0), (2,0), (3,0) |
| L4 | L-Tetromino | (0,0), (1,0), (2,0), (2,1) |
| T4 | T-Tetromino | (0,0), (1,0), (2,0), (1,1) |
| S4 | S-Tetromino | (0,0), (1,0), (1,1), (2,1) |
| O4 | O-Tetromino | (0,0), (1,0), (0,1), (1,1) |

### 5マス (Pentominoes)

| ID | 名前 | 座標 |
|----|------|------|
| F5 | F-Pentomino | (1,0), (2,0), (0,1), (1,1), (1,2) |
| I5 | I-Pentomino | (0,0), (1,0), (2,0), (3,0), (4,0) |
| L5 | L-Pentomino | (0,0), (1,0), (2,0), (3,0), (3,1) |
| N5 | N-Pentomino | (0,0), (1,0), (1,1), (2,1), (3,1) |
| P5 | P-Pentomino | (0,0), (1,0), (2,0), (1,1), (2,1) |
| T5 | T-Pentomino | (0,0), (1,0), (2,0), (1,1), (1,2) |
| U5 | U-Pentomino | (0,0), (2,0), (0,1), (1,1), (2,1) |
| V5 | V-Pentomino | (0,0), (1,0), (2,0), (2,1), (2,2) |
| W5 | W-Pentomino | (0,0), (1,0), (1,1), (2,1), (2,2) |
| X5 | X-Pentomino | (1,0), (0,1), (1,1), (2,1), (1,2) |
| Y5 | Y-Pentomino | (0,0), (1,0), (2,0), (3,0), (1,1) |
| Z5 | Z-Pentomino | (0,0), (1,0), (1,1), (1,2), (2,2) |

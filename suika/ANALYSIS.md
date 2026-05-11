# すいかが食べたい - コード解析結果

## Task 5: メインループ特定

### アーキテクチャ概要

```
ARpg (extends CPassWordPanel implements Runnable)
  └── CGameApp (extends Applet) — 入力・描画基盤
       └── CPassWordPanel — パスワード入力UI
            └── ARpg — ゲーム本体
```

### クラス継承チェーン

```
java.applet.Applet
  → CGameApp        (入力処理, SE再生, フォント描画, フレーム制御)
    → CPassWordPanel (パスワード/パネルUI)
      → ARpg        (ゲームメインクラス, Runnable実装)
```

---

## メインループ構造

### 起動シーケンス

```
init()          → Appletエントリ。画面生成(400x320)、ウィンドウ登録
start()         → Thread生成 → run() 呼び出し
run()           → InitProc() → InitApplet() → 無限ループ
```

### run() の無限ループ

```java
public void run() {
    this.ReleasePanel();
    this.InitProc();       // CModel[204] 配列確保
    this.InitApplet();     // 全アセット読込（画像32枚, モデル204個, SE30個, ステージ/イベント/パラメータ）
    while (true) {
        this.InitSystem(); // カメラ・フェード・ワールド初期化
        CTitle.Run(this);  // タイトル画面
        this.m_Play.m_Time.Start();
        this.m_Game.InitPrm();
        this.MainGame();   // ← ゲーム本体ループ
    }
}
```

### MainGame() — フィールドループ

```java
public void MainGame() {
    while (条件) {
        bl = this.m_Game.Move();       // プレイヤー移動・マップ遷移
        CNpcMove.Move();               // NPC移動
        this.MainFrame();              // ← 1フレーム処理
        // Zキー or 右クリック → システムメニュー
        // エンカウント判定 → 戦闘突入
    }
}
```

### MainFrame() — 1フレーム処理

```java
public void MainFrame() {
    this.Motion();                    // アニメーション更新
    this.m_Game.MoveEvent();         // イベント処理
    this.DrawDisplay();              // 描画（3D + 2D + UI）
    this.DoFrame();                  // フレームカウンタ++, カメラ更新
    this.WaitRepaint(GetWaitFrame()); // フレームウェイト（90ms or 45ms）
    Calc3D.Rand(1);                  // 乱数更新
}
```

### フレームレート

```java
public int GetWaitFrame() {
    // 通常時: 90ms → 約11 FPS
    // アイドル時: 45ms → 約22 FPS
}
```

- `WaitRepaint(ms)` で Thread.sleep 相当の待機
- 移植時は `requestAnimationFrame` + 固定タイムステップに変換

---

## 描画パイプライン

### DrawDisplay()

```
DrawDisplay()
  ├── SetCamera() or Battle.SetCamera()
  ├── SetLightRange(), Fade, EarthQuake, MoveEffect
  ├── Render.Clear()
  ├── [フィールド] DrawDisplay_Field()
  │     ├── Cosmo.Draw()        (宇宙背景)
  │     ├── Render.DrawGround() (地面)
  │     ├── DrawChara()         (キャラ3D)
  │     ├── Render.DrawMap()    (マップオブジェクト)
  │     ├── DrawEffect()        (エフェクト3D)
  │     ├── Sort.Sort()         (Zソート)
  │     └── DrawAll()           (ソート済み描画)
  ├── [戦闘] DrawDisplay_Battle()
  ├── Draw_Blind(), DrawEffect2D() (2Dオーバーレイ)
  ├── DrawTextObject()
  └── RunWindow()               (UI描画)
```

### レンダラ構成

| Java クラス | 役割 | JS移植先 |
|---|---|---|
| `CRender3D` | 3D変換・ライティング・ポリゴン描画 | `renderer.js` |
| `CDrawMap` (extends CRender3D) | マップ・地面描画 | `renderer.js` |
| `CBaseRender` | 描画ユーティリティ | `renderer.js` |
| `CDrawSort` | Zソート | `renderer.js` |
| `CSurfaceDraw` | ポリゴン塗り | `renderer.js` |

---

## 入力システム

### CGameApp のキー処理

```java
keyDown(Event, int key)   // キー押下
keyUp(Event, int key)     // キー離し
mouseDown/mouseUp/mouseMove/mouseDrag  // マウス
```

### 主要キーバインド

| キー | 変数 | 用途 |
|---|---|---|
| 矢印キー | `GetKeybordVect()` | 移動（8方向） |
| Enter/Space | `CheckKeyDown_OK()` | 決定 |
| X | `CheckKeyDown_Cancel()` | キャンセル |
| Z | `m_bKeyZ` | システムメニュー |
| C | `m_nKeyC` | 遠景切替 |
| マウス左 | `mouseDown` | 決定/移動 |
| マウス右 | `m_nMouseRight` | メニュー |

---

## アセット読込

### CFile クラス

```java
// URL経由でバイナリ読込（DataInputStream）
Open(String url)    // URL接続
ReadInt()           // 4byte int (Big Endian)
ReadWord()          // 2byte short
ReadFloat()         // 4byte float
ReadChar()          // 2byte char (Unicode)
ReadByte()          // 1byte
ReadString(int len) // Unicode文字列
Close()
```

### 読込対象

| ファイル | 読込クラス | 内容 |
|---|---|---|
| `image00-31.gif` | `getImage()` | スプライト/UI画像 |
| `data/mdl000-203._k3` | `CModel.Load()` | 3Dモデル（独自形式） |
| `data/stage._su` | `CStageManage.Load()` | ステージ定義 |
| `data/event.sui` | `CEventManage.Load()` | イベントスクリプト |
| `data/param._da` | `CParamAll.Load()` | パラメータ全般 |
| `efc_00-29.au` | `LoadSe()` | 効果音（AU形式） |

---

## 主要クラス一覧

### コア

| クラス | 役割 |
|---|---|
| `ARpg` | メインクラス（Applet + ゲームループ） |
| `CGameMain` | フィールドゲームロジック |
| `CGameApp` | Applet基盤（入力/描画/SE） |
| `Vari` | グローバル変数管理（static） |
| `Def` | 定数定義 |

### 描画

| クラス | 役割 |
|---|---|
| `CRender3D` | 3Dレンダラ |
| `CDrawMap` | マップ描画（CRender3D継承） |
| `CModel` | 3Dモデルデータ |
| `CDrawSort` | Zソート |
| `CSurface` / `CSurfaceDraw` | ポリゴン面 |
| `Calc3D` | 3D数学（行列・ベクトル・三角関数） |
| `D3DXMATRIX` / `D3DXVECTOR3` | 数学型 |

### ゲームロジック

| クラス | 役割 |
|---|---|
| `CBattleMain` | 戦闘メイン |
| `CEventManage` | イベントスクリプト実行 |
| `CStageManage` | ステージ管理 |
| `CChrManage` / `CChrWork` | キャラクター管理 |
| `CMapData` | マップデータ |
| `CPlayData` | セーブデータ |
| `CGameFlag` | ゲームフラグ |

### UI

| クラス | 役割 |
|---|---|
| `CWindow` | ウィンドウ基底 |
| `CMessWindow` | メッセージウィンドウ |
| `CMenuWindow` | メニュー |
| `CSysMenu` | システムメニュー |
| `CTitle` | タイトル画面 |

---

## 移植方針メモ

### メインループ変換

```
Java: while(true) { ... Thread.sleep(90) }
  ↓
JS:   requestAnimationFrame + 固定タイムステップ(90ms ≈ 11FPS)
```

### 描画変換

```
Java: Graphics.drawPolygon / fillPolygon (ソフトウェアレンダリング)
  ↓
JS:   Canvas 2D Context (drawImage, fill, stroke)
      ※ 元がソフトウェア3DなのでCanvas2Dで十分
```

### 入力変換

```
Java: keyDown(Event, key) / mouseDown(Event, x, y)
  ↓
JS:   addEventListener('keydown') / addEventListener('mousedown')
```

### アセット読込変換

```
Java: URL → DataInputStream → readInt/readFloat/readShort
  ↓
JS:   fetch() → ArrayBuffer → DataView (Big Endian)
```

---

## 画面仕様

- 解像度: 400 x 320 px
- FPS: 約11 FPS（通常時90ms/frame）
- 3D: ソフトウェアレンダリング（Z-buffer なし、画家アルゴリズム）
- 色: RGB
- フォグ: 距離ベース線形フォグ


---

## Task 6-8: エンジン移植完了

### 作成ファイル

```
web/
├── index.html              HTML5版エントリ
├── main.js                 ゲームメイン（状態管理 + ループ統合）
└── engine/
    ├── math.js             Vec3, Color, Mat4（3D数学ライブラリ）
    ├── renderer.js         ソフトウェア3Dレンダラ（Canvas 2D）
    ├── input.js            キーボード/マウス入力ハンドラ
    ├── loader.js           バイナリアセット読込（fetch + DataView）
    └── loop.js             固定タイムステップゲームループ（90ms）
```

### 移植対応表

| Java元クラス | JS移植先 | 状態 |
|---|---|---|
| `D3DXVECTOR3` | `math.js → Vec3` | ✅ 完了 |
| `D3DXMATRIX` | `math.js → Mat4` | ✅ 完了 |
| `D3DXCOLOR` | `math.js → Color` | ✅ 完了 |
| `CRender3D` | `renderer.js → Renderer` | ✅ 基盤完了 |
| `CGameApp (入力部)` | `input.js → Input` | ✅ 完了 |
| `CFile` | `loader.js → BinaryReader` | ✅ 完了 |
| `CModel (構造)` | `loader.js → Model` | ⚠️ パーサー要調整 |
| `MainFrame/DoFrame` | `loop.js → GameLoop` | ✅ 完了 |
| `CGameMain` | `main.js (placeholder)` | 🔲 未実装 |
| `CEventManage` | — | 🔲 未実装 |
| `CBattleMain` | — | 🔲 未実装 |
| `CStageManage` | — | 🔲 未実装 |
| `CTitle` | `main.js (簡易版)` | ⚠️ 仮実装 |

---

## 残作業一覧

### 必須（ゲーム動作に必要）

| # | タスク | 内容 | 難易度 |
|---|---|---|---|
| 1 | モデルフォーマット解析 | `mdl*._k3` のバイナリ構造を `xxd` で確認し `parseModel()` を修正 | 中 |
| 2 | ステージデータ解析 | `stage._su` のパーサー実装（マップ地形・NPC配置・エリア定義） | 高 |
| 3 | イベントスクリプト解析 | `event.sui` のバイトコード仕様特定・インタプリタ実装 | 高 |
| 4 | パラメータデータ解析 | `param._da` のパーサー（キャラ/敵/アイテム/スキル定義） | 中 |
| 5 | フィールド移動実装 | `CGameMain.Move` / `MovePlayer` / カメラ追従 | 中 |
| 6 | マップ描画実装 | `CDrawMap.DrawGround` / `DrawMap`（地形ポリゴン描画） | 高 |
| 7 | キャラクター描画 | `DrawChara` / アニメーション / パーティ追従 | 中 |
| 8 | エリア遷移 | `XChgArea` / フェードイン・アウト | 低 |
| 9 | メッセージウィンドウ | `CMessWindow` / テキスト表示 | 低 |
| 10 | 戦闘システム | `CBattleMain` 全体（コマンド選択・ダメージ計算・演出） | 最高 |

### 推奨（品質向上）

| # | タスク | 内容 |
|---|---|---|
| 11 | タイトル画面再現 | `CTitle.Run` の忠実な移植 |
| 12 | セーブ/ロード | `CPlayData` → localStorage |
| 13 | SE再生 | `.au` → Web Audio API（AudioContext） |
| 14 | システムメニュー | `CSysMenu`（装備・アイテム・ステータス） |
| 15 | ワールドマップ | `CWorldMap` |
| 16 | スタッフロール | `CStaffRoll` |

### デプロイ（Task 9-10）

| # | タスク | 内容 |
|---|---|---|
| 17 | gameplay parity確認 | CheerpJ版と並べて挙動比較 |
| 18 | GitHub Pages公開 | `docs/` に配置、CI設定 |

---

## 推奨進行順

```
1. モデルフォーマット解析 ← 最優先（描画の根幹）
2. ステージデータ解析
3. フィールド移動 + カメラ
4. マップ描画
5. キャラクター描画
6. イベントスクリプト（会話・フラグ）
7. 戦闘システム
8. UI（メニュー・ウィンドウ）
9. parity確認
10. デプロイ
```

モデルフォーマットが判明すれば、フィールド1画面を描画するところまで一気に進められる。


---

## モデルフォーマット解析 (._k3)

### ファイル構造（CFileJip圧縮）

```
[4byte int]  圧縮データサイズ + 9
[4byte int]  展開後サイズ
[1byte]      RLEマーカーバイト
[残り]       RLE圧縮データ
```

### RLE展開ルール

```
byte != marker → そのまま出力
byte == marker → 次byte=値, その次byte=繰り返し回数
```

### 展開後データ構造（CModel.Load）

```
[int]        頂点数 (vertCount)
[short]      面数 (surfCount)
[short]      マテリアル数 (matCount)

// バウンディングボックス (8頂点)
[float×3]×8  BBox頂点

// モデル高さ
[float]      topY (m_fHeight)

// 頂点配列
[float×3]×vertCount  頂点座標 (x, y, z)

// マテリアル配列
for each material:
  [int]      color.r
  [int]      color.g
  [int]      color.b
  [float]    diffuse
  [float]    specular
  [int]      flags

// 面配列
for each surface:
  [short]    materialIndex
  [short]    vertCount (3 or 4)
  [short]    vertIndex[1]  ← 注意: 順番が [1,0,3,2]
  [short]    vertIndex[0]
  [short]    vertIndex[3]
  [short]    vertIndex[2]
  [float]    normal.x
  [float]    normal.y
  [float]    normal.z
```

### 全データ Big Endian


---

## 現在の進捗（チャット1終了時点）

### 動作確認済み
- フィールド移動 + コリジョン
- カメラ回転（A/Sキー）
- NPC表示（3Dモデル）
- エリア遷移（スコープイベント）
- NPC会話（イベントスクリプト基盤）
- メッセージウィンドウ（テキスト送り）
- IF/IFN分岐（別イベントへのジャンプ）
- 制御コード除去（@S等）
- はい/いいえ選択肢UI

### 未解決の問題

#### 壁イベント（WallEvent）の方向判定
- `vect` フィールドはビットフラグ方式
  - `15` = 0b1111 = 全方向
  - `4` = 0b0100 = 特定方向のみ
  - `8` = 0b1000 = 特定方向のみ
- 現在のコードは `vect` を0-3の整数として比較しているため一致しない
- 修正方法: プレイヤーの向きをビット(1,2,4,8)に変換し、`(we.vect & playerBit) !== 0` で判定

```javascript
// 修正案
const dirBits = [1, 2, 4, 8]; // 0=north, 1=east, 2=south, 3=west
let vectIdx = Math.round(this.playerVect / (Math.PI / 2)) % 4;
if (vectIdx < 0) vectIdx += 4;
const playerBit = dirBits[vectIdx];
if ((we.vect & playerBit) !== 0) { /* trigger */ }
```

#### イベントスクリプト
- 基本的なMESS/IF/IFN/JUMP/CALL/OPENW/CLOSEWは動作
- 未対応コマンドはオペランドサイズテーブルでスキップ
- 一部コマンドのサイズが不正確な可能性あり

### ファイル構成

```
okodukai_history/suika/
├── index.html              CheerpJ版（原作動作確認用）
├── arpg.jar                原作JAR
├── image00-31.gif          画像アセット
├── efc_00-29.au            効果音（jar内から展開）
├── data/                   ゲームデータ
├── checksums.txt           MD5チェックサム
├── ANALYSIS.md             この文書
├── decompiled/
│   ├── cfr.jar             デコンパイラ
│   ├── classes/            展開済みクラスファイル
│   └── src/                逆コンパイル済みJavaソース（134ファイル）
└── web/
    ├── index.html          HTML5版エントリ
    ├── main.js             ゲームメイン
    └── engine/
        ├── math.js         Vec3, Color, Mat4
        ├── renderer.js     ソフトウェア3Dレンダラ
        ├── input.js        入力ハンドラ
        ├── loader.js       アセット読込 + RLE展開
        ├── loop.js         ゲームループ
        ├── stage.js        ステージデータパーサー
        ├── field.js        フィールド描画 + 移動
        ├── event.js        イベントスクリプト実行
        └── message.js      メッセージ/選択肢UI
```

### 次チャットでの作業予定
1. 壁イベントのvectビットフラグ修正
2. 宿屋エリアでの動作確認
3. 戦闘システムの基盤実装
4. GitHub Pages公開準備


---

## チャット2 進捗

### 完了した作業

1. **壁イベントvectビットフラグ修正** — 前回チャット末で既に修正済みを確認
2. **ifFlagチェック追加** — wallEvent/scopeのifFlag条件判定を実装
3. **パラメータデータパーサー (params.js)** — `param._da` の完全なパーサー実装
   - キャラクターパラメータ（名前・LV・HP/MP・各ステータス・装備・アビリティ）
   - レベルアップデータ
   - 敵パーティ構成
   - アイテムデータ（名前・種類・装備部位・ステータス補正・価格）
   - スキルデータ（名前・対象・種類・MP消費）
   - ヘルプテキスト
4. **戦闘エンジン (battle.js)** — ターン制戦闘の基盤実装
   - 速度ベースのターン順序（AGI + ランダム）
   - 物理ダメージ計算（原作のCalcWeaponDamage準拠）
   - 命中判定（DEX vs AGI）
   - 防御コマンド
   - 逃走判定
   - 勝利/敗北/逃走の結果処理
   - EXP/Gold獲得
5. **戦闘UI (battle-ui.js)** — Canvas 2Dベースの戦闘画面
   - 敵表示（HPバー付き）
   - プレイヤーステータス表示
   - コマンドメニュー（こうげき/ぼうぎょ/にげる）
   - ターゲット選択UI
   - 戦闘ログ表示
6. **エンカウントシステム** — フィールド移動時のランダムエンカウント
7. **イベント→戦闘連携** — E_BATTLE/E_BATTLE2コマンドから戦闘開始
8. **デバッグ機能** — Bキーで戦闘テスト開始

### 新規ファイル

```
web/engine/
├── params.js       パラメータデータパーサー
├── battle.js       戦闘エンジン（ロジック）
└── battle-ui.js    戦闘UI（描画）
```

### 次の作業予定
1. 戦闘の動作確認・デバッグ
2. レベルアップシステム（prmUpsデータ活用）
3. システムメニュー（装備・ステータス確認）
4. GitHub Pages公開準備


---

## チャット3 進捗

### 完了した作業

1. **スキル/魔法システム** — INT基準ダメージ/回復/バフ/デバフ/状態異常、MP消費
2. **アイテム使用** — HP回復/全体回復/毒治療/蘇生
3. **戦闘後HP/MP永続化** — フィールドに戻ってもダメージ持続
4. **戦闘UIメニュー拡張** — こうげき/まほう/アイテム/ぼうぎょ/にげる
5. **ゲームセンター統合** — pages/suika.html + arcade.htmlカード追加
6. **スマホタッチUI** — アナログスティック + A/B/◀▶/≡ボタン
7. **イベントスクリプト全75コマンド対応** — IFCALL/IFNRET/ITEM/MAPM/MAPH等
8. **レベルアップシステム** — prmUpsテーブル準拠ステータス成長
9. **フェードイン/アウト演出**
10. **タイトル画面** — 原作準拠青グラデ + 初めから/続きから
11. **セーブ/ロード** — localStorage（パーティ/エリア/フラグ/インベントリ）
12. **システムメニュー** — Z/≡でステータス確認/セーブ/タイトル戻り
13. **SE再生** — Web Audio + .au(mu-law/PCM)デコーダー
14. **ショップシステム** — 買う/売る UI、イベント連携
15. **戦闘結果画面** — EXP/Gold/レベルアップ表示
16. **宿屋** — INコマンドでHP/MP全回復
17. **フィールドHUD** — HP/MP/Lv/Gold常時表示
18. **影描画** — プレイヤー/NPC足元楕円影
19. **戦闘地面改善** — パースペクティブグリッド

### ファイル構成（最新）

```
suika/web/
├── index.html              HTML5版エントリ（スタンドアロン）
├── main.js                 ゲームメイン（全状態管理・セーブ/ロード・装備・メニュー）
└── engine/
    ├── math.js             Vec3, Color, Mat4
    ├── renderer.js         ソフトウェア3Dレンダラ
    ├── input.js            キーボード/マウス/タッチ入力
    ├── touch-ui.js         スマホ用バーチャルパッド（スティック+5ボタン）
    ├── loader.js           バイナリアセット読込 + RLE展開
    ├── loop.js             固定タイムステップゲームループ
    ├── stage.js            ステージデータパーサー
    ├── field.js            フィールド描画 + 移動 + 影
    ├── event.js            イベントスクリプト（全75コマンド）
    ├── message.js          メッセージ/選択肢UI
    ├── params.js           パラメータデータパーサー
    ├── battle.js           戦闘エンジン（スキル/アイテム/毒/AI5カテゴリ）
    ├── battle-ui.js        戦闘UI（コマンド/エフェクト/パーティクル）
    ├── audio.js            Web Audio SE再生（.auデコーダー）
    ├── shop.js             ショップUI（買う/売る）
    ├── credits.js          スタッフロール
    └── password.js         復活の呪文デコーダー
pages/
├── suika.html              ゲームセンター版ページ
└── arcade.html             ゲームセンター（カード追加済み）
```

### 残作業
- 戦闘エフェクトさらなる強化（個別スキルアニメーション）
- 敵AI個別パターン完全移植（80+パターン→現在5カテゴリ簡略化）
- パスワードセーブ生成（現在は読込のみ）
- 一部イベントコマンドの演出（MOVE/POS等のNPC移動アニメーション）
- クイズイベント
- 合成ショップ

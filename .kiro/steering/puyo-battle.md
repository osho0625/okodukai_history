---
inclusion: fileMatch
fileMatchPattern: "*puyo*,*game.html*"
---

# ぴくぴく対戦 + ぷよゲーム

## ファイル構成

- `pages/puyo-battle.html` — ぴくぴく対戦（オンライン2人対戦、お邪魔ぷよ）
- `pages/game.html` — ぷよぷよ風パズルゲーム（難易度選択対応）
- `pages/ranking.html` — ぷよランキング（難易度別タブ）
- `js/puyo-battle-main.js` — ぴくぴく対戦メインロジック
- `js/puyo-room-state.js` — ルーム状態管理
- `js/puyo-ownership.js` — オーナーシップ管理
- `js/puyo-reconnect.js` — 再接続処理
- `js/puyo-escape.js` — ぷよ逃走アニメーション共通処理
- `css/puyo-escape.css` — ぷよ逃走アニメーション共通CSS（game.html, puyo-battle.htmlで共有）
- `images/puyo_1〜10.avif` — ピクミン画像（1:紫, 2:赤, 3:青, 4:黄, 5:白, 6:氷, 7:岩, 8:羽, 9:光, 10:お邪魔）

## ぷよゲーム（game.html）

- タイトル画面（ぷよ表示＋芽→引き抜き演出、ゲーム開始→難易度選択/ランキング）
- 難易度選択: Easy(4色/遅い/最速400ms), Normal(5色/普通/最速200ms), Hard(6色/速い/最速150ms), Special(9色/速い/最速100ms/8×16盤面)
- Hard/Specialはロック制（localStorage管理、Normal3万点→Hard解除、Hard3万点→Special解除）
- ロック中の難易度タップで解除条件モーダル表示
- ロック解除時に鍵揺れ→壊れ→解放演出（難易度選択画面を開いた時に再生）
- 再ロック: 「難易度を選択」テキスト10回タップで確認ダイアログ
- admin限定🧪デバッグモード（解除閾値を10点に一時変更、sessionStorage）
- 難易度選択画面にフレーバーテキスト表示（アイコンなし）
- 難易度比較表はランキングページにadmin限定で表示
- 加速はEasy以外すべて同じ（accel:25）、初期速度のみ差別化
- 2段階加速: 150msまでは通常ペース、150ms以下は緩やかに加速（50000点で最速到達）
- Hard最速150ms、Special最速100ms
- 3秒カウントダウン後にゲーム開始
- 本家風スコア計算、ランキングTOP10（難易度別）
- 操作ボタン配置カスタマイズ（⚙️アイコン、タップ入れ替え方式、localStorage保存）
- 夜間制限（日〜木21時、金土22時〜4時）

## ぴくぴく対戦（puyo-battle.html）

- ぴくぴく(game.html)タイトル画面の「2人であそぶ」から遷移
- Supabase Realtimeによるオンラインマルチプレイヤー対戦（最大6人）
- マッチング: ルーム一覧から選んで参加（コード入力不要）
- パスコード: 任意で数字4桁を設定可能（デフォルトなし）
- 難易度: ルーム作成時に選択（Easy/Normal/Hard/Special/カスタム）
  - 解放済みの難易度のみ選択可能（localStorage参照）
  - カスタムモード: 色数/盤面サイズ/速度を自由設定
- 再戦機能: 「もういちど」ボタンで同じ相手と連戦（両者同意制、30秒タイムアウト）
- 3人以上入室: 先に入った2人が対戦、3人目以降は観戦/順番待ちを選択
- 勝ち残り方式: 勝者が残り、順番待ち先頭と対戦。敗者は待ちリスト末尾へ。5秒インターバル後に自動開始
- 観戦のみ制限: ルーム作成時チェックボックスで順番待ちを無効化（👁アイコン表示）
- 参加者パネル: 全参加者の役割（🎮対戦/👁観戦/⏳順番待ち/👑オーナー）・連勝数表示
- 再接続: 30秒grace period、役割保持、Active_Playerのinput即時freeze
- オーナーシップ: heartbeat 5秒間隔、15秒タイムアウトで最古参に自動移譲、claim tie-break
- 状態管理: Owner権威モデル、stateId={epoch,version}、epoch++でsplit-brain防止
- お邪魔ぷよ: 連鎖スコア÷70個を相手に送信、相殺あり
- お邪魔ぷよ仕様: puyo_10画像で表示、連鎖に参加しない、隣接消去で消える、1行に1穴
- 予告表示: 岩(30個)/大(6個)/小(1個)
- 連鎖演出: ノーマルモードと同等の逃走アニメーション（4段階: burst→scatter→getup→run）、プレイヤー・観戦者両方に表示
- 落下アニメーション: 連鎖消去後の重力落下を補間描画（ノーマルモードと同じ `y += (targetY - y) * 0.12`）
- 連鎖テキスト: 2連鎖以上で「N連鎖!」をローカル盤面上部に表示（プレイヤー・観戦者両方）
- パーティクルエフェクト: 消去時の破片演出（プレイヤー・観戦者両方、パーティクルオーバーレイcanvas）
- 観戦者アニメーション: chain_animationイベントブロードキャストで両ボードに連鎖演出を同期表示
- パーティクル: 消去時に破片エフェクト（ローカルcanvasのみ）
- 特殊ぷよモーション: puyo_8(羽)=飛行、puyo_9(光)=浮遊（puyo-escape.js共通処理）
- ぷよ出現順序同期: seeded PRNG（mulberry32）で両者同一のぷよ色列を生成
  - シード: crypto.getRandomValues生成、ルーム参加時にbroadcast共有
  - お邪魔ぷよ穴位置: 別系列PRNG（seed ^ 0xDEADBEEF）
  - 再接続: PRNG内部state直接復元
- 通信: Supabase Realtime Broadcast（room_state_sync権威モデル + 個別イベント）
- アニメーションはローカル表示のみ（通信同期しない）
- 相手の落下中ぷよ・NEXTぷよもリアルタイム描画
- game_settings.game_publish不要（ぴくぴくタイトルから直接遷移）

## DBテーブル

### puyo_battles（ぷよ対戦ルーム）
- id: UUID (PK), room_code: TEXT UNIQUE, player1_name: TEXT, player2_name: TEXT
- passcode: TEXT (nullable、数字4桁、NULLならパスコードなし)
- difficulty: JSONB DEFAULT '{"type":"normal"}' (type: easy/normal/hard/special/custom、custom時はsettingsオブジェクト含む)
- status: TEXT DEFAULT 'waiting' CHECK IN ('waiting', 'playing', 'finished')
- winner: TEXT, created_at: TIMESTAMPTZ, finished_at: TIMESTAMPTZ
- RLS無効

### game_rankings（ぷよランキング）
- id: UUID, name: TEXT, score: INT, difficulty: TEXT (default 'normal'), created_at: TIMESTAMPTZ

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| puyoCtrlOrder | ぷよ操作ボタン並び順 | 永続 |
| puyo_hard_unlocked | ぷよHard解除フラグ | 永続 |
| puyo_special_unlocked | ぷよSpecial解除フラグ | 永続 |
| puyo_hard_unlock_pending | Hard解除演出待ち | 消化で削除 |
| puyo_special_unlock_pending | Special解除演出待ち | 消化で削除 |

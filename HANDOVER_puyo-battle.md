# ぴくぴく対戦モード - 引継ぎ

最終更新: 2026/05/26

## 現在の状態

- ブランチ: `TSJ260526`（mainにマージ済み、origin/mainと同期）
- 最新コミット: `933cbd2 Merge branch 'TSJ260519' into main (リマインダー機能、ぴくぴく対戦修正 等)`
- アプリバージョン: v1.84.0
- Service Worker: v111
- Supabase: `puyo_battles`テーブル作成済み（passcode, difficulty, spectator_only, owner_client_id, max_players, updated_at カラム含む）

## v1.80.0以降の対戦モード変更履歴

### v1.83.0（2026/05/25）— マルチプレイヤー拡張
- 再戦機能（「もういちど」ボタン、両者同意制、30秒タイムアウト）
- 3人以上の入室対応（最大6人、観戦/順番待ち選択）
- 勝ち残り方式（勝者が残り、順番待ち先頭と対戦）
- 観戦モード（両プレイヤーの盤面をリアルタイム表示）
- 「観戦のみ」制限オプション（ルーム作成時チェックボックス）
- 参加者一覧パネル（役割アイコン・連勝数・順番表示）
- 再接続対応（30秒grace period、役割保持）
- オーナーシップ自動移譲（heartbeat監視、15秒タイムアウト）
- puyo_battlesテーブル拡張（max_players, spectator_only, owner_client_id, updated_at）
- ルーム状態管理をES moduleに分離（puyo-room-state.js, puyo-ownership.js, puyo-reconnect.js）

### v1.82.2（2026/05/22）
- 連鎖後の落下タイミング修正（消去→200ms待機→落下）
- 相手のNEXTぷよを表示

### v1.82.1（2026/05/22）
- 連鎖後の落下アニメーション追加
- お邪魔ぷよをpuyo_10画像で表示

### v1.82.0（2026/05/22）— 連鎖演出・PRNG同期
- 連鎖アニメーション（逃走演出）追加（4段階: burst→scatter→getup→run）
- 連鎖テキスト表示（「N連鎖!」）
- パーティクルエフェクト（消去時の破片演出）
- 特殊ぷよ逃走モーション（羽ピクミン飛行、光ピクミン浮遊）
- ぷよ出現順序同期（seeded PRNG: mulberry32）
- 再接続時のPRNG状態復元
- 逃走アニメーションCSSを共通ファイル化（css/puyo-escape.css）

### v1.83.3（2026/05/25）— バグ修正
- 古い部屋の自動削除（5分タイムアウト）
- オーナー退出時にDB行を完全削除＋接続中ユーザーへ解散通知
- 部屋参加時の真っ暗画面を修正
- Supabase接続先URLの修正

### その他修正（TSJ260519ブランチ）
- ぷよ描画を画像ベースに修正（丸→puyo_1〜10画像）
- オーナーをseatAに即時割り当て
- player_joinをチャンネルSUBSCRIBED後に送信するよう修正
- ルーム参加後に接続中から進まない問題を修正（room_state_syncにseed含め、PLAYING状態で自動開始）

## 対戦モードの仕様（最新）

### フロー
1. ぴくぴくタイトル → 「2人であそぶ」→ puyo-battle.html
2. 名前入力 → 「ルームをつくる」or「ルームに入る」
3. ルーム作成: 難易度選択（解放済みのみ）+ パスコード任意 + 観戦のみ制限 + 最大人数 → 待機画面
4. ルーム参加: 待機中ルーム一覧から選んで参加（パスコードあればprompt）
5. 両者接続 → 1秒後にバトル開始
6. どちらかが詰む → 勝敗表示 → 再戦 or ロビーに戻る
7. 3人以上: 勝者残り、順番待ち先頭と5秒後に自動開始

### 技術構成
- 通信: Supabase Realtime Broadcast（チャンネル名: `battle_{roomCode}`）
- 状態管理: Owner権威モデル（room_state_sync）、stateId={epoch,version}
- モジュール構成:
  - `js/puyo-battle-main.js` — メインロジック（ES module）
  - `js/puyo-room-state.js` — ルーム状態管理（STATES export）
  - `js/puyo-ownership.js` — オーナーシップ管理（heartbeat、移譲）
  - `js/puyo-reconnect.js` — 再接続管理（30秒grace period）
  - `js/puyo-escape.js` — 逃走アニメーション共通処理
  - `css/puyo-escape.css` — 逃走アニメーションCSS
- ぷよ出現順序: seeded PRNG（mulberry32）で同期
  - シード: crypto.getRandomValues生成、ルーム参加時にbroadcast共有
  - お邪魔ぷよ穴位置: 別系列PRNG（seed ^ 0xDEADBEEF）
- アニメーションはローカル表示のみ（通信同期しない）
- 各端末は自分のgridを自分で計算、200msごとにbroadcast

### お邪魔ぷよ（原作準拠）
- 生成: 連鎖スコア ÷ 70（端数切り捨て）
- 相殺: 自分が連鎖すると予告分を打ち消し、余剰を相手に送る
- 落下: 連鎖終了後、次のぷよが出る前に降る
- 形状: 1行に1穴（ランダム位置、別系列PRNG）
- 性質: puyo_10画像、連鎖に参加しない、隣接する色ぷよが消えると一緒に消える
- 予告表示: 岩(30個) / 大(6個) / 小(1個)

### 難易度選択
- Easy: 4色, 6×13, 最速400ms
- Normal: 5色, 6×13, 最速200ms（デフォルト）
- Hard: 6色, 7×13, 最速150ms（Normal3万点で解放）
- Special: 9色, 8×16, 最速100ms（Hard3万点で解放）
- カスタム: 色数/盤面/速度を自由設定（Special3万点で解放）
- localStorage参照: `puyo_hard_unlocked`, `puyo_special_unlocked`, `puyo_custom_unlocked`

### DB: puyo_battles
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID PK | |
| room_code | TEXT UNIQUE | 4文字コード |
| player1_name | TEXT | 作成者名 |
| player2_name | TEXT | 参加者名 |
| passcode | TEXT | 任意4桁（NULLならなし） |
| difficulty | JSONB | `{"type":"normal"}` or `{"type":"custom","settings":{...}}` |
| status | TEXT | waiting / playing / finished |
| winner | TEXT | 勝者名 |
| spectator_only | BOOLEAN | 観戦のみ制限 |
| owner_client_id | TEXT | 現在のオーナーclient ID |
| max_players | INT | 最大参加人数 |
| created_at | TIMESTAMPTZ | |
| finished_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

## 既知の課題・改善候補
- 全消しボーナスは対戦モードでは未実装
- 夜間制限チェックは対戦モードでは未実装
- 切断検知の改善余地（現在30秒grace periodだが、長時間放置への対応）

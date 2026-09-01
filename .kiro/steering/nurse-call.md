---
inclusion: fileMatch
fileMatchPattern: "*nurse*"
---

# ナースコール機能

## 概要

病気で隔離中の子供が親を即座に呼び出せるリアルタイム通知・通話・チャットシステム。
Supabase Edge Functionによる即時Push配信 + WebRTC音声/ビデオ通話 + Realtime Broadcastチャット。

## ファイル構成

- `pages/nurse-call.html` — ナースコール画面（4ビュー: ホーム/チャット/通話/体温）
- `js/nurse-call.js` — メインロジック（呼び出し、応答、親画面、オフラインキュー）
- `js/nurse-call-chat.js` — チャットモジュール（Realtime Broadcast + DB永続化）
- `js/nurse-call-voice.js` — WebRTC音声通話モジュール（状態機械、シグナリング）
- `supabase/functions/push-nurse-call/index.ts` — Edge Function（即時Push配信）
- `sql/create_nurse_call_tables.sql` — nurse_calls, nurse_call_messages, device_settings テーブル定義
- `sql/alter_game_settings_nurse_call.sql` — game_settings拡張カラム
- `sql/create_temperature_log.sql` — temperature_logs テーブル定義

## DBテーブル

### nurse_calls（呼び出し履歴）
- id UUID PK, child_id UUID, child_name TEXT, reason TEXT
- status ('active'/'resolved'), notification_status ('pending'/'sent'/'partial'/'failed')
- created_at TIMESTAMPTZ, responded_at TIMESTAMPTZ

### nurse_call_messages（チャットメッセージ）
- id UUID PK, call_id UUID (nullable FK→nurse_calls.id), child_id UUID
- sender_role ('parent'/'child'), sender_name TEXT (nullable), message_text TEXT, created_at TIMESTAMPTZ

### device_settings（デバイス状態管理）
- device_id TEXT PK, child_id UUID, nurse_call_mode BOOLEAN, updated_at TIMESTAMPTZ

### temperature_logs（体温記録）
- id UUID PK, child_name TEXT, temperature NUMERIC(3,1)
- measured_at TIMESTAMPTZ, device_id TEXT

### game_settings 拡張カラム
- nurse_call_enabled BOOLEAN — 機能ON/OFF
- nurse_call_visible_to_user BOOLEAN — user端末への表示ON/OFF（default true）
- nurse_call_notify_targets JSONB — 通知先device_idリスト（null=admin全端末）
- nurse_call_child_ids JSONB — 対象child_idリスト（未使用）
- nurse_call_ice_servers JSONB — STUN/TURN設定

## 画面構成（nurse-call.html）

### 子供側（user端末）
4ビュー切り替え方式:
- **ホームビュー**: 🔔ベルボタン（理由なし送信）+ 理由ボタン6つ + 💬📞ナビアイコン + 🌡️体温計
- **チャットビュー**: テキスト入力 + 送受信表示
- **通話ビュー**: でんわする/きるボタン + 接続状態表示 + タイマー
- **体温入力ビュー**: テンキー（3桁入力→XX.X自動フォーマット）

### 親側（admin端末）
- 「いくよ！」丸ボタン（180px）
- 「📞 電話する」ボタン
- 「📞 電話に出る」ボタン（着信時のみ表示）
- 「切る」ボタン（通話中のみ）
- 🌡️ 体温の記録（履歴表示 + 子供フィルタ + 日付グループ + 編集/削除）

## 通話（WebRTC）の仕組み

- チャネル名: `nurse-voice-call`（固定、家庭内利用で同時通話は1つ）
- シグナリング: Supabase Realtime Broadcast
- 状態機械: idle → ringing → connected → ended → idle
- 自分のbroadcast無視: senderId でフィルタ
- ringing リトライ: 3秒間隔×20回（1分間）、タイムアウトで自動切断
- 子供側: 着信時自動応答（マイク取得→acceptCall→PeerConnection作成）
- ICE構成: game_settings.nurse_call_ice_servers（デフォルト: Google STUN）

### 音声/ビデオ通話（js/nurse-call-voice.js）

通話は音声で開始し、通話中に任意でビデオを追加できる方式。

- **音声**: 発信/応答時に `getUserMedia({ audio: true })` でマイク取得
- **ビデオ追加**: `toggleVideo()` で `getUserMedia({ video: { facingMode: 'user' } })` のトラックを `pc.addTrack()` で追加
- **renegotiation**: `onnegotiationneeded` で通話中の映像追加時に自動でoffer/answer再交換
- **映像受信**: `pc.ontrack` で `track.kind === 'video'` を判定し、role別のvideo要素に表示
  - 親（admin）: `parentRemoteVideo` / `parentLocalVideo`
  - 子供（user）: `voiceRemoteVideo` / `voiceLocalVideo`
- **音声受信**: `parentRemoteAudio` / `voiceRemoteAudio`
- **ICE candidateキュー**: PeerConnection作成前に届いたcandidateは `pendingIceCandidates` にバッファ
- **バックグラウンド維持**: Screen Wake Lock API + 無音オーディオループ（タブサスペンド防止）
- 公開API: `NurseCallVoice.{ init, startCall, acceptCall, endCall, toggleVideo, getState, onStateChange, destroy }`

## ビデオ通話のラズパイ流用について

このWebRTC実装（音声+ビデオ、renegotiation対応）は、おうちブロードキャストのラズパイ
ビデオ通話にそのまま流用可能。ラズパイ側はChromiumキオスクモードで通話ページを常時表示し、
着信を自動応答する構成を想定。

### 外出先からの接続（親が外→家の子供）

- **STUNのみでは接続不可のケースが多い**: モバイル回線（4G/5G CGNAT）と自宅NAT間はSTUNだけだと
  ホールパンチできず接続失敗することが多い
- **TURNサーバーが必須**: 外出先からの接続には中継用TURNサーバーが必要
  - 選択肢: 自前TURN（coturnをVPS等に構築）、Cloudflare Calls、Twilio TURN、metered.ca等の有料/従量TURN
  - `game_settings.nurse_call_ice_servers` にTURN構成を追加すれば既存コードで対応可能
    （例: `[{"urls":"stun:stun.l.google.com:19302"},{"urls":"turn:xxx","username":"u","credential":"p"}]`）
- 同一Wi-Fi内（家の中の別部屋同士）ならSTUNのみで接続可能

## Push通知

- Edge Function `push-nurse-call` で即時配信（5分cronではない）
- 通知対象: デフォルトrole='admin'の全端末
- チャットメッセージ: 子供からの送信時、1分間隔制限付きで即時Push
- 体温測定: 「○○が体温を測りました（℃ 時刻）」形式
- 親から電話: 子供端末にPush通知（通知タップでナースコール画面を開く）

## ナースコールモード（デバイスロック）

- device_settingsテーブルのnurse_call_modeがtrue → 全ページでナースコール画面にリダイレクト
- common.jsのDOMContentLoadedイベントで判定
- localStorageキャッシュ（5分TTL）でAPIコール削減
- admin画面から端末ごとにON/OFF切り替え

## 名前選択

- ハードコード: はるちか、いろは、かいせい
- localStorage `nurse_call_child_name` に保存
- ナースコール画面上部に名前表示、タップで変更可能

## localStorage キー

| キー | 用途 |
|------|------|
| nurse_call_child_name | 選択中の子供名 |
| nurse_call_offline_queue | オフラインキュー（最大1件） |
| nurse_call_current_call_id | 現在アクティブなcall_id |
| nurse_call_last_chat_notify | 最後のチャット通知タイムスタンプ |
| device_lock_cache | デバイスロック状態キャッシュ |

---
inclusion: fileMatch
fileMatchPattern: "*broadcast*,*raspi*,*video-call*"
---

# おうちブロードキャスト / おうちビデオ通話

## 概要

お小遣い手帳アプリからボタンを押すと、リビングのRaspberry Piが定型文を読み上げる機能。
Alexaに「分かった」等と返事すると、admin端末にPush通知が届く。

## アーキテクチャ

```
[アプリ] --ボタン押下--> [Supabase alexa_messages INSERT]
                                    |
                    [Raspberry Pi: Realtime購読 → gTTS → スピーカー再生]
                                    |
                            [Discord通知]

[Echo] --「分かった」--> [Alexa Custom Skill] --> [Supabase alexa_messages UPDATE]
                                              \--> [Push通知キュー (admin)]
                                              \--> [Discord通知]
```

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `pages/family-broadcast.html` | ブロードキャスト送信UI（admin向け） |
| `raspi/broadcast-listener.py` | ラズパイ読み上げサービス（Supabase Realtime + gTTS） |
| `raspi/setup.sh` | ラズパイセットアップスクリプト |
| `raspi/README.md` | ラズパイセットアップガイド |
| `alexa/interactionModels/ja-JP.json` | 対話モデル（CheckBroadcastIntent / ReplyOkIntent） |
| `alexa/lambda/index.js` | Lambda（メッセージ確認・返事ハンドラー） |
| `sql/003-alexa-broadcast.sql` | テーブル定義 |

## Supabaseテーブル: alexa_messages

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | 自動生成 |
| direction | TEXT | 'to_alexa'（アプリ→ラズパイ）/ 'from_alexa'（Alexa→アプリ） |
| message | TEXT | メッセージ本文 |
| replied | BOOLEAN | 返事済みフラグ（default: false） |
| reply_text | TEXT | 返事内容（nullable） |
| replied_at | TIMESTAMPTZ | 返事日時（nullable） |
| created_at | TIMESTAMPTZ | 作成日時 |

## Raspberry Pi 構成

- ハードウェア: Raspberry Pi 5 (2GB)
- OS: Raspberry Pi OS（標準版、Scratch/Minecraft等プリインストール）
- TTS: gTTS（Google Text-to-Speech、無料、日本語対応）
- 再生: mpg123（軽量MP3プレーヤー）
- 購読: supabase-py（Supabase Realtime Python クライアント）
- 自動起動: systemd service（broadcast.service）

### 読み上げフロー
1. broadcast-listener.py が Supabase Realtime で `alexa_messages` の INSERT を購読
2. `direction='to_alexa'` の新規レコードを検知
3. gTTS でテキスト→MP3変換（一時ファイル）
4. mpg123 でスピーカー再生
5. 一時ファイル削除

## 定型メッセージ

| 絵文字 | メッセージ | 時間指定 |
|--------|-----------|---------|
| 🍚 | {time}までにご飯炊いて | ○ |
| 🏓 | 今日はピックル | × |
| 🚗 | {time}から出かけるよ | ○ |
| 🍽️ | 今日は外食 | × |
| 🛁 | {time}までにお風呂入って | ○ |
| 📚 | 宿題やった？ | × |
| 🏠 | {time}に帰るよ | ○ |
| 🛒 | 買い物行ってくるね | × |

## Alexa Intent一覧（追加分）

| Intent | 用途 | 発話例 |
|--------|------|--------|
| CheckBroadcastIntent | 未読メッセージ確認 | 「メッセージ確認」「連絡ある」 |
| ReplyOkIntent | 返事 | 「分かった」「了解」「OK」 |

## 通知フロー

### 送信時（アプリ → ラズパイ）
1. `alexa_messages` にINSERT（direction: 'to_alexa'）
2. ラズパイがRealtimeで検知 → gTTS → スピーカー再生
3. Discord通知

### 返事時（Alexa → アプリ）
1. `alexa_messages` のreplied=trueに更新
2. Discord通知（✅ Alexa返事）
3. Push通知キュー（admin向け）

## ラズパイセットアップ

```bash
git clone https://github.com/osho0625/okodukai_history.git
cd okodukai_history/raspi
bash setup.sh
sudo systemctl start broadcast
```

詳細は `raspi/README.md` を参照。

## ビデオ通話（実装済み）

ラズパイをリビングのビデオ通話端末にする機能。想定シナリオは「親が外出先から家の子供に」。

### 構成ファイル
- `pages/video-call.html` — 通話ページ（親発信UI / `?mode=raspi` で受信端末モード）
- `js/broadcast-video.js` — WebRTC通話モジュール（nurse-call-voice.jsを流用した独立版）
- `raspi/video-call-kiosk.sh` — ラズパイChromiumキオスク起動スクリプト
- TOP画面アイコン: `video-call`（adminOnly）

### 仕組み
- シグナリング: Supabase Realtime Broadcast、チャネル名 `broadcast-video-call`（ナースコールの `nurse-voice-call` と分離）
- 通話開始時から音声+映像を両方有効（`getUserMedia({ audio:true, video:{facingMode:'user'} })`）
- 状態機械 idle→ringing→connected→ended、renegotiation・ICEキュー・Wake Lock はnurse-callと同等
- 公開API: `window.BroadcastVideo.{ init, startCall, acceptCall, endCall, getState, onStateChange, destroy }`
- video/audio要素ID: `vcRemoteVideo` / `vcLocalVideo` / `vcRemoteAudio`

### ラズパイ受信端末（`?mode=raspi`）
- 着信検知で無条件に `acceptCall()`（子供操作不要でテレビに親が映る）
- Chromiumキオスク: `--kiosk --autoplay-policy=no-user-gesture-required --use-fake-ui-for-media-stream`
- 自動起動は autostart か systemd(--user)（`raspi/video-call-kiosk.sh` 下部コメント参照）

### TURNサーバー（外出先接続に必須）
- 外出先モバイル回線↔自宅NAT間はSTUNのみでは接続不可 → TURN必須
- ICE構成は `game_settings.broadcast_ice_servers`（JSONB）を優先、無ければ `nurse_call_ice_servers` を流用
- 推奨: **metered.ca Open Relay（無料20GB/月）**。他に Cloudflare Calls / 自前coturn(VPS) / Twilio
- 例: `[{ "urls":"stun:stun.l.google.com:19302" }, { "urls":"turn:HOST:443", "username":"U", "credential":"P" }]`
- **設定手順は `docs/video-call-turn-setup.md` 参照**

### ハードウェア
- USBウェブカメラ（マイク内蔵）+ テレビ（HDMI）+ スピーカー
- Pi 5 (2GB) で720pビデオ通話は実用範囲

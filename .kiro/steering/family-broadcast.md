---
inclusion: fileMatch
fileMatchPattern: "*broadcast*,*raspi*"
---

# おうちブロードキャスト

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

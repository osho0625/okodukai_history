---
inclusion: fileMatch
fileMatchPattern: "*broadcast*,*alexa*"
---

# おうちブロードキャスト

## 概要

お小遣い手帳アプリからボタンを押すと、家のAlexaが定型文を読み上げる機能。
Alexaに「分かった」等と返事すると、admin端末にPush通知が届く。

## アーキテクチャ

```
[アプリ] --ボタン押下--> [Voice Monkey API] --> [Echo読み上げ]
                     \--> [Supabase alexa_messages INSERT]
                     \--> [Discord通知]

[Echo] --「分かった」--> [Alexa Custom Skill] --> [Supabase alexa_messages UPDATE]
                                              \--> [Push通知キュー (admin)]
                                              \--> [Discord通知]
```

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `pages/family-broadcast.html` | ブロードキャスト送信UI（admin向け） |
| `alexa/interactionModels/ja-JP.json` | 対話モデル（CheckBroadcastIntent / ReplyOkIntent 追加） |
| `alexa/lambda/index.js` | Lambda（メッセージ確認・返事ハンドラー追加） |
| `sql/003-alexa-broadcast.sql` | テーブル定義 |

## Supabaseテーブル: alexa_messages

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | 自動生成 |
| direction | TEXT | 'to_alexa'（アプリ→Alexa）/ 'from_alexa'（Alexa→アプリ） |
| message | TEXT | メッセージ本文 |
| replied | BOOLEAN | 返事済みフラグ（default: false） |
| reply_text | TEXT | 返事内容（nullable） |
| replied_at | TIMESTAMPTZ | 返事日時（nullable） |
| created_at | TIMESTAMPTZ | 作成日時 |

## Voice Monkey連携

- サービス: [Voice Monkey](https://voicemonkey.io/)
- 無料プラン: スピーカー5台、月200リクエスト
- APIエンドポイント: `POST https://api-v3.voicemonkey.io/announcement`
- 認証: Bearer Token（APIコンソールから取得）
- 設定: localStorageに `vm_api_token` と `vm_device_name` を保存

### Voice Monkey セットアップ手順

1. https://voicemonkey.io でアカウント作成
2. Alexaアプリで「Voice Monkey」スキルを有効化
3. Voice Monkeyコンソールでスピーカーデバイスを作成
4. APIトークンをコピー
5. おうちブロードキャスト画面で初期設定に入力

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

### 送信時（アプリ → Alexa）
1. Voice Monkey APIでEcho読み上げ
2. `alexa_messages` にINSERT（direction: 'to_alexa'）
3. Discord通知

### 返事時（Alexa → アプリ）
1. `alexa_messages` のreplied=trueに更新
2. Discord通知（✅ Alexa返事）
3. Push通知キュー（admin向け）

## デプロイ時の注意

- Voice Monkey APIトークンはブラウザのlocalStorageに保存（サーバー側に保存しない）
- Alexa対話モデル変更後は「モデルを保存」→「モデルをビルド」を忘れない
- Lambdaコード変更後はAlexa Console上で「保存」→「デプロイ」

# Alexa お手伝いポイント申請スキル

## 概要
「アレクサ、お小遣い帳で ○○ の △△ した」でポイント申請ができる。

## 使い方（発話例）
- 「アレクサ、お小遣い帳で りょうすけ の お風呂掃除」
- 「アレクサ、お小遣い帳を開いて めぐみ が 食洗器 した」

## セットアップ

### 1. Alexa Developer Console
1. https://developer.amazon.com/alexa/console/ask でスキル作成
2. `skill.json` と `interactionModels/ja-JP.json` をインポート
3. エンドポイントに Lambda ARN を設定

### 2. AWS Lambda
1. Node.js 20.x ランタイムで Lambda 作成
2. `lambda/` フォルダの内容をデプロイ
3. 環境変数を設定:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `DISCORD_WEBHOOK`
4. Alexa Skills Kit トリガーを追加

### 3. テスト
- Alexa Developer Console のテストタブで日本語テスト可能
- 自分のアカウントに紐づいたEchoデバイスで即テスト可能（公開審査不要）

## ファイル構成
```
alexa/
├── README.md
├── skill.json                    # スキルマニフェスト
├── interactionModels/
│   └── ja-JP.json                # 対話モデル（日本語）
└── lambda/
    ├── index.js                  # Lambda ハンドラー
    └── package.json
```

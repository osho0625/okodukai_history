---
inclusion: fileMatch
fileMatchPattern: "*alexa*"
---

# Alexa スキル: お手伝いポイント申請

## 概要

Echoデバイスから音声でお手伝いポイント申請・残高確認ができるAlexaカスタムスキル。
Alexa-hosted (Node.js) でホスティング。申請は `status: 'pending'` でINSERTされ、admin承認が必要。

- 呼び出し名: `お小遣い帳`
- スキルID: amzn1.ask.skill.915d14f9-4d31-40cd-90f3-3db18fb2cb10
- ホスティング: Alexa-hosted (Node.js)、リージョン: 米国東部
- Alexa Developer Console: https://developer.amazon.com/alexa/console/ask

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `alexa/README.md` | 概要説明 |
| `alexa/SETUP_GUIDE.md` | テスト〜本番運用の手順書 |
| `alexa/skill.json` | スキルマニフェスト（参考用） |
| `alexa/interactionModels/ja-JP.json` | 対話モデル（JSON Editor に貼る） |
| `alexa/lambda/index.js` | Lambda コード（Alexa Console の lambda/index.js に貼る） |
| `alexa/lambda/package.json` | 依存定義（参考用、Alexa-hosted のデフォルトを使う） |

## Intent 一覧

| Intent | スロット | 用途 |
|--------|---------|------|
| `RequestChorePointsIntent` | childName (CHILD_NAME), choreName (CHORE_NAME), pointsCount (AMAZON.NUMBER) | ポイント申請 |
| `CheckBalanceIntent` | childName (CHILD_NAME) | 残高確認 |
| `AMAZON.HelpIntent` | - | 使い方説明 |
| `AMAZON.StopIntent` / `AMAZON.CancelIntent` | - | 終了 |
| `AMAZON.FallbackIntent` | - | 聞き取れなかった時 |

## カスタムスロット

### CHILD_NAME
children テーブルの name に対応。

| 値 |
|----|
| りょうすけ |
| めぐみ |
| はるちか |
| かいせい |
| いろは |

### CHORE_NAME
家事名。synonyms で別の言い方も認識。

| 値 | シノニム |
|----|---------|
| 洗濯機回し | 洗濯回し、洗濯機まわし |
| 洗濯機畳み | 洗濯畳み、洗濯たたみ |
| 料理 | ごはん、りょうり、ご飯作り |
| 掃除機 | そうじき、掃除 |
| ゴミ出し | ゴミ捨て、ごみ出し |
| ゴミまとめ | ごみまとめ、ゴミ集め |
| 片付け | かたづけ、お片付け |
| トイレ掃除 | トイレ |
| 生ごみ | なまごみ、生ゴミ |
| 牛乳パック開き | 牛乳パック、パック開き |
| タオル畳み | タオルたたみ |
| その他 | そのた |

## デフォルトポイント表

コード内 `DEFAULT_POINTS` で定義。発話でポイント数を指定しなかった場合に使用。

| 家事 | pt |
|------|----|
| 洗濯機回し | 1 |
| 洗濯機畳み | 8 |
| 料理 | 3 |
| 掃除機 | 2 |
| ゴミ出し | 2 |
| ゴミまとめ | 2 |
| 片付け | 2 |
| トイレ掃除 | 6 |
| 生ごみ | 1 |
| 牛乳パック開き | 1 |
| その他 | 1 |

## ポイント数決定の優先順位

1. 発話で数値指定（1〜100）→ その値
2. `DEFAULT_POINTS` テーブルにマッチ → その値
3. Supabase `chore_types` テーブルにマッチ → `default_points`
4. いずれにもマッチしない → 1pt

## 家事名省略時の挙動

`choreName` スロットが空の場合、自動的に「その他」（1pt）として申請される。
例: 「はるちかに5ポイント」→ その他 5pt

## 通知フロー

ポイント申請時:
1. `chore_points` に INSERT (`status: 'pending'`)
2. Discord Webhook に `🎤 Alexa申請: ...` を送信
3. `push_messages` に admin 向け Push通知をキュー

## デプロイ時の注意

- Git リポジトリの `alexa/lambda/index.js` は `process.env` で環境変数を参照
- Alexa-hosted では環境変数が使えないため、Alexa Console 上では直書きに変更する
- `lambda/package.json` は Alexa-hosted のデフォルトのまま触らない（壊れる原因）
- 対話モデル変更後は「モデルを保存」→「モデルをビルド」を忘れない

## 発話例

| 発話 | 結果 |
|------|------|
| アレクサ、お小遣い帳を開いて | スキル起動 |
| りょうすけの料理 | 料理 3pt 申請 |
| はるちかにゴミ捨て2ポイント | ゴミ出し 2pt 申請 |
| かいせいに5ポイント | その他 5pt 申請 |
| めぐみの残高 | 残高読み上げ |

## 新しいスキルを追加する際のテンプレート

新しいAlexaスキルを追加する場合:
1. `alexa/` 配下にスキル名のフォルダを作成（例: `alexa/reminder-skill/`）
2. 対話モデル・Lambda コード・README を配置
3. `.kiro/steering/` に専用の steering ファイルを作成（このファイルを参考に）
4. `CONTEXT.md` の機能一覧に追記
5. `alexa/README.md` にスキル一覧として追記
